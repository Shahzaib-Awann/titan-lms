"use server";

import { and, asc, eq, exists, gte, isNull, lte, or } from "drizzle-orm";
import {
  batchSchedules,
  courseBatches,
  courses,
  enrollments,
  studentProfiles,
  trainerProfiles,
} from "@/lib/db/schema";
import { db } from "@/lib/db";
import { requireRole } from "./auth.action";
import { addDays, format } from "date-fns";

// Shape of data returned to calendar UI
export type BatchScheduleCalendar = {
  id: string;
  courseName: string;
  batchName: string;
  scheduleDate: string;
  startTime: string;
  endTime: string;
  room: string | null;
};

// Weekday list matching JavaScript Date.getDay() indexes
const weekdays = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;

// Converts "MM-YYYY" string into actual month start and end dates
function getMonthRange(monthYear: string) {
  // Validate month format
  const match = /^(\d{2})-(\d{4})$/.exec(monthYear);

  if (!match) {
    throw new Error("Invalid month format. Expected MM-YYYY.");
  }

  // Extract month and year numbers
  const month = Number(match[1]);
  const year = Number(match[2]);

  // Validate month value
  if (month < 1 || month > 12) {
    throw new Error("Invalid month. Month must be between 01 and 12.");
  }

  // Validate year value
  if (year < 1000 || year > 9999) {
    throw new Error("Invalid year. Year must be a 4-digit year.");
  }

  // Return first and last days of the month
  return {
    monthStart: new Date(year, month - 1, 1),
    monthEnd: new Date(year, month, 0),
  };
}

// Determines the intersection of two date ranges
function getDateRange(
  startDate: Date,
  endDate: Date,
  monthStart: Date,
  monthEnd: Date,
) {
  return {
    // Take the later of the two start dates
    start: startDate > monthStart ? startDate : monthStart,

    // Take the earlier of the two end dates
    end: endDate < monthEnd ? endDate : monthEnd,
  };
}

/**
 * Fetches calendar events for the authenticated trainer/student.
 *
 * @param monthYear - Month and year used to filter calendar events.
 * @returns Scheduled batch events including course, date, time, and room details.
 */
