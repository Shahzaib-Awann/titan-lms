"use server";

import { and, asc, count, desc, eq, inArray, isNotNull, isNull, lte, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { courseBatches, enrollments, quizAnswers, quizAttempts, quizQuestions, quizzes, studentProfiles } from "../db/schema";
import { generateAiQuizSchema, manualQuizSchema } from "../zod/trainer.schema";
import z from "zod";
import { getCurrentUser, requireRole, requireTrainer } from "./auth.action";
import { db } from "../db";
import { notFound } from "next/navigation";
import { AttemptQuizResponse } from "@/types/quizzes";
import { generateQuizQuestions } from "../ai/quiz-generator";

export async function getQuizzesByBatchIdForDataTable(
  batchId: string,
): Promise<{
  success: boolean;
  data?: {
    id: string;
    title: string;
    description: string | null;

    creationMethod: "manual" | "ai";
    durationMinutes: number;
    totalMarks: number;
    status: "draft" | "published" | "closed" | "archived";

    publishedDate: Date | null;
    createdAt: Date;

    questionCount: number;
  }[];
  message?: string;
  error?: string;
}> {
  try {
    await requireRole(["trainer", "admin"]);

    const quizzesData = await db
      .select({
        id: quizzes.id,
        title: quizzes.title,
        description: quizzes.description,

        creationMethod: quizzes.creationMethod,
        durationMinutes: quizzes.durationMinutes,
        totalMarks: quizzes.totalMarks,
        status: quizzes.status,

        publishedDate: quizzes.publishedDate,
        createdAt: quizzes.createdAt,

        questionCount: count(quizQuestions.id),
      })
      .from(quizzes)
      .leftJoin(quizQuestions, eq(quizQuestions.quizId, quizzes.id))
      .where(eq(quizzes.batchId, batchId))
      .groupBy(
        quizzes.id,
        quizzes.title,
        quizzes.description,
        quizzes.creationMethod,
        quizzes.durationMinutes,
        quizzes.totalMarks,
        quizzes.status,
        quizzes.publishedDate,
        quizzes.createdAt,
      )
      .orderBy(desc(quizzes.createdAt));

    return {
      success: true,
      data: quizzesData.map((quiz) => ({
        ...quiz,
        questionCount: Number(quiz.questionCount),
      })),
    };
  } catch (error: unknown) {
    console.error("getBatchQuizzes error:", error);

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Something went wrong while retrieving quizzes.",
    };
  }
}

