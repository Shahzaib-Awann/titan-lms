import { z } from "zod";

export const AssignmentReferenceLinkSchema = z.object({
  id: z.string().nullable(),
  title: z
    .string()
    .min(1, "Link title is required")
    .max(255, "Link title must be less than 255 characters"),
  url: z.url({ error: "Please enter a valid URL" }).min(1, "URL is required"),
});

export const AssignmentFormSchema = z.object({
    id: z.string().nullable(),

    moduleId: z.string().nullable(),
    lessonId: z.string().nullable(),

    title: z
      .string()
      .min(2, "Assignment title must be at least 2 characters")
      .max(255, "Assignment title must be less than 255 characters"),
    instructions: z
      .string()
      .max(10000, "Instructions must be less than 10000 characters")
      .nullable(),

    maxMarks: z
      .number({ error: "Maximum marks are required" })
      .min(0, "Maximum marks cannot be negative"),
    status: z.enum(["draft", "published", "closed"], {
      error: "Assignment status is required",
    }),

    assignedAt: z.string().min(1, "Assigned date is required"),
    dueAt: z.string().min(1, "Due date is required"),
  }).refine(
    (data) => {
      if (!data.assignedAt || !data.dueAt) return true;

      return new Date(data.dueAt) >= new Date(data.assignedAt);
    },
    {
      message: "Due date must be after or equal to assigned date",
      path: ["dueAt"],
    },
  );

export const AssignmentWithReferencesFormSchema = AssignmentFormSchema.extend({
  referenceLinks: z.array(AssignmentReferenceLinkSchema),
});

export const AssignmentSubmissionFormSchema = z.object({
  submissionNote: z
    .string()
    .max(1000, "Submission note must be less than 1000 characters")
    .nullable(),

  referenceLinks: z
    .array(AssignmentReferenceLinkSchema)
    .min(1, "at least one reference link is required")
    .max(5, "at most 5 reference links are allowed"),
});

export const AssignmentSubmissionGradingFormSchema = (maxMarks: number) => z.object({
    marks: z
      .number({
        message: "Marks are required.",
      })
      .min(0, "Marks cannot be negative.")
      .max(maxMarks, `Marks cannot exceed ${maxMarks}.`),

    feedback: z.string().max(1000, "Feedback must be 1000 characters or less."),
  });


const optionSchema = z.object({
  id: z.enum(["a", "b", "c", "d"]),
  text: z
    .string()
    .trim()
    .min(1, "Option is required")
    .max(255, "Option text cannot exceed 255 characters"),
});

const mcqQuestionSchema = z.object({
  id: z.string().nullable(),
  type: z.literal("mcq"),
  question: z
    .string()
    .trim()
    .min(1, "Question is required")
    .max(500, "Question text cannot exceed 500 characters"),
  options: z
    .array(optionSchema)
    .length(4, "MCQ must have exactly 4 options"),
  correctOption: z.enum(["a", "b", "c", "d"]),
  marks: z
    .number()
    .int("Marks must be a whole number")
    .min(1, "Marks must be at least 1"),
  orderIndex: z
    .number()
    .int("Order index must be a whole number")
    .min(0, "Order index cannot be negative"),
});

const booleanQuestionSchema = z.object({
  id: z.string().nullable(),
  type: z.literal("boolean"),
  question: z
    .string()
    .trim()
    .min(1, "Question is required")
    .max(500, "Question text cannot exceed 500 characters"),
  options: z
    .array(
      z.object({
        id: z.enum(["a", "b"]),
        text: z
          .string()
          .trim()
          .min(1, "Option is required")
          .max(255, "Option text cannot exceed 255 characters"),
      }),
    )
    .length(2, "Boolean question must have exactly 2 options"),
  correctOption: z.enum(["a", "b"]),
  marks: z
    .number()
    .int("Marks must be a whole number")
    .min(1, "Marks must be at least 1"),
  orderIndex: z
    .number()
    .int("Order index must be a whole number")
    .min(0, "Order index cannot be negative"),
});

const questionSchema = z.discriminatedUnion("type", [
  mcqQuestionSchema,
  booleanQuestionSchema,
]);

export const manualQuizSchema = z
  .object({
    id: z.string().nullable(),

    title: z
      .string()
      .trim()
      .min(1, "Quiz title is required")
      .max(255, "Quiz title cannot exceed 255 characters"),

    description: z
      .string()
      .trim()
      .max(5000, "Description cannot exceed 5000 characters")
      .optional()
      .or(z.literal("")),

    type: z.enum(["manual", "ai"]),

    durationMinutes: z
      .number()
      .int("Duration must be a whole number")
      .min(1, "Duration must be at least 1 minute"),

    status: z.enum(["draft", "published", "closed"], {
      error: "Quiz status is required",
    }),

    publishedDate: z.string().nullable(),

    questions: z
      .array(questionSchema)
      .min(1, "Quiz must have at least one question"),
  })
  .superRefine((data, ctx) => {
    if (
      ["published", "closed"].includes(data.status) &&
      !data.publishedDate
    ) {
      ctx.addIssue({
        code: "custom",
        message:
          "Published date is required when status is published or closed",
        path: ["publishedDate"],
      });
    }

    if (data.status === "draft" && data.publishedDate !== null) {
      ctx.addIssue({
        code: "custom",
        message: "Draft quizzes cannot have a published date",
        path: ["publishedDate"],
      });
    }
  });

export const generateAiQuizSchema = z.object({
  prompt: z
    .string()
    .trim()
    .min(10, "Please provide a more detailed prompt.")
    .max(1000, "Prompt cannot exceed 1000 characters."),

  questionCount: z
    .number()
    .int()
    .min(1, "At least one question is required.")
    .max(15, "You can generate up to 15 questions."),

  difficulty: z.enum(["easy", "medium", "hard"]),
});

export const aiQuizQuestionSchema = z.object({
  type: z.enum(["mcq", "boolean"]),

  question: z
    .string()
    .trim()
    .min(1)
    .max(500),

  options: z
    .array(
      z.object({
        id: z.enum(["a", "b", "c", "d"]),
        text: z.string().trim().min(1).max(255),
      }),
    )
    .min(2)
    .max(4),

  correctOption: z.enum(["a", "b", "c", "d"]),
});

export const aiQuizResponseSchema = z.object({
  questions: z.array(aiQuizQuestionSchema),
});