export async function fetchCalendarEvents(
  monthYear: string,
): Promise<BatchScheduleCalendar[]> {
  try {
    // Authorize user.
    const user = await requireRole(["student", "trainer"]);

    // Get the first and last date of the requested month.
    const { monthStart, monthEnd } = getMonthRange(monthYear);

    // Build access rules based on the user's role.
    const accessCondition =
      user.role === "trainer"
        ? exists(
            // Check if this batch belongs to the logged-in trainer.
            db
              .select({ id: trainerProfiles.id })
              .from(trainerProfiles)
              .where(
                and(
                  // Match trainer profile with batch trainer.
                  eq(trainerProfiles.id, courseBatches.trainerId),
                  // Match trainer profile with current user.
                  eq(trainerProfiles.userId, user.id),
                  // Ensure trainer profile is not deleted.
                  isNull(trainerProfiles.deletedAt),
                ),
              ),
          )
        : exists(
            // Check if the student is enrolled in this batch.
            db
              .select({ id: enrollments.id })
              .from(enrollments)
              .innerJoin(
                studentProfiles,
                and(
                  // Match enrollment student with student profile.
                  eq(enrollments.studentId, studentProfiles.id),
                  // Match profile with logged-in user.
                  eq(studentProfiles.userId, user.id),
                  // Ensure student profile is not deleted.
                  isNull(studentProfiles.deletedAt),
                ),
              )
              .where(
                and(
                  // Match enrollment with batch.
                  eq(enrollments.batchId, courseBatches.id),
                  // Ensure enrollment is not deleted.
                  isNull(enrollments.deletedAt),
                ),
              ),
          );

    // Fetch batches and their schedules from the database.
    const rows = await db
      .select({
        batchId: courseBatches.id,
        batchName: courseBatches.batchName,

        courseName: courses.title,

        startDate: courseBatches.startDate,
        endDate: courseBatches.endDate,

        scheduleId: batchSchedules.id,
        weekday: batchSchedules.weekday,
        startTime: batchSchedules.startTime,
        endTime: batchSchedules.endTime,
        room: batchSchedules.room,
      })
      .from(courseBatches)
      .innerJoin(
        courses,
        and(eq(courseBatches.courseId, courses.id), isNull(courses.deletedAt)),
      )
      .innerJoin(batchSchedules, eq(batchSchedules.batchId, courseBatches.id))
      .where(
        and(
          isNull(courseBatches.deletedAt),
          accessCondition,
          lte(courseBatches.startDate, monthEnd),
          or(
            isNull(courseBatches.endDate),
            gte(courseBatches.endDate, monthStart),
          ),
        ),
      )
      .orderBy(
        asc(courseBatches.id),
        asc(batchSchedules.weekday),
        asc(batchSchedules.startTime),
      );

    // Return an empty calendar when nothing was found.
    if (rows.length === 0) {
      return [];
    }

    // Group database rows by batch ID.
    const batches = new Map<
      string,
      {
        batchName: string;
        courseName: string;
        startDate: (typeof rows)[number]["startDate"];
        endDate: (typeof rows)[number]["endDate"];
        schedules: Array<{
          id: string;
          weekday: (typeof rows)[number]["weekday"];
          startTime: (typeof rows)[number]["startTime"];
          endTime: (typeof rows)[number]["endTime"];
          room: (typeof rows)[number]["room"];
        }>;
      }
    >();

    // Process every database row.
    for (const row of rows) {
      // Check if this batch was already added to the map.
      const existing = batches.get(row.batchId);

      // Add another schedule to the existing batch.
      if (existing) {
        existing.schedules.push({
          id: row.scheduleId,
          weekday: row.weekday,
          startTime: row.startTime,
          endTime: row.endTime,
          room: row.room,
        });

        continue;
      }

      // Create a new batch with its first schedule.
      batches.set(row.batchId, {
        batchName: row.batchName,
        courseName: row.courseName,
        startDate: row.startDate,
        endDate: row.endDate,
        schedules: [
          {
            id: row.scheduleId,
            weekday: row.weekday,
            startTime: row.startTime,
            endTime: row.endTime,
            room: row.room,
          },
        ],
      });
    }

    // Store the final calendar events here.
    const events: BatchScheduleCalendar[] = [];

    // Process each unique batch.
    for (const batch of batches.values()) {
      // Convert the batch start date into a Date object.
      const batchStart = new Date(batch.startDate);

      // Use the month end as the batch end date when no end date is available.
      const batchEnd = batch.endDate ? new Date(batch.endDate) : monthEnd;

      // Get the actual date range to check.
      const { start, end } = getDateRange(
        batchStart,
        batchEnd,
        monthStart,
        monthEnd,
      );

      // Group schedules by weekday for faster lookup.
      const schedulesByWeekday = new Map<string, typeof batch.schedules>();

      // Process every schedule in the batch.
      for (const schedule of batch.schedules) {
        const existing = schedulesByWeekday.get(schedule.weekday);

        // Add schedule to the existing weekday list.
        if (existing) {
          existing.push(schedule);
        } else {
          // Create a new weekday list with this schedule.
          schedulesByWeekday.set(schedule.weekday, [schedule]);
        }
      }

      // Loop through every date in the active range.
      for (let date = start; date <= end; date = addDays(date, 1)) {
        const weekday = weekdays[date.getDay()];

        // Find schedules matching this weekday.
        const matchedSchedules = schedulesByWeekday.get(weekday);

        // Skip this date when no schedule is found.
        if (!matchedSchedules) {
          continue;
        }

        const scheduleDate = format(date, "yyyy-MM-dd");

        // Create an event for every matching schedule.
        for (const schedule of matchedSchedules) {
          events.push({
            id: `${schedule.id}-${scheduleDate}`,

            courseName: batch.courseName,
            batchName: batch.batchName,

            scheduleDate,

            startTime: schedule.startTime,
            endTime: schedule.endTime,

            room: schedule.room,
          });
        }
      }
    }

    // Return all generated calendar events.
    return events;
  } catch (error) {
    console.error("fetchCalendarEvents failed:", error);

    return [];
  }
}
