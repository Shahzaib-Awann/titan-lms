import {
  mysqlTable,
  varchar,
  timestamp,
  mysqlEnum,
  date,
  int,
  text,
  bigint,
} from "drizzle-orm/mysql-core";

// Enums
export const userRoleEnum = mysqlEnum("role", ["admin", "teacher", "student"]);
export const userStatusEnum = mysqlEnum("status", ["active", "inactive", "suspended"]);
export const assetExtensionEnum = mysqlEnum("extension", ["pdf", "mp4", "png", "jpg", "jpeg", "md"]);

// Users table
export const users = mysqlTable("users", {
  id: varchar("id", { length: 21 }).primaryKey(), // NanoID generates 21-character strings

  cnic: varchar("cnic", { length: 13 }).unique().notNull(),
  password: varchar("password", { length: 30 }).notNull(),

  fullName: varchar("full_name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),

  role: userRoleEnum.notNull(),
  status: userStatusEnum.notNull().default("active"),
  avatarAssetId: varchar("avatar_asset_id", { length: 21 }),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});

// Teacher Profiles
export const teacherProfiles = mysqlTable("teacher_profiles", {
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