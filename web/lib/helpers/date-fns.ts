import { format, parse } from "date-fns";

/**
 * Formats a time string from 24-hour format to readable 12-hour format.
 *
 * @param {string | null} timeStr - Time value in HH:mm:ss format.
 * @returns {string} Formatted time or empty string if no value is provided.
 */
export const formatTime = (timeStr: string | null) => {
  if (!timeStr) return "";
  try {
    return format(parse(timeStr, "HH:mm:ss", new Date()), "h:mm a");
  } catch {
    return timeStr;
  }
};

/**
 * Formats a day name into a short capitalized format.
 *
 * @param {string | null} day - Full day name.
 * @returns {string} Short formatted day name or empty string if no value is provided.
 */
export const formatDay = (day: string | null) => {
  if (!day) return "";
  return day.charAt(0).toUpperCase() + day.slice(1, 3);
};

/**
 * Formats a date value into a short month, day, and year string.
 * Handles both Date objects and null/undefined values.
 *
 * @param {Date | null} dateValue - The date to format, or null/undefined.
 * @returns {string} The formatted date string (e.g., "Jan 15, 2023") or an empty string if no date is provided.
 */
export const formatDate = (
  dateValue: Date | string | null | undefined
): string => {
  if (!dateValue) return "";

  const date =
    typeof dateValue === "string" ? new Date(dateValue) : dateValue;

  if (isNaN(date.getTime())) return "";

  return format(date, "MMM d, yyyy");
};

export type EntityStatus = "upcoming" | "live" | "completed";

/**
 * Returns the current status of a time-based entity.
 *
 * @param startDate - Entity start date
 * @param endDate - Entity end date (optional)
 * @returns "upcoming" | "live" | "completed"
 */
export const getEntityStatus = (
  startDate: Date | string | null | undefined,
  endDate?: Date | string | null,
): EntityStatus => {
  if (!startDate) return "upcoming";

  const start = normalizeDate(startDate);
  const end = endDate ? normalizeDate(endDate) : null;
  const today = normalizeDate(new Date());

  if (!start || !today) {
    return "upcoming";
  }

  if (today < start) {
    return "upcoming";
  }

  if (end && today > end) {
    return "completed";
  }

  return "live";
};


/**
 * Removes time from a date for date-only comparison.
 */
const normalizeDate = (
  value: Date | string,
): Date | null => {
  const date =
    typeof value === "string"
      ? new Date(value)
      : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  date.setHours(0, 0, 0, 0);

  return date;
};