export async function createOrUpdateQuiz(input: {
  batchId: string;
  payload: z.infer<typeof manualQuizSchema>;
  deletedQuestionIds?: string[];
}): Promise<{
  quizId?: string;
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    const user = await requireRole(["admin", "trainer"]);

    const {
      batchId,
      payload: inputPayload,
      deletedQuestionIds = [],
    } = input;

    const parsed = manualQuizSchema.safeParse(inputPayload);

    if (!parsed.success) {
      return {
        success: false,
        error: "Please fix the validation errors.",
      };
    }

    const payload = parsed.data;
    const isUpdate = Boolean(payload.id);
    const quizId = payload.id ?? nanoid();

    const totalMarks = payload.questions.reduce(
      (total, question) => total + question.marks,
      0,
    );

    const title = payload.title.trim();
    const description = payload.description?.trim() || null;
    const publishedDate = payload.publishedDate
      ? new Date(payload.publishedDate)
      : null;

    const uniqueDeletedQuestionIds = [
      ...new Set(deletedQuestionIds),
    ];

    const payloadQuestionIds = payload.questions
      .map((question) => question.id)
      .filter((id): id is string => Boolean(id));

    const uniqueReferencedQuestionIds = [
      ...new Set([
        ...payloadQuestionIds,
        ...uniqueDeletedQuestionIds,
      ]),
    ];

    const deletedQuestionIdSet = new Set(uniqueDeletedQuestionIds);

    if (
      payloadQuestionIds.some((questionId) =>
        deletedQuestionIdSet.has(questionId),
      )
    ) {
      return {
        success: false,
        error: "A question cannot be updated and deleted at the same time.",
      };
    }

    await db.transaction(async (tx) => {
      if (isUpdate) {
        const [quiz] = await tx
          .select({
            id: quizzes.id,
            batchId: quizzes.batchId,
            creationMethod: quizzes.creationMethod,
          })
          .from(quizzes)
          .where(eq(quizzes.id, quizId))
          .limit(1);

        if (!quiz) {
          throw new Error("Quiz not found.");
        }

        if (quiz.batchId !== batchId) {
          throw new Error("Quiz does not belong to this batch.");
        }

        if (quiz.creationMethod !== "manual") {
          throw new Error("Only manual quizzes can be updated.");
        }
      }

      if (uniqueReferencedQuestionIds.length > 0) {
        const existingQuestions = await tx
          .select({
            id: quizQuestions.id,
            quizId: quizQuestions.quizId,
          })
          .from(quizQuestions)
          .where(
            inArray(
              quizQuestions.id,
              uniqueReferencedQuestionIds,
            ),
          );

        const questionOwnership = new Map(
          existingQuestions.map((question) => [
            question.id,
            question.quizId,
          ]),
        );

        const foreignQuestionId = uniqueReferencedQuestionIds.find(
          (questionId) => {
            const questionQuizId = questionOwnership.get(questionId);

            return questionQuizId !== undefined && questionQuizId !== quizId;
          },
        );

        if (foreignQuestionId) {
          throw new Error(
            "One or more questions do not belong to this quiz.",
          );
        }

        const missingExistingQuestionId = payloadQuestionIds.find(
          (questionId) => !questionOwnership.has(questionId),
        );

        if (missingExistingQuestionId) {
          throw new Error(
            "One or more questions do not belong to this quiz.",
          );
        }
      }

      if (isUpdate) {
        await tx
          .update(quizzes)
          .set({
            title,
            description,
            creationMethod: payload.type,
            durationMinutes: payload.durationMinutes,
            totalMarks,
            status: payload.status,
            publishedDate,
          })
          .where(eq(quizzes.id, quizId));
      } else {
        await tx.insert(quizzes).values({
          id: quizId,
          batchId,
          createdBy: user.id,
          creationMethod: payload.type,
          title,
          description,
          durationMinutes: payload.durationMinutes,
          totalMarks,
          status: payload.status,
          publishedDate,
        });
      }

      if (uniqueDeletedQuestionIds.length > 0) {
        try {
          await tx
            .delete(quizQuestions)
            .where(
              and(
                eq(quizQuestions.quizId, quizId),
                inArray(
                  quizQuestions.id,
                  uniqueDeletedQuestionIds,
                ),
              ),
            );
        } catch (error: unknown) {
          const dbError = error as {
            errno?: number;
            code?: string;
          };

          if (
            dbError.errno === 1451 ||
            dbError.code === "ER_ROW_IS_REFERENCED_2"
          ) {
            throw new Error(
              "One or more questions cannot be deleted because a student has already attempted this quiz. No changes were saved.",
            );
          }

          throw error;
        }
      }

      const questionsToUpdate = payload.questions.filter(
        (question): question is typeof question & { id: string } =>
          Boolean(question.id),
      );

      const questionsToInsert = payload.questions.filter(
        (question) => !question.id,
      );

      for (const question of questionsToUpdate) {
        const options = Object.fromEntries(
          question.options.map((option) => [
            option.id,
            option.text,
          ]),
        );

        await tx
          .update(quizQuestions)
          .set({
            type: question.type,
            question: question.question.trim(),
            optionA: options.a ?? "",
            optionB: options.b ?? "",
            optionC: options.c ?? null,
            optionD: options.d ?? null,
            correctOption: question.correctOption,
            marks: question.marks,
            orderIndex: question.orderIndex,
          })
          .where(
            and(
              eq(quizQuestions.id, question.id),
              eq(quizQuestions.quizId, quizId),
            ),
          );
      }

      if (questionsToInsert.length > 0) {
        await tx.insert(quizQuestions).values(
          questionsToInsert.map((question) => {
            const options = Object.fromEntries(
              question.options.map((option) => [
                option.id,
                option.text,
              ]),
            );

            return {
              id: nanoid(),
              quizId,
              type: question.type,
              question: question.question.trim(),
              optionA: options.a ?? "",
              optionB: options.b ?? "",
              optionC: options.c ?? null,
              optionD: options.d ?? null,
              correctOption: question.correctOption,
              marks: question.marks,
              orderIndex: question.orderIndex,
            };
          }),
        );
      }
    });

    return {
      quizId,
      success: true,
      message: isUpdate
        ? "Quiz updated successfully."
        : "Quiz created successfully.",
    };
  } catch (error: unknown) {
    console.error("createOrUpdateManualQuiz error:", error);

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Something went wrong while saving the quiz.",
    };
  }
}

