import {
  mysqlTable,
  varchar,
  timestamp,
  mysqlEnum,
  date,
  int,
  text,
  bigint,
  decimal,
  time,
} from "drizzle-orm/mysql-core";

// Enums
export const userRoleEnum = mysqlEnum("role", ["admin", "trainer", "student"]);
export const userStatusEnum = mysqlEnum("status", ["active", "inactive", "suspended"]);
export const assetExtensionEnum = mysqlEnum("extension", ["pdf", "mp4", "png", "jpg", "jpeg", "md"]);
export const weekdayEnum = mysqlEnum("weekday", ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"]);

// Users table
export const users = mysqlTable("users", {
  id: varchar("id", { length: 21 }).primaryKey(), // NanoID generates 21-character strings

  cnic: varchar("cnic", { length: 13 }).unique().notNull(),
  password: varchar("password", { length: 255 }).notNull(),

  fullName: varchar("full_name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }),

  role: userRoleEnum.notNull(),
  status: userStatusEnum.notNull().default("active"),
  avatarAssetId: varchar("avatar_asset_id", { length: 21 }),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});

// Trainer Profiles
export const trainerProfiles = mysqlTable("trainer_profiles", {
  id: varchar("id", { length: 21 }).primaryKey(),

  userId: varchar("user_id", { length: 21 }).notNull().references(() => users.id),
  employeeCode: varchar("employee_code", { length: 50 }).notNull().unique(),

  specialization: varchar("specialization", { length: 255 }),
  bio: text("bio"),

  hourlyRate: int("hourly_rate"),
  joinedAt: date("joined_at"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});

// Student Profiles
export const studentProfiles = mysqlTable("student_profiles", {
  id: varchar("id", { length: 21 }).primaryKey(),

  userId: varchar("user_id", { length: 21 }).notNull().unique().references(() => users.id),
  rollNumber: varchar("roll_number", { length: 50 }).notNull().unique(),

  dateOfBirth: date("date_of_birth"),
  guardianName: varchar("guardian_name", { length: 255 }),
  guardianPhone: varchar("guardian_phone", { length: 20 }),
  address: text("address"),

  admissionDate: date("admission_date"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});

// Assets Repository
export const assets = mysqlTable("assets", {
  id: varchar("id", { length: 21 }).primaryKey(),

  publicId: varchar("public_id", { length: 255 }),
  url: text("url").notNull(),

  originalName: varchar("original_name", { length: 255 }),
  fileName: varchar("file_name", { length: 255 }),
  extension: assetExtensionEnum.notNull(),

  sizeBytes: bigint("size_bytes", { mode: "number" }),
  uploadedBy: varchar("uploaded_by", { length: 21 }).notNull().references(() => users.id),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});

export const courses = mysqlTable("courses", {
  id: varchar("id", { length: 21 }).primaryKey(),

  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),

  durationWeeks: int("duration_weeks"),
  feeAmount: decimal("fee_amount", { precision: 10, scale: 2 }),

  createdBy: varchar("created_by", { length: 21 }).notNull().references(() => users.id),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});

// Course Batches
export const courseBatches = mysqlTable("course_batches", {
  id: varchar("id", { length: 21 }).primaryKey(),

  courseId: varchar("course_id", { length: 21 }).notNull().references(() => courses.id),
  trainerId: varchar("trainer_id", { length: 21 }).notNull().references(() => trainerProfiles.id),

  batchName: varchar("batch_name", { length: 255 }).notNull(),

  startDate: date("start_date").notNull(),
  endDate: date("end_date"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// Batch Schedules
export const batchSchedules = mysqlTable("batch_schedules", {
  id: varchar("id", { length: 21 }).primaryKey(),

  batchId: varchar("batch_id", { length: 21 }).notNull().references(() => courseBatches.id),

  weekday: weekdayEnum.notNull(),

  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),

  room: varchar("room", { length: 100 }),
});