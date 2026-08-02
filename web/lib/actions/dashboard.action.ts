"use server";

import { db } from "@/lib/db";
import { users, courses, trainerProfiles, enrollments, batchSchedules, courseBatches } from "@/lib/db/schema";
import { format, getDay } from "date-fns";
import { count, eq, isNull, desc, and, inArray, or, gte, sql } from "drizzle-orm";
import { requireRole } from "./auth.action";
import { TrainerBatch, TrainerBatchesResponse } from "@/types/dashboards";
import { WeekDays } from "@/types/common";

/**
 * Fetch admin dashboard statistics
 */
export async function getAdminStats() {
  try {
    const [
      usersCount,
      coursesCount,
      activeInstructorsCount,
      activeEnrollmentsCount,
    ] = await Promise.all([
      db
        .select({
          count: count(),
        })
        .from(users)
        .where(isNull(users.deletedAt)),

      db
        .select({
          count: count(),
        })
        .from(courses)
        .where(isNull(courses.deletedAt)),

      db
        .select({
          count: count(),
        })
        .from(trainerProfiles)
        .innerJoin(users, eq(trainerProfiles.userId, users.id))
        .where(
          and(
            eq(users.status, "active"),
            isNull(users.deletedAt),
            isNull(trainerProfiles.deletedAt),
          ),
        ),

      db
        .select({
          count: count(),
        })
        .from(enrollments)
        .where(
          and(
            eq(enrollments.status, "active"),
            isNull(enrollments.deletedAt),
          ),
        ),
    ]);

    return {
      success: true,
      data: {
        usersCount: Number(usersCount[0]?.count ?? 0),
        coursesCount: Number(coursesCount[0]?.count ?? 0),
        activeEnrollmentsCount: Number(
          activeEnrollmentsCount[0]?.count ?? 0,
        ),
        activeInstructorsCount: Number(
          activeInstructorsCount[0]?.count ?? 0,
        ),
      },
    };
  } catch (error) {
    console.error("Failed to fetch admin dashboard stats:", error);

    return {
      success: false,
      message: "Failed to fetch dashboard statistics.",
      data: {
        usersCount: 0,
        coursesCount: 0,
        activeEnrollmentsCount: 0,
        activeInstructorsCount: 0,
      },
    };
  }
}

/**
 * Fetch recently registered users
 */
export async function getRecentUsers(limit = 5) {
  try {

    // Fetch latest users
    const recentUsers = await db
      .select({
        id: users.id,
        name: users.fullName,
        cnic: users.cnic,
        role: users.role,
        status: users.status,
        joinDate: users.createdAt,
      })
      .from(users)
      .where(isNull(users.deletedAt))
      .orderBy(desc(users.createdAt))
      .limit(limit);

    // Format user response
    const formattedUsers = recentUsers.map((user) => ({
      id: user.id,
      name: user.name,
      cnic: user.cnic,

      role:
        user.role.charAt(0).toUpperCase() +
        user.role.slice(1),

      status:
        user.status.charAt(0).toUpperCase() +
        user.status.slice(1),

      joinDate: format(
        new Date(user.joinDate),
        "MMM dd, yyyy",
      ),
    }));

    return {
      success: true,
      data: formattedUsers,
    };
  } catch (error) {
    console.error("[getRecentUsers]: Failed to fetch recent users:", error);

    return {
      success: false,
      message: "Failed to fetch recent users.",
      data: [],
    };
  }
}

/**
 * Fetch user role distribution statistics
 */
export async function getUserDistribution() {
  try {

    const roleCounts = await db
      .select({
        role: users.role,
        count: count(),
      })
      .from(users)
      .where(isNull(users.deletedAt))
      .groupBy(users.role);

    const distribution = {
      admin: 0,
      trainer: 0,
      student: 0,
    };

    roleCounts.forEach((item) => {
      distribution[item.role] = Number(item.count);
    });

    return {
      success: true,
      data: distribution,
    };
  } catch (error) {
    console.error(
      "Failed to fetch user distribution:",
      error,
    );

    return {
      success: false,
      message: "Failed to fetch user distribution.",
      data: {
        admin: 0,
        trainer: 0,
        student: 0,
      },
    };
  }
}