export async function getQuizForEdit(
  quizId: string,
  batchId: string,
): Promise<{
  success: boolean;
  message?: string;
  error?: string;
  data?: z.infer<typeof manualQuizSchema>;
}> {
  try {
    const user = await requireRole(["admin", "trainer"]);

    const quizConditions = [
      eq(quizzes.id, quizId),
      eq(quizzes.batchId, batchId),
    ];

    if (user.role === "trainer") {
      const { trainer } = await requireTrainer();

      quizConditions.push(eq(courseBatches.trainerId, trainer.id));
    }

    const [quiz] = await db
      .select({
        id: quizzes.id,
        title: quizzes.title,
        description: quizzes.description,
        durationMinutes: quizzes.durationMinutes,
        status: quizzes.status,
        publishedDate: quizzes.publishedDate,
        creationMethod: quizzes.creationMethod,
      })
      .from(quizzes)
      .innerJoin(
        courseBatches,
        eq(quizzes.batchId, courseBatches.id),
      )
      .where(and(...quizConditions))
      .limit(1);

    if (!quiz) {
      notFound();
    }

    if (quiz.creationMethod !== "manual") {
      return {
        success: false,
        error: "Only manual quizzes can be edited.",
      };
    }

    const questions = await db
      .select({
        id: quizQuestions.id,
        type: quizQuestions.type,
        question: quizQuestions.question,
        optionA: quizQuestions.optionA,
        optionB: quizQuestions.optionB,
        optionC: quizQuestions.optionC,
        optionD: quizQuestions.optionD,
        correctOption: quizQuestions.correctOption,
        marks: quizQuestions.marks,
        orderIndex: quizQuestions.orderIndex,
      })
      .from(quizQuestions)
      .where(eq(quizQuestions.quizId, quiz.id))
      .orderBy(asc(quizQuestions.orderIndex));

    const data: z.infer<typeof manualQuizSchema> = {
      id: quiz.id,
      title: quiz.title,
      description: quiz.description ?? "",
      type: quiz.creationMethod,
      durationMinutes: quiz.durationMinutes,
      status: quiz.status as "draft" | "published" | "closed",
      publishedDate: quiz.publishedDate
        ? quiz.publishedDate.toISOString()
        : null,
      questions: questions.map((question) => {
  if (question.type === "boolean") {
    return {
      id: question.id,
      type: "boolean" as const,
      question: question.question,
      options: [
        {
          id: "a" as const,
          text: question.optionA,
        },
        {
          id: "b" as const,
          text: question.optionB,
        },
      ],
      correctOption: question.correctOption as "a" | "b",
      marks: question.marks,
      orderIndex: question.orderIndex,
    };
  }

  return {
    id: question.id,
    type: "mcq" as const,
    question: question.question,
    options: [
      {
        id: "a" as const,
        text: question.optionA,
      },
      {
        id: "b" as const,
        text: question.optionB,
      },
      {
        id: "c" as const,
        text: question.optionC ?? "",
      },
      {
        id: "d" as const,
        text: question.optionD ?? "",
      },
    ],
    correctOption: question.correctOption as "a" | "b" | "c" | "d",
    marks: question.marks,
    orderIndex: question.orderIndex,
  };
}),
    };

    return {
      success: true,
      data,
    };
  } catch (error: unknown) {
    console.error("getManualQuizForEdit error:", error);

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Something went wrong while retrieving the quiz.",
    };
  }
}

export async function getStudentBatchQuizzes(
  batchId: string,
): Promise<{
  success: boolean;
  data?: {
    id: string;
    title: string;
    questionsCount: number;
    is_attempted: boolean;
    attemptId: string | null;
    score: number;
    totalMarks: number;
    percentage: number;
    status:
      | "in_progress"
      | "submitted"
      | "cancelled"
      | "cheated"
      | "not_started";
    durationMinutes: number;
    publishedDate: Date;
    submittedAt: Date | null;
    canAttempt: boolean;
  }[];
  message?: string;
  error?: string;
}> {
  try {
    const user = await requireRole("student");

    const [enrollment] = await db
      .select({
        id: enrollments.id,
      })
      .from(enrollments)
      .innerJoin(
        studentProfiles,
        eq(enrollments.studentId, studentProfiles.id),
      )
      .where(
        and(
          eq(enrollments.batchId, batchId),
          eq(studentProfiles.userId, user.id),
          isNull(studentProfiles.deletedAt),
          isNull(enrollments.deletedAt),
        ),
      )
      .limit(1);

    if (!enrollment) {
      throw new Error("Student is not enrolled in this batch.");
    }

    const questionCounts = db
      .select({
        quizId: quizQuestions.quizId,
        count: count(quizQuestions.id).as("question_count"),
      })
      .from(quizQuestions)
      .innerJoin(
        quizzes,
        eq(quizQuestions.quizId, quizzes.id),
      )
      .where(
        and(
          eq(quizzes.batchId, batchId),
          isNull(quizzes.deletedAt),
        ),
      )
      .groupBy(quizQuestions.quizId)
      .as("question_counts");

    const now = new Date();

    const quizzesData = await db
      .select({
        id: quizzes.id,
        title: quizzes.title,

        questionsCount: questionCounts.count,

        attemptId: quizAttempts.id,
        attemptStatus: quizAttempts.status,
        score: quizAttempts.score,
        submittedAt: quizAttempts.submittedAt,

        totalMarks: quizzes.totalMarks,
        durationMinutes: quizzes.durationMinutes,
        publishedDate: quizzes.publishedDate,
        quizStatus: quizzes.status,
      })
      .from(quizzes)
      .leftJoin(
        questionCounts,
        eq(questionCounts.quizId, quizzes.id),
      )
      .leftJoin(
        quizAttempts,
        and(
          eq(quizAttempts.quizId, quizzes.id),
          eq(quizAttempts.enrollmentId, enrollment.id),
        ),
      )
      .where(
        and(
          eq(quizzes.batchId, batchId),
          inArray(quizzes.status, ["published", "closed"]),
          isNotNull(quizzes.publishedDate),
          lte(quizzes.publishedDate, now),
          isNull(quizzes.deletedAt),
        ),
      )
      .orderBy(asc(quizzes.publishedDate));

    return {
      success: true,
      data: quizzesData.map((quiz) => {
        const isAttempted = Boolean(quiz.attemptId);
        const score = quiz.score ?? 0;

        const percentage =
          quiz.totalMarks > 0
            ? Math.round((score / quiz.totalMarks) * 100)
            : 0;

        return {
          id: quiz.id,
          title: quiz.title,

          questionsCount: Number(quiz.questionsCount ?? 0),

          is_attempted: isAttempted,
          attemptId: quiz.attemptId ?? null,

          score,
          totalMarks: quiz.totalMarks,
          percentage,

          status: quiz.attemptStatus ?? "not_started",

          durationMinutes: quiz.durationMinutes,
          publishedDate: quiz.publishedDate!,
          submittedAt: quiz.submittedAt ?? null,

          canAttempt:
            quiz.quizStatus === "published" && !isAttempted,
        };
      }),
    };
  } catch (error: unknown) {
    console.error("getStudentBatchQuizzes error:", error);

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Something went wrong while retrieving quizzes.",
    };
  }
}

