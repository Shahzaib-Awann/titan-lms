"use server";

import { and, asc, count, desc, eq, inArray } from "drizzle-orm";
import { nanoid } from "nanoid";
import { courseBatches, quizQuestions, quizzes } from "../db/schema";
import { manualQuizSchema } from "../zod/trainer.schema";
import z from "zod";
import { requireRole, requireTrainer } from "./auth.action";
import { db } from "../db";
import { notFound } from "next/navigation";

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

    const { batchId, payload, deletedQuestionIds = [] } = input;

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
