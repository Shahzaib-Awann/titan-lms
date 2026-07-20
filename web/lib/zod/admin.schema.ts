import { z } from "zod";

export const AdminFormSchema = z
  .object({
    id: z.string().optional(),

    cnic: z
      .string()
      .min(13, "CNIC/B-Form must be 13 digits")
      .max(13, "CNIC/B-Form must be 13 digits")
      .regex(/^\d+$/, "CNIC/B-Form must contain only numbers"),

    password: z
      .string()
      .max(30, "Password must be less than 30 characters")
      .optional()
      .or(z.literal("")),

    fullName: z.string().min(2, "Full Name must be at least 2 characters"),

    phone: z.string().optional().or(z.literal("")),
    status: z.enum(["active", "inactive", "suspended"], {
      error: "Status is required",
    }),

    // Uploaded file or null
    avatar: z.instanceof(File).nullable().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.id && (!data.password || data.password.trim() === "")) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Password is required when creating a new user",
        path: ["password"],
      });
    }
  });
