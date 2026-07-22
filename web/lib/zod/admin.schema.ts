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
    avatar: z
      .instanceof(File)
      .nullable()
      .optional()
      .refine(
        (file) => !file || file.size <= 2 * 1024 * 1024,
        "Image must be less than 2MB",
      ),
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

export const TrainerFormSchema = z
  .object({
    id: z.string().optional(),

    fullName: z.string().min(2, "Full Name must be at least 2 characters"),

    phone: z.string().optional().or(z.literal("")),

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

    employeeCode: z.string().min(2, "Employee Code is required"),

    specialization: z
      .string()
      .min(2, "Specialization must be at least 2 characters"),

    hourlyRate: z
      .string()
      .min(1, "Hourly Rate is required")
      .refine(
        (value) => !isNaN(Number(value)) && Number(value) >= 0,
        "Hourly Rate must be a valid positive number",
      ),

    joinedDate: z.string().min(1, "Joined Date is required"),

    status: z.enum(["active", "inactive", "suspended"], {
      error: "Status is required",
    }),

    // Uploaded file or null
    avatar: z
      .instanceof(File)
      .nullable()
      .optional()
      .refine(
        (file) => !file || file.size <= 2 * 1024 * 1024,
        "Image must be less than 2MB",
      ),
  })
  .superRefine((data, ctx) => {
    if (!data.id && (!data.password || data.password.trim() === "")) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Password is required when creating a new trainer",
        path: ["password"],
      });
    }
  });

export const StudentFormSchema = z
  .object({
    id: z.string().optional(),

    fullName: z.string().min(2, "Full Name must be at least 2 characters"),
    cnic: z.string().min(13, "CNIC/B-Form must be 13 digits").max(13, "CNIC/B-Form must be 13 digits").regex(/^\d+$/, "CNIC/B-Form must contain only numbers"),
    password: z.string().max(30, "Password must be less than 30 characters").optional().or(z.literal("")),

    rollNumber: z.string().min(1, "Roll Number is required"),
    phone: z.string().optional().or(z.literal("")),
    dateOfBirth: z.string().min(1, "Date of Birth is required"),

    guardianName: z.string().min(2, "Guardian Name must be at least 2 characters"),
    guardianPhone: z.string().min(1, "Guardian Phone is required"),
    address: z.string().min(5, "Address must be at least 5 characters"),

    admissionDate: z.string().min(1, "Admission Date is required"),
    status: z.enum(["active", "inactive", "suspended"], { error: "Status is required" }),

    // Uploaded file or null
    avatar: z
      .instanceof(File)
      .nullable()
      .optional()
      .refine(
        (file) => !file || file.size <= 2 * 1024 * 1024,
        "Image must be less than 2MB",
      ),
  })
  .superRefine((data, ctx) => {
    if (!data.id && (!data.password || data.password.trim() === "")) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Password is required when creating a new student",
        path: ["password"],
      });
    }
  });

export const CourseFormSchema = z.object({
  id: z.string().optional(),

  title: z.string().min(2, "Title must be at least 2 characters").max(255, "Title must be less than 255 characters"),
  slug: z
    .string()
    .min(2, "Slug is required")
    .max(255, "Slug must be less than 255 characters")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug can only contain lowercase letters, numbers, and hyphens",
    ),

  description: z.string().min(10, "Description must be at least 10 characters"),
  durationWeeks: z.number({ error: "Duration is required" }).int("Duration must be a whole number").min(1, "Duration must be at least 1 week"),
  feeAmount: z.number({ error: "Fee amount is required" }).min(0, "Fee amount cannot be negative"),
});

export const ScheduleSchema = z.object({
  id: z.string().optional(),
  weekday: z.enum(["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]),
  startTime: z.string({ error: "Start time is required" }).min(1, "Start time is required"),
  endTime: z.string({ error: "End time is required" }).min(1, "End time is required"),
  room: z.string().max(100, "Room name must be less than 100 characters").optional(),
}).refine(
    (data) => {
      if (!data.startTime || !data.endTime) return true;
      return data.endTime > data.startTime;
    },
    {
      message: "End time must be after start time",
      path: ["endTime"],
    },
  );

export const BatchFormSchema = z
  .object({
    id: z.string().optional(),

    courseId: z.string({ error: "Course is required" }).min(1, "Course is required"),
    trainerId: z.string({ error: "Trainer is required" }).min(1, "Trainer is required"),

    batchName: z.string().min(2, "Batch name must be at least 2 characters").max(255, "Batch name must be less than 255 characters"),
    startDate: z.string({ error: "Start date is required" }).min(1, "Start date is required"),
    endDate: z.string().optional(),

    schedules: z.array(ScheduleSchema).min(1, "At least one schedule is required"),
  })
  .refine(
    (data) => {
      if (!data.endDate) return true;
      return new Date(data.endDate) >= new Date(data.startDate);
    },
    {
      message: "End date must be after start date",
      path: ["endDate"],
    },
  );