export async function getTrainerStats() {
  try {
    // Ensure only trainers can access this endpoint
    const user = await requireRole("trainer");

    // Find trainer profile
    const [trainer] = await db
      .select({
        id: trainerProfiles.id,
      })
      .from(trainerProfiles)
      .where(
        and(
          eq(trainerProfiles.userId, user.id),
          isNull(trainerProfiles.deletedAt),
        ),
      )
      .limit(1);

    if (!trainer) {
      return {
        success: false,
        message: "Trainer profile not found.",
        data: {
          coursesCount: 0,
          batchesCount: 0,
          studentsCount: 0,
          totalClasses: 0,
        },
      };
    }

    // Fetch all active batches assigned to trainer
const batches = await db
  .select({
    id: courseBatches.id,
    courseId: courseBatches.courseId,
  })
  .from(courseBatches)
  .where(
    and(
      eq(courseBatches.trainerId, trainer.id),
      isNull(courseBatches.deletedAt),

      // Batch is still active
      or(
        gte(courseBatches.endDate, sql`CURDATE()`),
        isNull(courseBatches.endDate),
      ),
    ),
  );

    const batchIds = batches.map((b) => b.id);
    const courseIds = [...new Set(batches.map((b) => b.courseId))];

    // Today's weekday
    const weekdays = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ] as const;

    const today = weekdays[getDay(new Date())];

    const [
      coursesCount,
      studentsCount,
      classesToday,
    ] = await Promise.all([
      courseIds.length
        ? db
            .select({ count: count() })
            .from(courses)
            .where(
              and(
                inArray(courses.id, courseIds),
                isNull(courses.deletedAt),
              ),
            )
        : [{ count: 0 }],

      batchIds.length
        ? db
            .select({ count: count() })
            .from(enrollments)
            .where(
              and(
                inArray(enrollments.batchId, batchIds),
                eq(enrollments.status, "active"),
                isNull(enrollments.deletedAt),
              ),
            )
        : [{ count: 0 }],

      batchIds.length
        ? db
            .select({ count: count() })
            .from(batchSchedules)
            .where(
              and(
                inArray(batchSchedules.batchId, batchIds),
                eq(batchSchedules.weekday, today),
              ),
            )
        : [{ count: 0 }],
    ]);

    return {
      success: true,
      data: {
        coursesCount: Number(coursesCount[0]?.count ?? 0),
        batchesCount: batchIds.length,
        studentsCount: Number(studentsCount[0]?.count ?? 0),
        totalClasses: Number(classesToday[0]?.count ?? 0),
      },
    };
  } catch (error) {
    console.error("Failed to fetch trainer dashboard stats:", error);

    return {
      success: false,
      message: "Failed to fetch trainer dashboard statistics.",
      data: {
        coursesCount: 0,
        batchesCount: 0,
        studentsCount: 0,
        totalClasses: 0,
      },
    };
  }
}


export async function getTrainerBatches(): Promise<TrainerBatchesResponse> {
  try {
    // Protect route: only trainers allowed
    const user = await requireRole("trainer");

    // Get trainer profile
    const [trainer] = await db
      .select({
        id: trainerProfiles.id,
      })
      .from(trainerProfiles)
      .where(
        and(
          eq(trainerProfiles.userId, user.id),
          isNull(trainerProfiles.deletedAt),
        ),
      )
      .limit(1);

    if (!trainer) {
      return {
        success: false,
        message: "Trainer profile not found.",
        data: [],
      };
    }

    const today = new Date();

    const batches = await db
      .select({
        batchId: courseBatches.id,

        courseName: courses.title,
        duration: courses.durationWeeks,

        batchName: courseBatches.batchName,
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
        eq(courseBatches.courseId, courses.id),
      )
      .leftJoin(
        batchSchedules,
        eq(courseBatches.id, batchSchedules.batchId),
      )
      .where(
  and(
    eq(courseBatches.trainerId, trainer.id),
    isNull(courseBatches.deletedAt),
    isNull(courses.deletedAt),

    // Exclude batches that have already ended
    or(
      gte(courseBatches.endDate, today),
      isNull(courseBatches.endDate),
    ),
  ),
);


    // Group schedules by batch
    const groupedBatches = batches.reduce<
      Record<string, TrainerBatch>
    >((acc, batch) => {
      if (!acc[batch.batchId]) {

        const isScheduled =
    batch.startDate &&
    batch.startDate.getTime() > today.getTime();

        acc[batch.batchId] = {
          batchId: batch.batchId,
          courseName: batch.courseName,
          batchName: batch.batchName,
          duration: batch.duration ?? 0,
          startDate: batch.startDate,
          endDate: batch.endDate ?? null,
          status: isScheduled ? "scheduled" : "live",
          schedule: [],
        };
      }

      if (batch.scheduleId) {
        acc[batch.batchId].schedule.push({
          id: batch.scheduleId,
          weekday: batch.weekday as WeekDays,
          startTime: batch.startTime!,
          endTime: batch.endTime!,
          room: batch.room,
        });
      }

      return acc;
    }, {});


    return {
      success: true,
      data: Object.values(groupedBatches),
    };
  } catch (error) {
    console.error(
      "Failed to fetch trainer batches:",
      error,
    );

    return {
      success: false,
      message: "Failed to fetch trainer batches.",
      data: [],
    };
  }
}