export async function validateQuizAttempt(
  batchId: string,
  quizId: string,
): Promise<{
  success: boolean;
  error?: string;
}> {
  const user = await getCurrentUser();

  if (!user?.id || user.role !== "student") {
    notFound();
  }

  const [validation] = await db
    .select({
      enrollmentId: enrollments.id,
      attemptId: quizAttempts.id,
    })
    .from(studentProfiles)
    .innerJoin(
      enrollments,
      and(
        eq(enrollments.studentId, studentProfiles.id),
        eq(enrollments.batchId, batchId),
        eq(enrollments.status, "active"),
        isNull(enrollments.deletedAt),
      ),
    )
    .innerJoin(
      quizzes,
      and(
        eq(quizzes.id, quizId),
        eq(quizzes.batchId, batchId),
        eq(quizzes.status, "published"),
        isNull(quizzes.deletedAt),
      ),
    )
    .leftJoin(
      quizAttempts,
      and(
        eq(quizAttempts.quizId, quizzes.id),
        eq(quizAttempts.enrollmentId, enrollments.id),
      ),
    )
    .where(
      and(
        eq(studentProfiles.userId, user.id),
        isNull(studentProfiles.deletedAt),
      ),
    )
    .limit(1);

  if (!validation) {
    return {
      success: false,
      error: "You are not enrolled in this batch or quiz is not published.",
    }
  }

  if (validation.attemptId) {
    return {
      success: false,
      error: "You have already attempted this quiz.",
    }
  }

  return {
    success: true,
  };
}

export async function attemptQuizStudent(
  batchId: string,
  quizId: string,
): Promise<AttemptQuizResponse> {
  const user = await getCurrentUser();

  if (!user?.id || user.role !== "student") {
    notFound();
  }

  const [validation] = await db
    .select({
      enrollmentId: enrollments.id,

      quizId: quizzes.id,
      batchId: quizzes.batchId,
      title: quizzes.title,
      description: quizzes.description,
      durationMinutes: quizzes.durationMinutes,
      totalMarks: quizzes.totalMarks,
      status: quizzes.status,
      publishedDate: quizzes.publishedDate,

      existingAttemptId: quizAttempts.id,
    })
    .from(studentProfiles)
    .innerJoin(
      enrollments,
      and(
        eq(enrollments.studentId, studentProfiles.id),
        eq(enrollments.batchId, batchId),
        eq(enrollments.status, "active"),
        isNull(enrollments.deletedAt),
      ),
    )
    .innerJoin(
      quizzes,
      and(
        eq(quizzes.id, quizId),
        eq(quizzes.batchId, batchId),
        eq(quizzes.status, "published"),
        isNull(quizzes.deletedAt),
      ),
    )
    .leftJoin(
      quizAttempts,
      and(
        eq(quizAttempts.quizId, quizzes.id),
        eq(quizAttempts.enrollmentId, enrollments.id),
      ),
    )
    .where(
      and(
        eq(studentProfiles.userId, user.id),
        isNull(studentProfiles.deletedAt),
      ),
    )
    .limit(1);

  if (!validation) {
    notFound();
  }

  if (validation.existingAttemptId) {
    return {
      success: false,
      data: null,
      message: "You have already attempted this quiz.",
      error: "QUIZ_ALREADY_ATTEMPTED",
    };
  }

  const result = await db.transaction(async (tx) => {
    const startedAt = new Date();

    const expiresAt = new Date(
      startedAt.getTime() +
        validation.durationMinutes * 60 * 1000,
    );

    const attemptId = nanoid(21);

    try {
      await tx.insert(quizAttempts).values({
        id: attemptId,
        quizId: validation.quizId,
        enrollmentId: validation.enrollmentId,
        status: "in_progress",
        startedAt,
        submittedAt: null,
        score: null,
        cancelledAt: null,
        cancellationReason: null,
      });
    } catch (error: unknown) {
      const dbError = error as {
        errno?: number;
        code?: string;
      };

      if (
        dbError.errno === 1062 ||
        dbError.code === "ER_DUP_ENTRY"
      ) {
        return null;
      }

      throw error;
    }

    const questions = await tx
      .select({
        id: quizQuestions.id,
        type: quizQuestions.type,
        question: quizQuestions.question,
        optionA: quizQuestions.optionA,
        optionB: quizQuestions.optionB,
        optionC: quizQuestions.optionC,
        optionD: quizQuestions.optionD,
        marks: quizQuestions.marks,
        orderIndex: quizQuestions.orderIndex,
      })
      .from(quizQuestions)
      .where(eq(quizQuestions.quizId, validation.quizId))
      .orderBy(asc(quizQuestions.orderIndex));

    const formattedQuestions = questions.map((question) => {
      const options: {
        id: "a" | "b" | "c" | "d";
        text: string;
      }[] = [
        {
          id: "a",
          text: question.optionA,
        },
        {
          id: "b",
          text: question.optionB,
        },
      ];

      if (question.optionC !== null) {
        options.push({
          id: "c",
          text: question.optionC,
        });
      }

      if (question.optionD !== null) {
        options.push({
          id: "d",
          text: question.optionD,
        });
      }

      return {
        id: question.id,
        type: question.type,
        question: question.question,
        options,
        marks: question.marks,
        orderIndex: question.orderIndex,
      };
    });

    return {
      quiz: {
        id: validation.quizId,
        batchId: validation.batchId,
        title: validation.title,
        description: validation.description,
        durationMinutes: validation.durationMinutes,
        totalMarks: validation.totalMarks,
        status: validation.status,
        publishedDate: validation.publishedDate,
        questionCount: questions.length,
      },

      attempt: {
        id: attemptId,
        status: "in_progress" as const,
        startedAt,
        expiresAt,
        submittedAt: null,
        score: null,
      },

      questions: formattedQuestions,
    };
  });

  if (!result) {
    return {
      success: false,
      data: null,
      message: "You have already attempted this quiz.",
      error: "QUIZ_ALREADY_ATTEMPTED",
    };
  }

  return {
    success: true,
    data: result,
    message: "Quiz attempt started successfully.",
  };
}

