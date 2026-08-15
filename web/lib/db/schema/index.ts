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
  unique,
  boolean,
  foreignKey,
  json,
} from "drizzle-orm/mysql-core";

// Enums
export const userRoleEnum = mysqlEnum("role", ["admin", "trainer", "student"]);
export const userStatusEnum = mysqlEnum("status", ["active", "inactive", "suspended"]);
export const assetExtensionEnum = mysqlEnum("extension", ["pdf", "mp4", "png", "jpg", "jpeg", "md"]);
export const weekdayEnum = mysqlEnum("weekday", ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"]);
export const moduleProgressStatusEnum = mysqlEnum("module_progress_status", ["not_started", "in_progress", "completed", "skipped"]);
export const enrollmentStatusEnum = mysqlEnum("enrollment_status", ["active", "completed", "transferred", "dropped", "suspended"]);
export const announcementAudienceEnum = mysqlEnum("target_audience", ["all", "trainers", "students"]);
export const assignmentStatusEnum = mysqlEnum("assignment_status", ["draft","published","closed"]);
export const assignmentSubmissionStatusEnum = mysqlEnum("assignment_submission_status", ["not_submitted","submitted","late","graded","resubmitted"]);
export const assignmentResourceTypeEnum = mysqlEnum("assignment_resource_type", ["assignment","assignment_submission"]);
export const quizCreationMethodEnum = mysqlEnum("quiz_creation_method", ["manual", "ai"]);
export const quizStatusEnum = mysqlEnum("quiz_status", ["draft", "published", "closed", "archived"]);
export const quizQuestionTypeEnum = mysqlEnum("quiz_question_type", ["mcq", "boolean"]);
export const quizOptionEnum = mysqlEnum("quiz_option", ["a", "b", "c", "d"]);
export const aiQuizSourceTypeEnum = mysqlEnum("ai_quiz_source_type", ["lesson", "asset"]);
export const aiQuizGenerationStatusEnum = mysqlEnum("ai_quiz_generation_status", ["pending", "processing", "completed", "failed", "cancelled"]);
export const aiQuizDifficultyEnum = mysqlEnum("ai_quiz_difficulty", ["easy", "medium", "hard"]);
export const quizAttemptStatusEnum = mysqlEnum("quiz_attempt_status", ["in_progress", "submitted", "cancelled", "cheated"]);


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
  deletedAt: timestamp("deleted_at"),
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


// Course Modules
export const courseModules = mysqlTable("course_modules", {
  id: varchar("id", { length: 21 }).primaryKey(),

  courseId: varchar("course_id", { length: 21 }).notNull().references(() => courses.id),

  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),

  orderIndex: int("order_index").notNull().default(0),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// Course Module Lessons
export const moduleLessons = mysqlTable("module_lessons", {
  id: varchar("id", { length: 21 }).primaryKey(),

  moduleId: varchar("module_id", { length: 21 }).notNull().references(() => courseModules.id),

  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),

  orderIndex: int("order_index").notNull().default(0),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// Module Progress
export const moduleProgress = mysqlTable("module_progress", {
  id: varchar("id", { length: 21 }).primaryKey(),

  batchId: varchar("batch_id", { length: 21 }).notNull().references(() => courseBatches.id),
  lessonId: varchar("lesson_id", { length: 21 }).notNull().references(() => moduleLessons.id),

  status: moduleProgressStatusEnum.notNull().default("not_started"),

  completedAt: timestamp("completed_at"),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => [
  unique("batch_lesson_progress_unique").on(
    table.batchId,
    table.lessonId,
  ),
]);

// Student Batch Enrollments
export const enrollments = mysqlTable("enrollments", {
  id: varchar("id", { length: 21 }).primaryKey(),

  batchId: varchar("batch_id", { length: 21 }).notNull().references(() => courseBatches.id),
  studentId: varchar("student_id", { length: 21 }).notNull().references(() => studentProfiles.id),

  status: enrollmentStatusEnum.notNull().default("active"),

  enrolledAt: timestamp("enrolled_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  deletedAt: timestamp("deleted_at"),
}, (table) => [
  unique("student_batch_unique").on(table.studentId, table.batchId),
]);

// Announcements
export const announcements = mysqlTable("announcements", {
  id: varchar("id", { length: 21 }).primaryKey(),

  createdBy: varchar("created_by", { length: 21 }).notNull().references(() => users.id),

  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),

  isPublic: boolean("is_public").notNull().default(false),
  targetAudience: announcementAudienceEnum.notNull().default("all"),

  isPinned: boolean("is_pinned").notNull().default(false),

  startDate: date("start_date").notNull(),
  endDate: date("end_date"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});

// Assignments
export const assignments = mysqlTable("assignments", {
  id: varchar("id", { length: 21 }).primaryKey(),

  batchId: varchar("batch_id", { length: 21 }).notNull().references(() => courseBatches.id),

  moduleId: varchar("module_id", { length: 21 }).references(() => courseModules.id),
  lessonId: varchar("lesson_id", { length: 21 }).references(() => moduleLessons.id),

  createdBy: varchar("created_by", { length: 21 }).notNull().references(() => trainerProfiles.id),

  title: varchar("title", { length: 255 }).notNull(),
  instructions: text("instructions"),

  maxMarks: int("max_marks").notNull().default(100),
  status: assignmentStatusEnum.notNull().default("draft"),

  assignedAt: date("assigned_at").notNull(),
  dueAt: date("due_at").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});


// Assignment Submissions
export const assignmentSubmissions = mysqlTable("assignment_submissions", {
    id: varchar("id", { length: 21 }).primaryKey(),

    assignmentId: varchar("assignment_id", { length: 21 }).notNull().references(() => assignments.id),
    enrollmentId: varchar("enrollment_id", { length: 21 }).notNull().references(() => enrollments.id),

    status: assignmentSubmissionStatusEnum.notNull().default("not_submitted"),
    submittedAt: timestamp("submitted_at"),
    submissionNote: text("submission_note"),

    marksObtained: int("marks_obtained"),
    teacherFeedback: text("teacher_feedback"),

    gradedBy: varchar("graded_by", { length: 21 }).references(() => trainerProfiles.id),
    gradedAt: timestamp("graded_at"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  }, (table) => [
    unique("assignment_enrollment_unique").on(table.assignmentId, table.enrollmentId),
  ],
);


// Assignment Reference Links
export const assignmentReferenceLinks = mysqlTable("assignment_reference_links", {
    id: varchar("id", { length: 21 }).primaryKey(),

    assignmentId: varchar("assignment_id", { length: 21 }).notNull().references(() => assignments.id),
    submissionId: varchar("submission_id", { length: 21 }),

    resourceType: assignmentResourceTypeEnum.notNull(),

    title: varchar("title", { length: 255 }).notNull(),
    url: text("url").notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  }, (table) => [
    foreignKey({
      columns: [table.submissionId],
      foreignColumns: [assignmentSubmissions.id],
      name: "assignment_reference_link_submission_fk",
    }),
  ]
);


// Quizzes
export const quizzes = mysqlTable("quizzes", {
  id: varchar("id", { length: 21 }).primaryKey(),

  batchId: varchar("batch_id", { length: 21 }).notNull().references(() => courseBatches.id),
  createdBy: varchar("created_by", { length: 21 }).notNull().references(() => users.id),

  creationMethod: quizCreationMethodEnum.notNull().default("manual"),

  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),

  durationMinutes: int("duration_minutes").notNull(),
  totalMarks: int("total_marks").notNull().default(0),

  status: quizStatusEnum.notNull().default("draft"),

  publishedDate: date("published_date"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});

// Quiz Questions
export const quizQuestions = mysqlTable("quiz_questions", {
  id: varchar("id", { length: 21 }).primaryKey(),

  quizId: varchar("quiz_id", { length: 21 }).notNull().references(() => quizzes.id),

  type: quizQuestionTypeEnum.notNull(),

  question: text("question").notNull(),

  optionA: varchar("option_a", { length: 255 }).notNull(),
  optionB: varchar("option_b", { length: 255 }).notNull(),
  optionC: varchar("option_c", { length: 255 }),
  optionD: varchar("option_d", { length: 255 }),

  correctOption: quizOptionEnum.notNull(),
  marks: int("marks").notNull().default(1),

  orderIndex: int("order_index").notNull().default(0),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});


// Quiz Attempts
export const quizAttempts = mysqlTable("quiz_attempts", {
    id: varchar("id", { length: 21 }).primaryKey(),

    quizId: varchar("quiz_id", { length: 21 }).notNull().references(() => quizzes.id),
    enrollmentId: varchar("enrollment_id", { length: 21 }).notNull().references(() => enrollments.id),

    status: quizAttemptStatusEnum.notNull().default("in_progress"),

    startedAt: timestamp("started_at").notNull(),
    submittedAt: timestamp("submitted_at"),

    score: int("score"),

    // Set when attempt is cancelled/flagged for cheating
    cancelledAt: timestamp("cancelled_at"),
    cancellationReason: text("cancellation_reason"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [
    unique("quiz_enrollment_unique").on(
      table.quizId,
      table.enrollmentId,
    ),
  ],
);


// Quiz Answers
export const quizAnswers = mysqlTable(
  "quiz_answers", {
    id: varchar("id", { length: 21 }).primaryKey(),

    attemptId: varchar("attempt_id", { length: 21 }).notNull().references(() => quizAttempts.id),
    questionId: varchar("question_id", { length: 21 }).notNull().references(() => quizQuestions.id),

    selectedOption: quizOptionEnum,
    isCorrect: boolean("is_correct").notNull(),

    marksAwarded: int("marks_awarded").notNull().default(0),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    unique("quiz_attempt_question_unique").on(table.attemptId, table.questionId),
  ],
);


// AI Quiz Generation Jobs
export const aiQuizGenerationJobs = mysqlTable("ai_quiz_generation_jobs", {
    id: varchar("id", { length: 21 }).primaryKey(),

    // Draft quiz being generated
    quizId: varchar("quiz_id", { length: 21 }).notNull().references(() => quizzes.id),

    // Where AI gets its knowledge from
    sourceType: aiQuizSourceTypeEnum.notNull(),

    // LMS module used as source
    // NULL when using PDF/file only
    sourceModuleId: varchar("source_module_id", { length: 21 }).references(() => courseModules.id),

    // LMS lesson used as source
    // NULL when using PDF/file only
    sourceLessonId: varchar("source_lesson_id", { length: 21 }).references(() => moduleLessons.id),

    // Uploaded PDF/file used as source
    // NULL when using lesson only
    sourceAssetId: varchar("source_asset_id", { length: 21 }).references(() => assets.id),

    status: aiQuizGenerationStatusEnum.notNull().default("pending"),

    questionCount: int("question_count").notNull(),

    difficulty: aiQuizDifficultyEnum.notNull(),

    // Example:
    // {
    //   "mcq": 7,
    //   "boolean": 3
    // }
    questionTypes: json("question_types").notNull(),

    // User-provided instructions for AI
    customInstructions: text("custom_instructions"),

    errorMessage: text("error_message"),

    startedAt: timestamp("started_at"),
    completedAt: timestamp("completed_at"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
);