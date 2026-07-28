/**
 * Defines pagination and filtering query parameters.
 */
export interface PaginationQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

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