export async function submitQuizAttempt(
  payload: {
    batchId: string;
    attemptId: string;
    answers: {
      questionId: string;
      selectedOption: "a" | "b" | "c" | "d" | null;
    }[];
  },
) {
  const user = await getCurrentUser({ fresh: true });

  if (!user) {
    throw new Error("Unauthorized");
  }

  if (user.role !== "student") {
    throw new Error("Only students can submit quizzes");
  }

  if (user.status !== "active") {
    throw new Error("Your account is not active");
  }

  if (!payload?.attemptId) {
    throw new Error("Attempt ID is required");
  }

  if (!Array.isArray(payload.answers)) {
    throw new Error("Answers must be an array");
  }

  const questionIds = payload.answers.map(
    (answer) => answer.questionId,
  );

  if (new Set(questionIds).size !== questionIds.length) {
    throw new Error("Duplicate question IDs are not allowed");
  }

  return db.transaction(async (tx) => {
    const [attempt] = await tx
      .select({
        attemptId: quizAttempts.id,
        attemptStatus: quizAttempts.status,
        startedAt: quizAttempts.startedAt,

        quizId: quizzes.id,
        durationMinutes: quizzes.durationMinutes,

        enrollmentId: enrollments.id,
        enrollmentStatus: enrollments.status,
        batchId: enrollments.batchId,
      })
      .from(quizAttempts)
      .innerJoin(
        quizzes,
        eq(quizAttempts.quizId, quizzes.id),
      )
      .innerJoin(
        enrollments,
        eq(
          quizAttempts.enrollmentId,
          enrollments.id,
        ),
      )
      .innerJoin(
        studentProfiles,
        eq(
          enrollments.studentId,
          studentProfiles.id,
        ),
      )
      .where(
        and(
          eq(quizAttempts.id, payload.attemptId),
          eq(studentProfiles.userId, user.id),
          isNull(studentProfiles.deletedAt),
          eq(enrollments.batchId, payload.batchId),
        ),
      )
      .limit(1);

    if (!attempt) {
      throw new Error("Quiz attempt not found");
    }

    if (attempt.attemptStatus !== "in_progress") {
      throw new Error(
        `This quiz attempt is already ${attempt.attemptStatus}`,
      );
    }

    if (attempt.enrollmentStatus !== "active") {
      throw new Error("Your enrollment is not active");
    }

    const GRACE_PERIOD_MINUTES = 1;

    const deadline = new Date(
      attempt.startedAt.getTime() +
        (attempt.durationMinutes + GRACE_PERIOD_MINUTES) *
          60 *
          1000,
    );

    const now = new Date();

    if (now > deadline) {
      throw new Error("Quiz submission time has expired");
    }

    const questions = await tx
      .select({
        id: quizQuestions.id,
        correctOption: quizQuestions.correctOption,
        marks: quizQuestions.marks,
        orderIndex: quizQuestions.orderIndex,
      })
      .from(quizQuestions)
      .where(eq(quizQuestions.quizId, attempt.quizId))
      .orderBy(asc(quizQuestions.orderIndex));

    if (questions.length === 0) {
      throw new Error("This quiz has no questions");
    }

    const questionMap = new Map(
      questions.map((question) => [
        question.id,
        question,
      ]),
    );

    const submittedAnswers = new Map(
      payload.answers.map((answer) => [
        answer.questionId,
        answer.selectedOption,
      ]),
    );

    for (const questionId of submittedAnswers.keys()) {
      if (!questionMap.has(questionId)) {
        throw new Error(
          `Question ${questionId} does not belong to this quiz`,
        );
      }
    }

    let score = 0;
    let answeredCount = 0;
    let correctCount = 0;

    const answerRows = questions.map((question) => {
      const selectedOption =
        submittedAnswers.get(question.id) ?? null;

      const isCorrect =
        selectedOption !== null &&
        selectedOption === question.correctOption;

      const marksAwarded = isCorrect
        ? question.marks
        : 0;

      if (selectedOption !== null) {
        answeredCount++;
      }

      if (isCorrect) {
        correctCount++;
        score += marksAwarded;
      }

      return {
        id: nanoid(21),
        attemptId: attempt.attemptId,
        questionId: question.id,
        selectedOption,
        isCorrect,
        marksAwarded,
      };
    });

    const questionCount = questions.length;
    const unansweredCount =
      questionCount - answeredCount;
    const incorrectCount =
      answeredCount - correctCount;

    const totalMarks = questions.reduce(
      (total, question) =>
        total + question.marks,
      0,
    );

    const percentage =
      totalMarks > 0
        ? Number(
            ((score / totalMarks) * 100).toFixed(2),
          )
        : 0;

    const submittedAt = new Date();

    await tx.insert(quizAnswers).values(answerRows);

    const updateResult = await tx
      .update(quizAttempts)
      .set({
        status: "submitted",
        submittedAt,
        score,
        updatedAt: submittedAt,
      })
      .where(
        and(
          eq(quizAttempts.id, attempt.attemptId),
          eq(
            quizAttempts.status,
            "in_progress",
          ),
        ),
      );

    if (updateResult[0]?.affectedRows !== 1) {
      throw new Error(
        "This quiz attempt has already been submitted.",
      );
    }

    return {
      success: true,

      attempt: {
        id: attempt.attemptId,
        quizId: attempt.quizId,
        batchId: attempt.batchId,

        status: "submitted",

        startedAt: attempt.startedAt,
        submittedAt,

        deadline,

        durationMinutes:
          attempt.durationMinutes,

        gracePeriodMinutes:
          GRACE_PERIOD_MINUTES,
      },

      result: {
        score,
        totalMarks,
        percentage,

        questionCount,

        answeredCount,
        unansweredCount,

        correctCount,
        incorrectCount,
      },
    };
  });
}

