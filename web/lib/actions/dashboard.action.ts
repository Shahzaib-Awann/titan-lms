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
import { count, eq, isNull, desc, and, or, gte, sql } from "drizzle-orm";
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


export async function getDashboardBatches(): Promise<DashboardBatchesResponse> {
  try {
    const user = await requireRole(["trainer", "student"]);

    let rows;

    // =========================
    // TRAINER
    // =========================
    if (user.role === "trainer") {
      rows = await db
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
          trainerProfiles,
          and(
            eq(courseBatches.trainerId, trainerProfiles.id),
            eq(trainerProfiles.userId, user.id),
            isNull(trainerProfiles.deletedAt),
          ),
        )
        .innerJoin(
          courses,
          and(
            eq(courseBatches.courseId, courses.id),
            isNull(courses.deletedAt),
          ),
        )
        .leftJoin(
          batchSchedules,
          eq(courseBatches.id, batchSchedules.batchId),
        )
        .where(isNull(courseBatches.deletedAt));
    }

    // =========================
    // STUDENT
    // =========================
    else {
      rows = await db
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
        .from(enrollments)
        .innerJoin(
          studentProfiles,
          and(
            eq(enrollments.studentId, studentProfiles.id),
            eq(studentProfiles.userId, user.id),
            isNull(studentProfiles.deletedAt),
          ),
        )
        .innerJoin(
          courseBatches,
          eq(enrollments.batchId, courseBatches.id),
        )
        .innerJoin(
          courses,
          and(
            eq(courseBatches.courseId, courses.id),
            isNull(courses.deletedAt),
          ),
        )
        .leftJoin(
          batchSchedules,
          eq(courseBatches.id, batchSchedules.batchId),
        )
        .where(
          and(
            isNull(enrollments.deletedAt),
            isNull(courseBatches.deletedAt),
          ),
        );
    }

    if (!rows.length) {
      return {
        success: true,
        data: [],
      };
    }

    const batchMap = new Map<string, DashboardBatch>();

    // =========================
    // GROUP BATCHES
    // =========================
    for (const row of rows) {
      let batch = batchMap.get(row.batchId);

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
    console.error("getDashboardBatches:", error);

    return {
      success: false,
      message: "Failed to fetch dashboard batches.",
      data: [],
    };
  }
}



export async function getStudentStats() {
  try {
    const user = await requireRole("student");

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

    // Get student's profile
    const student = db
      .select({
        studentId: studentProfiles.id,
      })
      .from(studentProfiles)
      .where(
        and(
          eq(studentProfiles.userId, user.id),
          isNull(studentProfiles.deletedAt),
        ),
      )
      .as("student");

    const [activeRows, completedRows, classRows] = await Promise.all([
      // Active batches
      db
        .select({
          activeBatches: sql<number>`
            COUNT(DISTINCT ${enrollments.batchId})
          `,
        })
        .from(enrollments)
        .innerJoin(
          student,
          eq(enrollments.studentId, student.studentId),
        )
        .where(
          and(
            eq(enrollments.status, "active"),
            isNull(enrollments.deletedAt),
          ),
        ),

      // Completed batches
      db
        .select({
          completedBatches: sql<number>`
            COUNT(DISTINCT ${enrollments.batchId})
          `,
        })
        .from(enrollments)
        .innerJoin(
          student,
          eq(enrollments.studentId, student.studentId),
        )
        .where(
          and(
            eq(enrollments.status, "completed"),
            isNull(enrollments.deletedAt),
          ),
        ),

      // Today's classes from student's active batches
      db
        .select({
          todayClasses: sql<number>`
            COUNT(DISTINCT ${batchSchedules.id})
          `,
        })
        .from(enrollments)
        .innerJoin(
          student,
          eq(enrollments.studentId, student.studentId),
        )
        .innerJoin(
          batchSchedules,
          and(
            eq(batchSchedules.batchId, enrollments.batchId),
            eq(batchSchedules.weekday, today),
          ),
        )
        .where(
          and(
            eq(enrollments.status, "active"),
            isNull(enrollments.deletedAt),
          ),
        ),
    ]);

    return {
      success: true,
      message: "Student dashboard statistics fetched successfully.",
      data: {
        activeBatches: Number(activeRows[0]?.activeBatches ?? 0),
        completedBatches: Number(completedRows[0]?.completedBatches ?? 0),
        todayClasses: Number(classRows[0]?.todayClasses ?? 0),
      },
    };
  } catch (error) {
    console.error("getStudentStats:", error);

    return {
      success: false,
      message: "Failed to fetch student dashboard statistics.",
      data: {
        activeBatches: 0,
        completedBatches: 0,
        todayClasses: 0,
      },
    };
  }
}

