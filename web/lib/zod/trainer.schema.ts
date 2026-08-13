import { z } from "zod";

export const AssignmentReferenceLinkSchema = z.object({
  id: z.string().nullable(),
  title: z.string().min(1, "Link title is required").max(255, "Link title must be less than 255 characters"),
  url: z.url({ error: "Please enter a valid URL" }).min(1, "URL is required"),
});

export const AssignmentFormSchema = z.object({
    id: z.string().nullable(),

    moduleId: z.string().nullable(),
    lessonId: z.string().nullable(),

    title: z.string().min(2, "Assignment title must be at least 2 characters").max(255, "Assignment title must be less than 255 characters"),
    instructions: z.string().max(10000, "Instructions must be less than 10000 characters").nullable(),

    maxMarks: z.number({ error: "Maximum marks are required" }).min(0, "Maximum marks cannot be negative"),
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
    { message: "Due date must be after or equal to assigned date", path: ["dueAt"] },
  );

export const AssignmentWithReferencesFormSchema = AssignmentFormSchema.extend({
  referenceLinks: z.array(AssignmentReferenceLinkSchema),
});

export const AssignmentSubmissionFormSchema = z.object({
  submissionNote: z
    .string()
    .max(1000, "Submission note must be less than 1000 characters")
    .nullable(),

  referenceLinks: z.array(AssignmentReferenceLinkSchema).min(1, "at least one reference link is required").max(5, "at most 5 reference links are allowed"),
});

export const AssignmentSubmissionGradingFormSchema = (maxMarks: number) =>
  z.object({
    marks: z
      .number({
        message: "Marks are required.",
      })
      .min(0, "Marks cannot be negative.")
      .max(maxMarks, `Marks cannot exceed ${maxMarks}.`),

    feedback: z
      .string()
      .max(1000, "Feedback must be 1000 characters or less."),
  });