export async function cancelQuizAttempt(
  payload: {
    batchId: string;
    attemptId: string;
    cancellationReason: string;
    answers: {
      questionId: string;
      selectedOption: "a" | "b" | "c" | "d" | null;
    }[];
  },
) {
  const user = await getCurrentUser({ fresh: true });

  if (!user) {
    throw new Error("Unauthorized");
  }

  if (user.role !== "student") {
    throw new Error("Only students can cancel quizzes");
  }

  if (user.status !== "active") {
    throw new Error("Your account is not active");
  }

  if (!payload?.attemptId) {
    throw new Error("Attempt ID is required");
  }

  if (!payload?.batchId) {
    throw new Error("Batch ID is required");
  }

  if (!payload?.cancellationReason?.trim()) {
    throw new Error("Cancellation reason is required");
  }

  if (!Array.isArray(payload.answers)) {
    throw new Error("Answers must be an array");
  }

  const questionIds = payload.answers.map(
    (answer) => answer.questionId,
  );

  if (new Set(questionIds).size !== questionIds.length) {
    throw new Error("Duplicate question IDs are not allowed");
  }

  return db.transaction(async (tx) => {
    /**
     * Verify that this attempt:
     * - belongs to the authenticated student
     * - belongs to the requested batch
     * - is still in progress
     */
    const [attempt] = await tx
      .select({
        attemptId: quizAttempts.id,
        attemptStatus: quizAttempts.status,
        startedAt: quizAttempts.startedAt,

        quizId: quizzes.id,
        durationMinutes: quizzes.durationMinutes,

        enrollmentId: enrollments.id,
        enrollmentStatus: enrollments.status,
        batchId: enrollments.batchId,
      })
      .from(quizAttempts)
      .innerJoin(
        quizzes,
        eq(
          quizAttempts.quizId,
          quizzes.id,
        ),
      )
      .innerJoin(
        enrollments,
        eq(
          quizAttempts.enrollmentId,
          enrollments.id,
        ),
      )
      .innerJoin(
        studentProfiles,
        eq(
          enrollments.studentId,
          studentProfiles.id,
        ),
      )
      .where(
        and(
          eq(
            quizAttempts.id,
            payload.attemptId,
          ),
          eq(
            studentProfiles.userId,
            user.id,
          ),
          isNull(studentProfiles.deletedAt),
          eq(
            enrollments.batchId,
            payload.batchId,
          ),
        ),
      )
      .limit(1);

    if (!attempt) {
      throw new Error("Quiz attempt not found");
    }

    if (attempt.attemptStatus !== "in_progress") {
      throw new Error(
        `This quiz attempt is already ${attempt.attemptStatus}`,
      );
    }

    if (attempt.enrollmentStatus !== "active") {
      throw new Error("Your enrollment is not active");
    }

    /**
     * Get all questions belonging to this quiz.
     */
    const questions = await tx
      .select({
        id: quizQuestions.id,
        correctOption: quizQuestions.correctOption,
        marks: quizQuestions.marks,
        orderIndex: quizQuestions.orderIndex,
      })
      .from(quizQuestions)
      .where(
        eq(
          quizQuestions.quizId,
          attempt.quizId,
        ),
      )
      .orderBy(
        asc(quizQuestions.orderIndex),
      );

    if (questions.length === 0) {
      throw new Error(
        "This quiz has no questions",
      );
    }

    const questionMap = new Map(
      questions.map((question) => [
        question.id,
        question,
      ]),
    );

    /**
     * Convert submitted answers into a Map
     * for quick lookup.
     */
    const submittedAnswers = new Map(
      payload.answers.map((answer) => [
        answer.questionId,
        answer.selectedOption,
      ]),
    );

    /**
     * Make sure the client hasn't submitted
     * questions from another quiz.
     */
    for (const questionId of submittedAnswers.keys()) {
      if (!questionMap.has(questionId)) {
        throw new Error(
          `Question ${questionId} does not belong to this quiz`,
        );
      }
    }

    /**
     * Store the student's current progress.
     *
     * We create a row for every question, including
     * unanswered questions.
     *
     * This means that after cancellation you can
     * reconstruct exactly what the student had selected.
     */
    const answerRows = questions.map(
      (question) => {
        const selectedOption =
          submittedAnswers.get(
            question.id,
          ) ?? null;

        const isCorrect =
          selectedOption !== null &&
          selectedOption ===
            question.correctOption;

        const marksAwarded = isCorrect
          ? question.marks
          : 0;

        return {
          id: nanoid(21),

          attemptId: attempt.attemptId,
          questionId: question.id,

          selectedOption,

          isCorrect,
          marksAwarded,
        };
      },
    );

    const cancelledAt = new Date();

    /**
     * Save the current answers/progress.
     */
    await tx
      .insert(quizAnswers)
      .values(answerRows);

    /**
     * Cancel the attempt.
     *
     * We intentionally don't set score here because
     * this attempt was cancelled rather than submitted.
     */
    const updateResult = await tx
      .update(quizAttempts)
      .set({
        status: "cancelled",

        cancelledAt,

        cancellationReason:
          payload.cancellationReason.trim(),

        updatedAt: cancelledAt,
      })
      .where(
        and(
          eq(
            quizAttempts.id,
            attempt.attemptId,
          ),
          eq(
            quizAttempts.status,
            "in_progress",
          ),
        ),
      );

    if (updateResult[0]?.affectedRows !== 1) {
      throw new Error(
        "This quiz attempt has already been cancelled or submitted.",
      );
    }

    /**
     * Calculate progress information.
     *
     * This is NOT treated as the final score.
     * It is only useful for reporting what the
     * student had completed before cancellation.
     */
    let answeredCount = 0;
    let correctCount = 0;

    for (const row of answerRows) {
      if (row.selectedOption !== null) {
        answeredCount++;
      }

      if (row.isCorrect) {
        correctCount++;
      }
    }

    const questionCount = questions.length;

    const unansweredCount =
      questionCount - answeredCount;

    const incorrectCount =
      answeredCount - correctCount;

    return {
      success: true,

      attempt: {
        id: attempt.attemptId,
        quizId: attempt.quizId,
        batchId: attempt.batchId,

        status: "cancelled",

        startedAt: attempt.startedAt,
        cancelledAt,

        durationMinutes:
          attempt.durationMinutes,

        cancellationReason:
          payload.cancellationReason.trim(),
      },

      progress: {
        questionCount,

        answeredCount,
        unansweredCount,

        correctCount,
        incorrectCount,
      },
    };
  });
}

