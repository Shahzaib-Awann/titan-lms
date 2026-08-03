/**
 * Defines available user roles.
 */
export type Role = "admin" | "trainer" | "student";

/**
 * Defines possible user account statuses.
 */
export type UserStatus = "active" | "inactive" | "suspended";

/**
 * Defines possible days of the week.
 */
export type WeekDays = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";

/**
 * Defines possible batch statuses.
 */
export type BatchStatus = "upcoming" | "running" | "completed";

/**
 * Represents a student's current enrollment status.
 */
export type EnrollmentStatus = "active" | "completed" | "transferred" | "dropped" | "suspended";

/**
 * Represents the current visibility period of an announcement.
 */
export type AnnouncementStatus = "live" | "expired" | "scheduled";

/**
 * Represents the current status of a module.
 */
export type ModuleStatus = "completed" | "in_progress" | "not_started";

/**
 * Represents the current status of a lesson.
 */
export type LessonStatus = "completed" | "in_progress" | "not_started" | "skipped";
