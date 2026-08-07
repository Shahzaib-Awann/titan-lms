"use server";

import { and, eq, gte, inArray, isNull, lte, or } from "drizzle-orm";
import { batchSchedules, courseBatches, courses } from "@/lib/db/schema";
import { db } from "@/lib/db";
import { requireTrainer } from "./auth.action";
import { WeekDays } from "@/types/common";
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

type Schedule = {
  id: string;
  batchId: string;
  weekday: WeekDays;
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

//  server action to fetch trainer calendar events
export async function fetchTrainerCalendar(
  monthYear: string,
): Promise<BatchScheduleCalendar[]> {
  // Get selected month boundaries
  const { monthStart, monthEnd } = getMonthRange(monthYear);

  // Get currently logged-in trainer
  const { trainer } = await requireTrainer();

  // Fetch batches owned by this trainer that overlap the month
  const batches = await db
    .select({
      id: courseBatches.id,
      batchName: courseBatches.batchName,
      courseName: courses.title,
      startDate: courseBatches.startDate,
      endDate: courseBatches.endDate,
    })
    .from(courseBatches)
    .innerJoin(courses, eq(courses.id, courseBatches.courseId))
    .where(
      and(
        eq(courseBatches.trainerId, trainer.id),
        isNull(courseBatches.deletedAt),
        lte(courseBatches.startDate, monthEnd),
        or(
          isNull(courseBatches.endDate),
          gte(courseBatches.endDate, monthStart),
        ),
      ),
    );

  // No batches for this trainer → no events
  if (!batches.length) {
    return [];
  }

  // Fetch all schedules for these batches
  const schedules = await db
    .select({
      id: batchSchedules.id,
      batchId: batchSchedules.batchId,
      weekday: batchSchedules.weekday,
      startTime: batchSchedules.startTime,
      endTime: batchSchedules.endTime,
      room: batchSchedules.room,
    })
    .from(batchSchedules)
    .where(
      inArray(
        batchSchedules.batchId,
        batches.map(({ id }) => id),
      ),
    );

  // Optimize lookups: batchId → weekday → schedules
  const scheduleMap = new Map<string, Map<string, Schedule[]>>();

  // Group schedules by batch and weekday
  for (const schedule of schedules) {
    // Get or create the weekday map for this batch
    const weekdayMap =
      scheduleMap.get(schedule.batchId) ?? new Map<string, Schedule[]>();

    // Get or create the day schedules array for this weekday
    const daySchedules = weekdayMap.get(schedule.weekday) ?? [];

    // Add the current schedule
    daySchedules.push(schedule);

    // Update nested maps
    weekdayMap.set(schedule.weekday, daySchedules);
    scheduleMap.set(schedule.batchId, weekdayMap);
  }

  // Build event list for the month
  const events: BatchScheduleCalendar[] = [];

  // For each batch, find all matching weekdays in the month range
  for (const batch of batches) {
    // Convert batch date boundaries to Date objects
    const batchStart = new Date(batch.startDate);

    // If batch has no end date, use month end
    const batchEnd = batch.endDate ? new Date(batch.endDate) : monthEnd;

    // Find actual dates where batch is active
    const { start, end } = getDateRange(
      batchStart,
      batchEnd,
      monthStart,
      monthEnd,
    );

    // Get schedules for this batch
    const weekdaySchedules = scheduleMap.get(batch.id);

    // No schedules for this batch → move to next batch
    if (!weekdaySchedules) {
      continue;
    }

    // Loop through every day in batch active period
    for (let date = start; date <= end; date = addDays(date, 1)) {
      // Get current weekday
      const weekday = weekdays[date.getDay()];

      // Get schedules for this weekday
      const matchedSchedules = weekdaySchedules.get(weekday);

      // No schedules for this weekday → move to next day
      if (!matchedSchedules) {
        continue;
      }

      // Format date as yyyy-MM-dd
      const scheduleDate = format(date, "yyyy-MM-dd");

      // Create calendar events for each schedule on this day
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

  // Return the generated calendar events
  return events;
}
