import { z } from "zod";

export const SignInFormSchema = z.object({
  cnic: z
    .string()
    .min(13, "CNIC/B-Form must be 13 digits")
    .max(13, "CNIC/B-Form must be 13 digits")
    .regex(/^\d+$/, "CNIC/B-Form must contain only numbers"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(30, "Password must be less than 30 characters"),
});