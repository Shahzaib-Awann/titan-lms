"use server";

import { and, asc, count, desc, eq, inArray, isNotNull, isNull, lte } from "drizzle-orm";
import { nanoid } from "nanoid";
import { courseBatches, enrollments, quizAnswers, quizAttempts, quizQuestions, quizzes, studentProfiles } from "../db/schema";
import { manualQuizSchema } from "../zod/trainer.schema";
import z from "zod";
import { getCurrentUser, requireRole, requireTrainer } from "./auth.action";
import { db } from "../db";
import { notFound } from "next/navigation";
import { AttemptQuizResponse } from "@/types/quizzes";

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

export async function createOrUpdateManualQuiz(input: {
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

    const { batchId, payload: inputPayload, deletedQuestionIds = [] } = input;

    const parsed = manualQuizSchema.safeParse(inputPayload);

    if (!parsed.success) {
      return {
        success: false,
        error: "Please fix the validation errors.",
      };
    }

    const payload = parsed.data;

    const totalMarks = payload.questions.reduce(
      (sum, question) => sum + question.marks,
      0,
    );

    let quizId = payload.id;

    await db.transaction(async (tx) => {
      // Create quiz
      if (!quizId) {
        quizId = nanoid();

        await tx.insert(quizzes).values({
          id: quizId,
          batchId,
          createdBy: user.id,
          creationMethod: "manual",
          title: payload.title.trim(),
          description: payload.description?.trim() || null,
          durationMinutes: payload.durationMinutes,
          totalMarks,
          status: payload.status,
          publishedDate: payload.publishedDate
            ? new Date(payload.publishedDate)
            : null,
        });
      } else {
        // Update quiz
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

        await tx
          .update(quizzes)
          .set({
            title: payload.title.trim(),
            description: payload.description?.trim() || null,
            durationMinutes: payload.durationMinutes,
            totalMarks,
            status: payload.status,
            publishedDate: payload.publishedDate
              ? new Date(payload.publishedDate)
              : null,
          })
          .where(eq(quizzes.id, quizId));
      }

      // Delete requested questions
      if (deletedQuestionIds.length) {
        try {
          await tx
            .delete(quizQuestions)
            .where(
              and(
                eq(quizQuestions.quizId, quizId),
                inArray(quizQuestions.id, deletedQuestionIds),
              ),
            );
        } catch (error: unknown) {
          if (
            typeof error === "object" &&
            error !== null &&
            "errno" in error &&
            (error as { errno?: number }).errno === 1451
          ) {
            throw new Error(
              "One or more questions cannot be deleted because a student has already attempted this quiz. No changes were saved.",
            );
          }

          if (
            typeof error === "object" &&
            error !== null &&
            "code" in error &&
            (error as { code?: string }).code === "ER_ROW_IS_REFERENCED_2"
          ) {
            throw new Error(
              "One or more questions cannot be deleted because a student has already attempted this quiz. No changes were saved.",
            );
          }

          throw error;
        }
      }

      // Update existing + insert new questions
      for (const question of payload.questions) {
        const options = Object.fromEntries(
          question.options.map((option) => [option.id, option.text]),
        );

        const data = {
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

        if (question.id) {
          await tx
            .update(quizQuestions)
            .set(data)
            .where(eq(quizQuestions.id, question.id));
        } else {
          await tx.insert(quizQuestions).values({
            id: nanoid(),
            quizId,
            ...data,
          });
        }
      }
    });

    return {
      quizId: quizId ?? undefined,
      success: true,
      message: payload.id
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

export async function getManualQuizForEdit(
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

    const [quiz] = await db
      .select({
        id: quizzes.id,
        batchId: quizzes.batchId,
        title: quizzes.title,
        description: quizzes.description,
        durationMinutes: quizzes.durationMinutes,

        status: quizzes.status,
        publishedDate: quizzes.publishedDate,

        creationMethod: quizzes.creationMethod,
        trainerId: courseBatches.trainerId,
      })
      .from(quizzes)
      .innerJoin(courseBatches, eq(quizzes.batchId, courseBatches.id))
      .where(and(eq(quizzes.id, quizId), eq(quizzes.batchId, batchId)))
      .limit(1);

    // Quiz does not exist or does not belong to this batch.
    if (!quiz) {
      notFound();
    }

    // This action is only for manually created quizzes.
    if (quiz.creationMethod !== "manual") {
      return {
        success: false,
        error: "Only manual quizzes can be edited.",
      };
    }

    // Trainer can only access quizzes from their own batch.
    if (user.role === "trainer") {
      const { trainer } = await requireTrainer();

      if (quiz.trainerId !== trainer.id) {
        notFound();
      }
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

    const payload: z.infer<typeof manualQuizSchema> = {
      id: quiz.id,

      title: quiz.title,

      description: quiz.description ?? "",

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
      data: payload,
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
    | "cheated" | "not_started";

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

    const [student] = await db
      .select({
        id: studentProfiles.id,
      })
      .from(studentProfiles)
      .where(
        and(
          eq(studentProfiles.userId, user.id),
          isNull(studentProfiles.deletedAt),
        ),
      )
      .limit(1);

    if (!student) {
      throw new Error("Student profile not found.");
    }

    const [enrollment] = await db
      .select({
        id: enrollments.id,
      })
      .from(enrollments)
      .where(
        and(
          eq(enrollments.batchId, batchId),
          eq(enrollments.studentId, student.id),
          isNull(enrollments.deletedAt),
        ),
      )
      .limit(1);

    if (!enrollment) {
      throw new Error("Student is not enrolled in this batch.");
    }

    const now = new Date();

    const quizzesData = await db
      .select({
        id: quizzes.id,
        title: quizzes.title,

        questionsCount: count(quizQuestions.id),

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
        quizQuestions,
        eq(quizQuestions.quizId, quizzes.id),
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

          // Only published and closed quizzes
          inArray(quizzes.status, ["published", "closed"]),

          // Quiz must have a publication date
          isNotNull(quizzes.publishedDate),

          // Quiz becomes visible only when publishedDate is reached
          lte(quizzes.publishedDate, now),

          isNull(quizzes.deletedAt),
        ),
      )
      .groupBy(
        quizzes.id,
        quizzes.title,
        quizzes.totalMarks,
        quizzes.durationMinutes,
        quizzes.publishedDate,
        quizzes.status,

        quizAttempts.id,
        quizAttempts.status,
        quizAttempts.score,
        quizAttempts.submittedAt,
      )
      .orderBy(asc(quizzes.publishedDate));

    return {
      success: true,

      data: quizzesData.map((quiz) => {
        const isAttempted = !!quiz.attemptId;

        const score = quiz.score ?? 0;

        const percentage =
          quiz.totalMarks > 0
            ? Math.round((score / quiz.totalMarks) * 100)
            : 0;

        return {
          id: quiz.id,
          title: quiz.title,

          questionsCount: Number(quiz.questionsCount),

          is_attempted: isAttempted,

          attemptId: quiz.attemptId ?? null,

          score,

          totalMarks: quiz.totalMarks,

          percentage,

          status: quiz.attemptStatus ?? "not_started",

          durationMinutes: quiz.durationMinutes,

          publishedDate: quiz.publishedDate!,

          submittedAt: quiz.submittedAt ?? null,

          // Student gets only ONE attempt.
          canAttempt:
            quiz.quizStatus === "published" &&
            !isAttempted,
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
): Promise<{ success: boolean; error?: string; }> {
  const user = await getCurrentUser();

  if (!user?.id || user.role !== "student") {
    notFound();
  }

  const [student] = await db
    .select({
      id: studentProfiles.id,
    })
    .from(studentProfiles)
    .where(
      and(
        eq(studentProfiles.userId, user.id),
        isNull(studentProfiles.deletedAt),
      ),
    )
    .limit(1);

  if (!student) {
    notFound();
  }

  const [enrollment] = await db
    .select({
      id: enrollments.id,
    })
    .from(enrollments)
    .where(
      and(
        eq(enrollments.batchId, batchId),
        eq(enrollments.studentId, student.id),
        isNull(enrollments.deletedAt),
        eq(enrollments.status, "active"),
      ),
    )
    .limit(1);

  if (!enrollment) {
    notFound();
  }

  const [quiz] = await db
    .select({
      id: quizzes.id,
    })
    .from(quizzes)
    .where(
      and(
        eq(quizzes.id, quizId),
        eq(quizzes.batchId, batchId),
        eq(quizzes.status, "published"),
        isNull(quizzes.deletedAt),
      ),
    )
    .limit(1);

  if (!quiz) {
    notFound();
  }

  const [existingAttempt] = await db
    .select({
      id: quizAttempts.id,
    })
    .from(quizAttempts)
    .where(
      and(
        eq(quizAttempts.quizId, quiz.id),
        eq(quizAttempts.enrollmentId, enrollment.id),
      ),
    )
    .limit(1);

  if (existingAttempt) {
    notFound();
  }

  return {
    success: true,
  };
}

export async function attemptQuizStudent(
  batchId: string,
  quizId: string,
): Promise<AttemptQuizResponse> {
  try {
    /**
     * ---------------------------------------------------------
     * 1. Authenticate user
     * ---------------------------------------------------------
     */
    const user = await getCurrentUser();

    if (!user?.id || user.role !== "student") {
      notFound();
    }

    /**
     * ---------------------------------------------------------
     * 3. Get student profile
     * ---------------------------------------------------------
     */
    const [student] = await db
      .select({
        id: studentProfiles.id,
      })
      .from(studentProfiles)
      .where(
        and(
          eq(studentProfiles.userId, user.id),
          isNull(studentProfiles.deletedAt),
        ),
      )
      .limit(1);

    if (!student) {
      notFound();
    }

    /**
     * ---------------------------------------------------------
     * 4. Verify student belongs to this batch
     *
     * The enrollment connects:
     *
     * studentProfiles -> enrollments -> courseBatches
     * ---------------------------------------------------------
     */
    const [enrollment] = await db
      .select({
        id: enrollments.id,
      })
      .from(enrollments)
      .where(
        and(
          eq(enrollments.batchId, batchId),
          eq(enrollments.studentId, student.id),
          isNull(enrollments.deletedAt),
          eq(enrollments.status, "active"),
        ),
      );

    if (!enrollment) {
      notFound();
    }

    /**
     * ---------------------------------------------------------
     * 5. Verify quiz exists, belongs to batch and is published
     * ---------------------------------------------------------
     */
    const [quiz] = await db
      .select({
        id: quizzes.id,
        batchId: quizzes.batchId,
        title: quizzes.title,
        description: quizzes.description,
        durationMinutes: quizzes.durationMinutes,
        totalMarks: quizzes.totalMarks,
        status: quizzes.status,
        publishedDate: quizzes.publishedDate,
      })
      .from(quizzes)
      .where(
        and(
          eq(quizzes.id, quizId),
          eq(quizzes.batchId, batchId),
          eq(quizzes.status, "published"),
          isNull(quizzes.deletedAt),
        ),
      )
      .limit(1);

    if (!quiz) {
      notFound();
    }

    /**
     * ---------------------------------------------------------
     * 6. Check whether this student already attempted this quiz
     *
     * Because quizAttempts has:
     *
     * unique(quizId, enrollmentId)
     *
     * there can only be ONE attempt per student/enrollment.
     * ---------------------------------------------------------
     */
    const [existingAttempt] = await db
      .select({
        id: quizAttempts.id,
      })
      .from(quizAttempts)
      .where(
        and(
          eq(quizAttempts.quizId, quiz.id),
          eq(quizAttempts.enrollmentId, enrollment.id),
        ),
      )
      .limit(1);

    /**
     * The caller specifically asked not to return quiz data
     * or create another attempt if one already exists.
     */
    if (existingAttempt) {
      return {
        success: false,
        data: null,
        message: "You have already attempted this quiz.",
        error: "QUIZ_ALREADY_ATTEMPTED",
      };
    }

    /**
     * ---------------------------------------------------------
     * 7. Create attempt + fetch questions atomically
     * ---------------------------------------------------------
     */
    const result = await db.transaction(async (tx) => {
      /**
       * Re-check inside the transaction.
       *
       * This protects against two simultaneous requests from
       * creating two attempts.
       */
      const [attemptAlreadyExists] = await tx
        .select({
          id: quizAttempts.id,
        })
        .from(quizAttempts)
        .where(
          and(
            eq(quizAttempts.quizId, quiz.id),
            eq(quizAttempts.enrollmentId, enrollment.id),
          ),
        )
        .limit(1);

      if (attemptAlreadyExists) {
        return null;
      }

      /**
       * Fetch questions.
       *
       * IMPORTANT:
       * Do NOT select correctOption here because this response
       * is being sent to the student.
       */
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
        .where(eq(quizQuestions.quizId, quiz.id))
        .orderBy(quizQuestions.orderIndex);

      /**
       * Count questions.
       */
      const [questionCountResult] = await tx
        .select({
          count: count(quizQuestions.id),
        })
        .from(quizQuestions)
        .where(eq(quizQuestions.quizId, quiz.id));

      /**
       * Attempt starts NOW.
       */
      const startedAt = new Date();

      /**
       * Calculate expiration from quiz duration.
       */
      const expiresAt = new Date(
        startedAt.getTime() + quiz.durationMinutes * 60 * 1000,
      );

      const attemptId = nanoid(21);

      /**
       * Create quiz attempt.
       */
      await tx.insert(quizAttempts).values({
        id: attemptId,
        quizId: quiz.id,
        enrollmentId: enrollment.id,

        status: "in_progress",

        startedAt,
        submittedAt: null,
        score: null,

        cancelledAt: null,
        cancellationReason: null,
      });

      /**
       * Transform database question structure into the API
       * response structure.
       */
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
          id: quiz.id,
          batchId: quiz.batchId,
          title: quiz.title,
          description: quiz.description,
          durationMinutes: quiz.durationMinutes,
          totalMarks: quiz.totalMarks,
          status: quiz.status,
          publishedDate: quiz.publishedDate,
          questionCount: Number(questionCountResult?.count ?? 0),
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

    /**
     * Another request won the race and created the attempt first.
     */
    if (!result) {
      return {
        success: false,
        data: null,
        message: "You have already attempted this quiz.",
        error: "QUIZ_ALREADY_ATTEMPTED",
      };
    }

    /**
     * ---------------------------------------------------------
     * 8. Successful response
     * ---------------------------------------------------------
     */
    return {
      success: true,
      data: result,
      message: "Quiz attempt started successfully.",
    };
  } catch (error) {
    /**
     * Next.js notFound() throws internally.
     * Do not convert it into our generic error response.
     */
    throw error;
  }
}

export async function submitQuizAttempt(
  payload: {
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

  /*
   * Prevent duplicate question IDs in the request.
   *
   * Example of invalid payload:
   *
   * answers: [
   *   { questionId: "q1", selectedOption: "a" },
   *   { questionId: "q1", selectedOption: "c" }
   * ]
   */
  const submittedQuestionIds = payload.answers.map(
    (answer) => answer.questionId,
  );

  const uniqueQuestionIds = new Set(submittedQuestionIds);

  if (uniqueQuestionIds.size !== submittedQuestionIds.length) {
    throw new Error("Duplicate question IDs are not allowed");
  }

  return await db.transaction(async (tx) => {
    /*
     * ---------------------------------------------------------
     * 1. Find the student's profile
     * ---------------------------------------------------------
     */

    const [student] = await tx
      .select({
        id: studentProfiles.id,
      })
      .from(studentProfiles)
      .where(
        and(
          eq(studentProfiles.userId, user.id),
          isNull(studentProfiles.deletedAt),
        ),
      )
      .limit(1);

    if (!student) {
      throw new Error("Student profile not found");
    }

    /*
     * ---------------------------------------------------------
     * 2. Get the attempt + quiz + enrollment
     * ---------------------------------------------------------
     */

    const [attempt] = await tx
      .select({
        attemptId: quizAttempts.id,

        attemptStatus: quizAttempts.status,
        startedAt: quizAttempts.startedAt,
        submittedAt: quizAttempts.submittedAt,

        quizId: quizzes.id,
        quizTitle: quizzes.title,
        durationMinutes: quizzes.durationMinutes,
        quizTotalMarks: quizzes.totalMarks,
        quizStatus: quizzes.status,

        enrollmentId: enrollments.id,
        enrollmentStatus: enrollments.status,
        enrollmentStudentId: enrollments.studentId,

        batchId: courseBatches.id,
      })
      .from(quizAttempts)
      .innerJoin(
        quizzes,
        eq(quizAttempts.quizId, quizzes.id),
      )
      .innerJoin(
        enrollments,
        eq(quizAttempts.enrollmentId, enrollments.id),
      )
      .innerJoin(
        courseBatches,
        eq(enrollments.batchId, courseBatches.id),
      )
      .where(
        and(
          eq(quizAttempts.id, payload.attemptId),
          eq(enrollments.studentId, student.id),
        ),
      )
      .limit(1);

    if (!attempt) {
      throw new Error("Quiz attempt not found");
    }

    /*
     * ---------------------------------------------------------
     * 3. Make sure this attempt is still active
     * ---------------------------------------------------------
     */

    if (attempt.attemptStatus !== "in_progress") {
      throw new Error(
        `This quiz attempt is already ${attempt.attemptStatus}`,
      );
    }

    if (attempt.enrollmentStatus !== "active") {
      throw new Error("Your enrollment is not active");
    }

    /*
     * ---------------------------------------------------------
     * 4. Calculate quiz deadline
     *
     * deadline =
     * startedAt
     * + durationMinutes
     * + 1 minute grace period
     * ---------------------------------------------------------
     */

    const GRACE_PERIOD_MINUTES = 1;

    const deadline = new Date(
      attempt.startedAt.getTime() +
        (attempt.durationMinutes + GRACE_PERIOD_MINUTES) *
          60 *
          1000,
    );

    const now = new Date();

    /*
     * Example:
     *
     * startedAt = 10:00
     * duration = 30 minutes
     * grace    = 1 minute
     *
     * deadline = 10:31
     *
     * Submission at 10:30:59 -> accepted
     * Submission at 10:31:00 -> accepted/depending on exact policy
     * Submission after 10:31 -> rejected
     */

    if (now > deadline) {
      throw new Error(
        "Quiz submission time has expired",
      );
    }

    /*
     * ---------------------------------------------------------
     * 5. Get ALL questions belonging to this quiz
     * ---------------------------------------------------------
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
        eq(quizQuestions.quizId, attempt.quizId),
      );

    if (questions.length === 0) {
      throw new Error("This quiz has no questions");
    }

    /*
     * ---------------------------------------------------------
     * 6. Make sure submitted questions actually belong
     *    to this quiz.
     * ---------------------------------------------------------
     */

    const questionMap = new Map(
      questions.map((question) => [
        question.id,
        question,
      ]),
    );

    for (const answer of payload.answers) {
      const question = questionMap.get(
        answer.questionId,
      );

      if (!question) {
        throw new Error(
          `Question ${answer.questionId} does not belong to this quiz`,
        );
      }
    }

    /*
     * ---------------------------------------------------------
     * 7. Create a map of submitted answers
     * ---------------------------------------------------------
     */

    const submittedAnswersMap = new Map(
      payload.answers.map((answer) => [
        answer.questionId,
        answer.selectedOption,
      ]),
    );

    /*
     * ---------------------------------------------------------
     * 8. Calculate every question
     *
     * IMPORTANT:
     *
     * correctOption comes from DB.
     *
     * It is NEVER trusted from the client.
     * ---------------------------------------------------------
     */

    const answerRows = questions.map((question) => {
      const selectedOption =
        submittedAnswersMap.get(question.id) ?? null;

      const isCorrect =
        selectedOption !== null &&
        selectedOption === question.correctOption;

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
    });

    /*
     * ---------------------------------------------------------
     * 9. Calculate final score
     * ---------------------------------------------------------
     */

    const score = answerRows.reduce(
      (total, answer) =>
        total + answer.marksAwarded,
      0,
    );

    /*
     * ---------------------------------------------------------
     * 10. Calculate statistics
     * ---------------------------------------------------------
     */

    const answeredCount = answerRows.filter(
      (answer) => answer.selectedOption !== null,
    ).length;

    const unansweredCount =
      answerRows.length - answeredCount;

    const correctCount = answerRows.filter(
      (answer) => answer.isCorrect,
    ).length;

    const incorrectCount =
      answeredCount - correctCount;

    /*
     * ---------------------------------------------------------
     * 11. Save all quiz answers
     *
     * Every question gets a row.
     *
     * Unanswered:
     *
     * selectedOption = null
     * isCorrect      = false
     * marksAwarded   = 0
     * ---------------------------------------------------------
     */

    await tx.insert(quizAnswers).values(
      answerRows,
    );

    /*
     * ---------------------------------------------------------
     * 12. Mark attempt as submitted
     * ---------------------------------------------------------
     */

    const submittedAt = new Date();

    await tx
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

    /*
     * ---------------------------------------------------------
     * 13. Return result
     * ---------------------------------------------------------
     */

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
        totalMarks: questions.reduce(
          (total, question) =>
            total + question.marks,
          0,
        ),

        percentage:
          questions.reduce(
            (total, question) =>
              total + question.marks,
            0,
          ) > 0
            ? Number(
                (
                  (score /
                    questions.reduce(
                      (total, question) =>
                        total + question.marks,
                      0,
                    )) *
                  100
                ).toFixed(2),
              )
            : 0,

        questionCount: questions.length,

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

  /*
   * ---------------------------------------------------------
   * Find the attempt and make sure it belongs to the
   * currently logged-in student.
   * ---------------------------------------------------------
   *
   * We DO NOT select user.fullName here because it is a
   * JavaScript value, not a Drizzle SQL expression.
   *
   * We already have it from getCurrentUser().
   */
  const [attempt] = await db
    .select({
      attemptId: quizAttempts.id,
      attemptStatus: quizAttempts.status,

      startedAt: quizAttempts.startedAt,
      submittedAt: quizAttempts.submittedAt,
      score: quizAttempts.score,

      quizId: quizzes.id,
      quizTitle: quizzes.title,
      quizDescription: quizzes.description,
      durationMinutes: quizzes.durationMinutes,
      quizTotalMarks: quizzes.totalMarks,

      studentId: studentProfiles.id,
      studentRollNumber: studentProfiles.rollNumber,
    })
    .from(quizAttempts)
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
    .innerJoin(
      quizzes,
      eq(
        quizAttempts.quizId,
        quizzes.id,
      ),
    )
    .where(
      and(
        eq(
          quizAttempts.id,
          attemptId,
        ),

        /*
         * This is the ownership check.
         *
         * The attempt must belong to the currently
         * logged-in student's profile.
         */
        eq(
          studentProfiles.userId,
          user.id,
        ),

        isNull(studentProfiles.deletedAt),
      ),
    )
    .limit(1);

  if (!attempt) {
    notFound();
  }

  /*
   * ---------------------------------------------------------
   * Get all saved answers for this attempt.
   * ---------------------------------------------------------
   */
  const answers = await db
    .select({
      selectedOption:
        quizAnswers.selectedOption,

      isCorrect:
        quizAnswers.isCorrect,

      marksAwarded:
        quizAnswers.marksAwarded,
    })
    .from(quizAnswers)
    .where(
      eq(
        quizAnswers.attemptId,
        attempt.attemptId,
      ),
    );

  /*
   * ---------------------------------------------------------
   * Calculate answer statistics.
   * ---------------------------------------------------------
   */

  const answeredCount = answers.filter(
    (answer) =>
      answer.selectedOption !== null,
  ).length;

  const unansweredCount = answers.filter(
    (answer) =>
      answer.selectedOption === null,
  ).length;

  const correctCount = answers.filter(
    (answer) =>
      answer.isCorrect === true,
  ).length;

  const incorrectCount =
    answeredCount - correctCount;

  /*
   * ---------------------------------------------------------
   * Score
   * ---------------------------------------------------------
   *
   * quizAttempts.score is the authoritative final score.
   *
   * The fallback is useful in case score somehow happens
   * to be NULL.
   */
  const score =
    attempt.score ??
    answers.reduce(
      (total, answer) =>
        total + answer.marksAwarded,
      0,
    );

  /*
   * quizTotalMarks is an INT in your schema, so this
   * should be a number.
   */
  const totalMarks =
    attempt.quizTotalMarks ?? 0;

  /*
   * ---------------------------------------------------------
   * Percentage
   * ---------------------------------------------------------
   */
  const percentage =
    totalMarks > 0
      ? Number(
          (
            (score / totalMarks) *
            100
          ).toFixed(2),
        )
      : 0;

  /*
   * ---------------------------------------------------------
   * Get total number of questions.
   * ---------------------------------------------------------
   */
  const [{ totalQuestions }] =
    await db
      .select({
        totalQuestions:
          count(quizQuestions.id),
      })
      .from(quizQuestions)
      .where(
        eq(
          quizQuestions.quizId,
          attempt.quizId,
        ),
      );

  /*
   * ---------------------------------------------------------
   * Grade
   * ---------------------------------------------------------
   */
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

  /*
   * ---------------------------------------------------------
   * Performance
   * ---------------------------------------------------------
   */
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

  /*
   * ---------------------------------------------------------
   * Passing percentage
   * ---------------------------------------------------------
   */
  const passed = percentage >= 50;

  /*
   * ---------------------------------------------------------
   * Return result
   * ---------------------------------------------------------
   */
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

      durationMinutes:
        attempt.durationMinutes,

      totalQuestions,
      totalMarks,
    },

    attempt: {
      id: attempt.attemptId,
      status: attempt.attemptStatus,

      startedAt: attempt.startedAt,
      submittedAt: attempt.submittedAt,

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