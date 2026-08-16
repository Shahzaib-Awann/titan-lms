import { differenceInCalendarDays, format, isValid, parse } from "date-fns";

/**
 * Formats a time string from 24-hour format to readable 12-hour format.
 *
 * @param {string | null} timeStr - Time value in HH:mm:ss format.
 * @returns {string} Formatted time or empty string if no value is provided.
 */
export const formatTime = (
  value: string | number | null,
  type: "time" | "timer" = "time",
) => {
  if (value === null || value === undefined) return "";

  if (type === "timer") {
    const totalSeconds = Number(value);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0",
    )}`;
  }

  try {
    return format(parse(String(value), "HH:mm:ss", new Date()), "h:mm a");
  } catch {
    return String(value);
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
 * Optionally includes the time.
 *
 * @param {Date | string | null | undefined} dateValue - The date to format.
 * @param {FormatDateOptions} options - Formatting options.
 * @returns {string} The formatted date string or an empty string if no date is provided.
 */
export const formatDate = (
  dateValue: Date | string | null | undefined,
  { withTime = false }: {
  withTime?: boolean;
} = {}
): string => {
  if (!dateValue) return "";

  const date =
    typeof dateValue === "string" ? new Date(dateValue) : dateValue;

  if (isNaN(date.getTime())) return "";

  return format(
    date,
    withTime ? "MMM d, yyyy - hh:mm a" : "MMM d, yyyy"
  );
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

/**
 * Calculates the number of days left until a given date.
 *
 * @param date The target date.
 * @returns The number of days left, or null if the input date is invalid.
 */
export const getDaysLeft = (
  date: Date | string | null | undefined,
): number | null => {
  if (!date) return null;

  const parsedDate = typeof date === "string" ? new Date(date) : date;

  if (!isValid(parsedDate)) {
    return null;
  }

  return Math.max(0, differenceInCalendarDays(parsedDate, new Date()));
};