export async function getQuizAttemptResult(
  attemptId: string,
) {
  const user = await getCurrentUser({
    fresh: true,
  });

  if (!user) {
    throw new Error("Unauthorized");
  }

  const [attempt] = await db
    .select({
      attemptId: quizAttempts.id,
      attemptStatus: quizAttempts.status,
      startedAt: quizAttempts.startedAt,
      submittedAt: quizAttempts.submittedAt,

      cancelledAt: quizAttempts.cancelledAt,
      cancellationReason:
        quizAttempts.cancellationReason,

      score: quizAttempts.score,

      quizId: quizzes.id,
      quizTitle: quizzes.title,
      quizDescription: quizzes.description,
      durationMinutes: quizzes.durationMinutes,
      totalMarks: quizzes.totalMarks,

      studentId: studentProfiles.id,
      studentRollNumber: studentProfiles.rollNumber,

      totalQuestions: sql<number>`
        (
          SELECT COUNT(*)
          FROM ${quizQuestions}
          WHERE ${quizQuestions.quizId} = ${quizzes.id}
        )
      `,
    })
    .from(quizAttempts)
    .innerJoin(
      enrollments,
      eq(quizAttempts.enrollmentId, enrollments.id),
    )
    .innerJoin(
      studentProfiles,
      eq(enrollments.studentId, studentProfiles.id),
    )
    .innerJoin(
      quizzes,
      eq(quizAttempts.quizId, quizzes.id),
    )
    .where(
      and(
        eq(quizAttempts.id, attemptId),
        eq(studentProfiles.userId, user.id),
        isNull(studentProfiles.deletedAt),
      ),
    )
    .limit(1);

  if (!attempt) {
    notFound();
  }

  const [statistics] = await db
    .select({
      answeredCount: sql<number>`
        COALESCE(
          SUM(
            CASE
              WHEN ${quizAnswers.selectedOption} IS NOT NULL
              THEN 1
              ELSE 0
            END
          ),
          0
        )
      `,

      correctCount: sql<number>`
        COALESCE(
          SUM(
            CASE
              WHEN ${quizAnswers.isCorrect} = 1
              THEN 1
              ELSE 0
            END
          ),
          0
        )
      `,

      answerScore: sql<number>`
        COALESCE(
          SUM(${quizAnswers.marksAwarded}),
          0
        )
      `,
    })
    .from(quizAnswers)
    .where(
      eq(quizAnswers.attemptId, attempt.attemptId),
    );

  const totalQuestions = Math.max(
    Number(attempt.totalQuestions ?? 0),
    0,
  );

  const answeredCount = Math.max(
    Number(statistics?.answeredCount ?? 0),
    0,
  );

  const correctCount = Math.max(
    Number(statistics?.correctCount ?? 0),
    0,
  );

  const unansweredCount = Math.max(
    totalQuestions - answeredCount,
    0,
  );

  const incorrectCount = Math.max(
    answeredCount - correctCount,
    0,
  );

  const score =
    attempt.score ??
    Number(statistics?.answerScore ?? 0);

  const totalMarks = Math.max(
    Number(attempt.totalMarks ?? 0),
    0,
  );

  const percentage =
    totalMarks > 0
      ? Number(
          ((score / totalMarks) * 100).toFixed(2),
        )
      : 0;

  let grade: string;

  if (percentage >= 90) {
    grade = "A+";
  } else if (percentage >= 80) {
    grade = "A";
  } else if (percentage >= 70) {
    grade = "B";
  } else if (percentage >= 60) {
    grade = "C";
  } else if (percentage >= 50) {
    grade = "D";
  } else {
    grade = "F";
  }

  let performance: string;

  if (percentage >= 90) {
    performance = "Outstanding";
  } else if (percentage >= 80) {
    performance = "Excellent";
  } else if (percentage >= 70) {
    performance = "Good";
  } else if (percentage >= 60) {
    performance = "Satisfactory";
  } else if (percentage >= 50) {
    performance = "Needs Improvement";
  } else {
    performance = "Poor";
  }

  const passed = percentage >= 50;

  return {
    student: {
      id: attempt.studentId,
      fullName: user.fullName,
      rollNumber: attempt.studentRollNumber,
    },

    quiz: {
      id: attempt.quizId,
      title: attempt.quizTitle,
      description: attempt.quizDescription,
      durationMinutes: attempt.durationMinutes,
      totalQuestions,
      totalMarks,
    },

    attempt: {
      id: attempt.attemptId,
      status: attempt.attemptStatus,

      startedAt: attempt.startedAt,
      submittedAt: attempt.submittedAt,

      cancelledAt: attempt.cancelledAt,
      cancellationReason: attempt.cancellationReason,

      score,
      totalMarks,
      percentage,

      correctCount,
      incorrectCount,
      unansweredCount,
      answeredCount,
    },

    result: {
      grade,
      performance,
      passed,
    },
  };
}

export async function generateAiQuiz(input: {
  batchId: string;
  prompt: string;
  questionCount: number;
  difficulty: "easy" | "medium" | "hard";
}) {
  try {
    await requireRole("trainer");

    const parsed = generateAiQuizSchema.parse(input);

    // Important:
    // Verify trainer actually owns/teaches this batch.
    // Do this before calling Groq.

    const result = await generateQuizQuestions({
      prompt: parsed.prompt,
      questionCount: parsed.questionCount,
      difficulty: parsed.difficulty,
    });

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("AI quiz generation error:", error);

    return {
      success: false,
      error: "Failed to generate quiz questions.",
    };
  }
}