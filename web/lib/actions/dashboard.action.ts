"use server";

import { db } from "@/lib/db";
import {
  users,
  courses,
  trainerProfiles,
  enrollments,
  batchSchedules,
  courseBatches,
  studentProfiles,
} from "@/lib/db/schema";
import { format, getDay } from "date-fns";
import { count, eq, isNull, desc, and, or, gte, sql, exists, asc } from "drizzle-orm";
import { requireRole } from "./auth.action";
import { DashboardBatch, DashboardBatchesResponse } from "@/types/dashboards";
import { WeekDays } from "@/types/common";

/**
 * Fetches admin dashboard statistics.
 *
 * @returns User count, course count, active enrollments, and active instructors counts.
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
          and(eq(enrollments.status, "active"), isNull(enrollments.deletedAt)),
        ),
    ]);

    return {
      success: true,
      data: {
        usersCount: Number(usersCount[0]?.count ?? 0),
        coursesCount: Number(coursesCount[0]?.count ?? 0),
        activeEnrollmentsCount: Number(activeEnrollmentsCount[0]?.count ?? 0),
        activeInstructorsCount: Number(activeInstructorsCount[0]?.count ?? 0),
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
 * Fetches recently registered users.
 *
 * @param limit - Maximum number of users to fetch.
 * @returns Recent user details with formatted role, status, and join date.
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

      role: user.role.charAt(0).toUpperCase() + user.role.slice(1),

      status: user.status.charAt(0).toUpperCase() + user.status.slice(1),

      joinDate: format(new Date(user.joinDate), "MMM dd, yyyy"),
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
 * Fetches user role distribution statistics.
 *
 * @returns User count grouped by roles.
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
    console.error("Failed to fetch user distribution:", error);

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

/**
 * Fetches dashboard statistics for the authenticated trainer.
 *
 * @returns Trainer stats including courses, batches, students, and today's classes count.
 */
