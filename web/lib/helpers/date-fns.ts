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
export const formatDate = (dateValue: Date | null) => {
  if (!dateValue) return "";
  return format(dateValue, "MMM d, yyyy");
};