export async function getTrainerStats() {
  try {
    const user = await requireRole("trainer");

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

    // Get trainer's valid active/future batches
    const validBatches = db
      .select({
        batchId: courseBatches.id,
        courseId: courseBatches.courseId,
      })
      .from(courseBatches)
      .innerJoin(
        trainerProfiles,
        and(
          eq(courseBatches.trainerId, trainerProfiles.id),
          eq(trainerProfiles.userId, user.id),
          isNull(trainerProfiles.deletedAt),
        ),
      )
      .innerJoin(
        courses,
        and(eq(courseBatches.courseId, courses.id), isNull(courses.deletedAt)),
      )
      .where(
        and(
          isNull(courseBatches.deletedAt),

          // Active today, future, or ongoing batches
          or(
            gte(courseBatches.endDate, sql`CURDATE()`),
            isNull(courseBatches.endDate),
          ),
        ),
      )
      .as("active_batches");

    const [batchRows, studentRows, classRows] = await Promise.all([
      // Courses + batches count
      db
        .select({
          coursesCount: sql<number>`
              COUNT(DISTINCT ${validBatches.courseId})
            `,
          batchesCount: sql<number>`
              COUNT(DISTINCT ${validBatches.batchId})
            `,
        })
        .from(validBatches),

      // Active enrolled students
      db
        .select({
          studentsCount: sql<number>`
              COUNT(DISTINCT ${enrollments.studentId})
            `,
        })
        .from(validBatches)
        .innerJoin(
          enrollments,
          and(
            eq(enrollments.batchId, validBatches.batchId),
            eq(enrollments.status, "active"),
            isNull(enrollments.deletedAt),
          ),
        ),

      // Today's classes
      db
        .select({
          totalClasses: sql<number>`
              COUNT(DISTINCT ${batchSchedules.id})
            `,
        })
        .from(validBatches)
        .innerJoin(
          batchSchedules,
          and(
            eq(batchSchedules.batchId, validBatches.batchId),
            eq(batchSchedules.weekday, today),
          ),
        ),
    ]);

    return {
      success: true,
      data: {
        coursesCount: Number(batchRows[0]?.coursesCount ?? 0),

        batchesCount: Number(batchRows[0]?.batchesCount ?? 0),

        studentsCount: Number(studentRows[0]?.studentsCount ?? 0),

        totalClasses: Number(classRows[0]?.totalClasses ?? 0),
      },
    };
  } catch (error) {
    console.error("getTrainerStats:", error);

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


/**
* Fetches all batches accessible to the current user.
*
* @returns Accessible batches with course and schedule details.
*/
export async function getDashboardBatches(): Promise<DashboardBatchesResponse> {
  try {
    // Authorize User
    const user = await requireRole(["trainer", "student"]);

    // Access Condition
    const accessCondition =
      user.role === "trainer"
        ? exists(
            // Check if the batch belongs to the logged-in trainer.
            db
              .select({ id: trainerProfiles.id })
              .from(trainerProfiles)
              .where(
                and(
                  eq(
                    trainerProfiles.id,
                    courseBatches.trainerId,
                  ),
                  eq(trainerProfiles.userId, user.id),
                  isNull(trainerProfiles.deletedAt),
                ),
              ),
          )
        : exists(
            // Check if the logged-in student is enrolled in the batch.
            db
              .select({ id: enrollments.id })
              .from(enrollments)
              .innerJoin(
                studentProfiles,
                and(
                  eq(
                    enrollments.studentId,
                    studentProfiles.id,
                  ),
                  eq(studentProfiles.userId, user.id),
                  isNull(studentProfiles.deletedAt),
                ),
              )
              .where(
                and(
                  eq(
                    enrollments.batchId,
                    courseBatches.id,
                  ),
                  isNull(enrollments.deletedAt),
                ),
              ),
          );

    // Fetch all batches accessible to the current user.
    const rows = await db
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
        and(
          eq(
            courseBatches.courseId,
            courses.id,
          ),
          isNull(courses.deletedAt),
        ),
      )
      .leftJoin(
        batchSchedules,
        eq(
          courseBatches.id,
          batchSchedules.batchId,
        ),
      )
      .where(
        and(
          isNull(courseBatches.deletedAt),
          accessCondition,
        ),
      )
      .orderBy(
        asc(courseBatches.batchName),
        asc(batchSchedules.weekday),
        asc(batchSchedules.startTime),
      );

    // Return an empty list when no batches are found.
    if (rows.length === 0) {
      return {
        success: true,
        data: [],
      };
    }

    // Group multiple database rows into one batch object.
    const batchMap = new Map<string, DashboardBatch>();

    // Iterate over each row and group them by batchId.
    for (const row of rows) {

      // Check if this batch was already created.
      let batch = batchMap.get(row.batchId);

      // Create a new batch object if it doesn't exist.
      if (!batch) {
        batch = {
          batchId: row.batchId,

          courseName: row.courseName,
          batchName: row.batchName,

          duration: row.duration ?? 0,

          startDate: row.startDate,
          endDate: row.endDate ?? null,

          schedule: [],
        };

        batchMap.set(row.batchId, batch);
      }

      // Add the schedule only when one exists.
      if (row.scheduleId) {
        batch.schedule.push({
          id: row.scheduleId,
          weekday: row.weekday as WeekDays,
          startTime: row.startTime!,
          endTime: row.endTime!,
          room: row.room,
        });
      }
    }

    return {
      success: true,
      data: Array.from(batchMap.values()),
    };
  } catch (error) {
    console.error("getDashboardBatches failed:", error);

    return {
      success: false,
      message: "Failed to fetch dashboard batches.",
      data: [],
    };
  }
}



/**
* Fetches dashboard statistics for the current student.
*
* @returns Active batches, completed batches, and today's classes.
*/
export async function getStudentStats() {
  try {
    // Authorize User.
    const user = await requireRole("student");

    // Define weekday names matching JavaScript's getDay() values.
    const weekdays = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ] as const;

    // Get today's weekday name.
    const today = weekdays[getDay(new Date())];

    // Fetch all dashboard statistics in one query.
    const [stats] = await db
      .select({
        // Count unique batches where the student is active.
        activeBatches: sql<number>`
          COUNT(
            DISTINCT CASE
              WHEN ${enrollments.status} = 'active'
              THEN ${enrollments.batchId}
            END
          )
        `,

        // Count unique batches where the student has completed enrollment.
        completedBatches: sql<number>`
          COUNT(
            DISTINCT CASE
              WHEN ${enrollments.status} = 'completed'
              THEN ${enrollments.batchId}
            END
          )
        `,

        // Count today's scheduled classes for active enrollments.
        todayClasses: sql<number>`
          COUNT(
            DISTINCT CASE
              WHEN ${enrollments.status} = 'active'
              THEN ${batchSchedules.id}
            END
          )
        `,
      })
      .from(enrollments)
      .innerJoin(
        studentProfiles,
        and(
          eq(enrollments.studentId, studentProfiles.id),
          eq(studentProfiles.userId, user.id),
          isNull(studentProfiles.deletedAt),
        ),
      )
      .leftJoin(
        batchSchedules,
        and(
          eq(
            batchSchedules.batchId,
            enrollments.batchId,
          ),
          eq(batchSchedules.weekday, today),
        ),
      )
      .where(
        isNull(enrollments.deletedAt),
      );

    // Return the calculated dashboard statistics.
    return {
      success: true,
      message: "Student dashboard statistics fetched successfully.",
      data: {
        activeBatches: Number(stats?.activeBatches ?? 0),
        completedBatches: Number(stats?.completedBatches ?? 0),
        todayClasses: Number(stats?.todayClasses ?? 0),
      },
    };
  } catch (error) {
    console.error("getStudentStats failed:", error);

    return {
      success: false,
      message:
        "Failed to fetch student dashboard statistics.",
      data: {
        activeBatches: 0,
        completedBatches: 0,
        todayClasses: 0,
      },
    };
  }
}


