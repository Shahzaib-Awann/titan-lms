"use server";

import { db } from "@/lib/db";
import {
  eq,
  isNull,
  and,
  inArray,
  sql,
  or,
  like,
  asc,
  desc,
} from "drizzle-orm";
import {
  users,
  trainerProfiles,
  courses,
  courseBatches,
  batchSchedules,
  assets,
  moduleProgress,
  enrollments,
  moduleLessons,
  courseModules,
  studentProfiles,
} from "@/lib/db/schema";
import { BatchFormSchema } from "@/lib/zod/admin.schema";
import { requireRole, requireTrainer } from "./auth.action";
import z from "zod";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import { BatchStatus, LessonStatus } from "@/types/common";

/**
 * Fetches active trainers for selection options.
 *
 * @returns List of active trainer IDs and names.
 */
export async function getActiveTrainerOptions() {
  return db
    .select({
      id: trainerProfiles.id,
      name: users.fullName,
    })
    .from(trainerProfiles)
    .innerJoin(users, eq(trainerProfiles.userId, users.id))
    .where(
      and(
        eq(users.role, "trainer"),
        eq(users.status, "active"),
        isNull(users.deletedAt),
        isNull(trainerProfiles.deletedAt),
      ),
    )
    .orderBy(users.fullName);
}

/**
 * Fetches active courses for selection options.
 *
 * @returns List of active course IDs and titles.
 */
export async function getActiveCoursesOptions() {
  return db
    .select({
      id: courses.id,
      title: courses.title,
    })
    .from(courses)
    .where(isNull(courses.deletedAt))
    .orderBy(courses.title);
}

/**
 * Fetches all active course batches with trainer and schedule details.
 *
 * @returns Course batches with trainer info, dates, schedules, and status.
 */
export async function getCourseBatches() {
  try {
    const rows = await db
      .select({
        id: courseBatches.id,
        batchName: courseBatches.batchName,
        courseName: courses.title,
        trainerName: users.fullName,
        trainerAvatar: assets.url,
        startDate: courseBatches.startDate,
        endDate: courseBatches.endDate,
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
      .innerJoin(
        trainerProfiles,
        and(
          eq(courseBatches.trainerId, trainerProfiles.id),
          isNull(trainerProfiles.deletedAt),
        ),
      )
      .innerJoin(
        users,
        and(
          eq(trainerProfiles.userId, users.id),
          eq(users.status, "active"),
          isNull(users.deletedAt),
        ),
      )
      .leftJoin(
        assets,
        and(eq(users.avatarAssetId, assets.id), isNull(assets.deletedAt)),
      )
      .leftJoin(batchSchedules, eq(courseBatches.id, batchSchedules.batchId))
      .where(isNull(courseBatches.deletedAt))
      .orderBy(courseBatches.startDate);

    const batchMap = new Map();
    const today = new Date();

    for (const row of rows) {
      let batch = batchMap.get(row.id);

      if (!batch) {
        const start = new Date(row.startDate);
        const end = row.endDate ? new Date(row.endDate) : null;
        let status: BatchStatus;

        if (today < start) {
          status = "upcoming";
        } else if (!end || today <= end) {
          status = "running";
        } else {
          status = "completed";
        }

        batch = {
          id: row.id,
          batchName: row.batchName,
          courseName: row.courseName,
          trainer: {
            name: row.trainerName,
            avatar: row.trainerAvatar,
          },
          dateRange: {
            startDate: row.startDate,
            endDate: row.endDate,
          },
          schedules: [],
          status,
        };

        batchMap.set(row.id, batch);
      }

      if (row.weekday) {
        batch.schedules.push({
          weekday: row.weekday,
          startTime: row.startTime,
          endTime: row.endTime,
          room: row.room,
        });
      }
    }

    return Array.from(batchMap.values());
  } catch (error) {
    console.error("getCourseBatches Error:", error);

    throw new Error("Failed to fetch course batches.");
  }
}

/**
 * Fetches course batch details for editing.
 *
 * @param id - ID of the course batch to fetch.
 * @returns Batch details with schedule information.
 */
export async function getCourseBatchForEdit(id: string) {
  try {
    await requireRole("admin");

    const rows = await db
      .select({
        id: courseBatches.id,
        courseId: courseBatches.courseId,
        trainerId: courseBatches.trainerId,
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
        and(eq(courseBatches.courseId, courses.id), isNull(courses.deletedAt)),
      )
      .leftJoin(batchSchedules, eq(courseBatches.id, batchSchedules.batchId))
      .where(and(eq(courseBatches.id, id), isNull(courseBatches.deletedAt)));

    if (!rows.length) {
      return null;
    }

    const batch = rows[0];

    return {
      id: batch.id,
      courseId: batch.courseId,
      trainerId: batch.trainerId,
      batchName: batch.batchName,
      startDate: batch.startDate.toISOString().split("T")[0],

      endDate: batch.endDate ? batch.endDate.toISOString().split("T")[0] : null,

      schedules: rows
        .filter((row) => row.scheduleId)
        .map((row) => ({
          id: row.scheduleId ?? undefined,
          weekday: row.weekday!,
          startTime: row.startTime ?? "",
          endTime: row.endTime ?? "",
          room: row.room ?? "",
        })),
    };
  } catch (error) {
    console.error("getCourseBatchForEdit Error:", error);

    throw new Error(
      error instanceof Error ? error.message : "Failed to fetch course batch.",
    );
  }
}

/**
 * Creates or updates a course batch with its schedules.
 *
 * @param data - Course batch details and schedule information.
 * @returns Success status after saving the batch.
 */
export async function saveCourseBatch(data: z.infer<typeof BatchFormSchema>) {
  try {
    await requireRole("admin");

    // Handles all validation
    const parsed = BatchFormSchema.parse(data);

    await db.transaction(async (tx) => {
      let batchId = parsed.id;

      /**
       * CREATE BATCH
       */
      if (!batchId) {
        batchId = nanoid();

        await tx.insert(courseBatches).values({
          id: batchId,
          courseId: parsed.courseId,
          trainerId: parsed.trainerId,
          batchName: parsed.batchName,
          startDate: new Date(parsed.startDate),
          endDate: parsed.endDate ? new Date(parsed.endDate) : null,
        });
      } else {
        /**
         * UPDATE BATCH
         */
        await tx
          .update(courseBatches)
          .set({
            courseId: parsed.courseId,
            trainerId: parsed.trainerId,
            batchName: parsed.batchName,
            startDate: new Date(parsed.startDate),
            endDate: parsed.endDate ? new Date(parsed.endDate) : null,
            updatedAt: new Date(),
          })
          .where(eq(courseBatches.id, batchId));

        /**
         * Sync schedules
         */

        const existingSchedules = await tx
          .select({
            id: batchSchedules.id,
          })
          .from(batchSchedules)
          .where(eq(batchSchedules.batchId, batchId));

        const existingIds = existingSchedules.map((item) => item.id);

        const submittedIds = parsed.schedules
          .filter((item) => item.id)
          .map((item) => item.id!);

        const deletedIds = existingIds.filter(
          (id) => !submittedIds.includes(id),
        );

        if (deletedIds.length) {
          await tx
            .delete(batchSchedules)
            .where(inArray(batchSchedules.id, deletedIds));
        }

        for (const schedule of parsed.schedules) {
          if (schedule.id) {
            await tx
              .update(batchSchedules)
              .set({
                weekday: schedule.weekday,
                startTime: schedule.startTime,
                endTime: schedule.endTime,
                room: schedule.room || null,
              })
              .where(eq(batchSchedules.id, schedule.id));
          } else {
            await tx.insert(batchSchedules).values({
              id: nanoid(),
              batchId,
              weekday: schedule.weekday,
              startTime: schedule.startTime,
              endTime: schedule.endTime,
              room: schedule.room || null,
            });
          }
        }

        return;
      }

      /**
       * CREATE SCHEDULES
       */
      await tx.insert(batchSchedules).values(
        parsed.schedules.map((schedule) => ({
          id: nanoid(),
          batchId: batchId!,
          weekday: schedule.weekday,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          room: schedule.room || null,
        })),
      );
    });

    revalidatePath("/admin/batches");

    return {
      success: true,
    };
  } catch (error) {
    console.error("saveCourseBatch Error:", error);

    throw new Error(
      error instanceof Error ? error.message : "Failed to save course batch.",
    );
  }
}

/**
 * Soft deletes a course batch.
 *
 * @param id - ID of the course batch to delete.
 * @returns Success status with the deleted batch ID.
 */
export async function deleteCourseBatch(id: string) {
  try {
    await requireRole("admin");

    return await db.transaction(async (tx) => {
      const [batch] = await tx
        .select({
          id: courseBatches.id,
        })
        .from(courseBatches)
        .where(and(eq(courseBatches.id, id), isNull(courseBatches.deletedAt)))
        .limit(1);

      if (!batch) {
        throw new Error("Course batch not found.");
      }

      /**
       * Soft delete batch
       */
      await tx
        .update(courseBatches)
        .set({
          deletedAt: new Date(),
        })
        .where(eq(courseBatches.id, id));

      revalidatePath("/admin/course-batches");

      return {
        success: true,
        id,
      };
    });
  } catch (error) {
    console.error("deleteCourseBatch Error:", error);

    throw new Error(
      error instanceof Error ? error.message : "Failed to delete course batch.",
    );
  }
}

export async function getAssignedBatches(options?: {
  search?: string;
  sort?: "asc" | "desc";
}) {
  const { search, sort = "asc" } = options ?? {};

  try {
    const user = await requireRole(["trainer", "student"]);

    const searchTerm = search?.trim();

    const searchCondition = searchTerm
      ? or(
          like(courseBatches.batchName, `%${searchTerm}%`),
          like(courses.title, `%${searchTerm}%`),
          like(courses.description, `%${searchTerm}%`),
        )
      : undefined;

    const result = await db.transaction(async (tx) => {
      let batches;

      // ==========================================
      // TRAINER
      // ==========================================
      if (user.role === "trainer") {
        batches = await tx
          .select({
            batchId: courseBatches.id,
            batchName: courseBatches.batchName,

            courseId: courses.id,
            courseName: courses.title,

            duration: courses.durationWeeks,

            startDate: courseBatches.startDate,
            endDate: courseBatches.endDate,
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
          .where(and(isNull(courseBatches.deletedAt), searchCondition))
          .orderBy(
            sort === "asc"
              ? asc(courseBatches.batchName)
              : desc(courseBatches.batchName),
          );
      }

      // ==========================================
      // STUDENT
      // ==========================================
      else {
        batches = await tx
          .select({
            batchId: courseBatches.id,
            batchName: courseBatches.batchName,

            courseId: courses.id,
            courseName: courses.title,

            duration: courses.durationWeeks,

            startDate: courseBatches.startDate,
            endDate: courseBatches.endDate,
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
          .innerJoin(courseBatches, eq(enrollments.batchId, courseBatches.id))
          .innerJoin(
            courses,
            and(
              eq(courseBatches.courseId, courses.id),
              isNull(courses.deletedAt),
            ),
          )
          .where(
            and(
              isNull(enrollments.deletedAt),
              isNull(courseBatches.deletedAt),
              searchCondition,
            ),
          )
          .orderBy(
            sort === "asc"
              ? asc(courseBatches.batchName)
              : desc(courseBatches.batchName),
          );
      }

      // Remove possible duplicate batches
      const uniqueBatches = Array.from(
        new Map(batches.map((batch) => [batch.batchId, batch])).values(),
      );

      if (!uniqueBatches.length) {
        return {
          batches: [],
          schedules: [],
          syllabusCounts: [],
          studentCounts: [],
          completedLessons: [],
        };
      }

      const batchIds = uniqueBatches.map((batch) => batch.batchId);
      const courseIds = [
        ...new Set(uniqueBatches.map((batch) => batch.courseId)),
      ];

      // ==========================================
      // RELATED DATA
      // ==========================================

      const schedulesPromise = tx
        .select()
        .from(batchSchedules)
        .where(inArray(batchSchedules.batchId, batchIds));

      const syllabusPromise = tx
        .select({
          courseId: courses.id,

          moduleCount: sql<number>`
            COUNT(DISTINCT ${courseModules.id})
          `,

          lessonCount: sql<number>`
            COUNT(DISTINCT ${moduleLessons.id})
          `,
        })
        .from(courses)
        .leftJoin(courseModules, eq(courseModules.courseId, courses.id))
        .leftJoin(moduleLessons, eq(moduleLessons.moduleId, courseModules.id))
        .where(inArray(courses.id, courseIds))
        .groupBy(courses.id);

      const completedLessonsPromise = tx
        .select({
          batchId: moduleProgress.batchId,

          completed: sql<number>`
            COUNT(DISTINCT ${moduleProgress.lessonId})
          `,
        })
        .from(moduleProgress)
        .where(
          and(
            inArray(moduleProgress.batchId, batchIds),
            eq(moduleProgress.status, "completed"),
          ),
        )
        .groupBy(moduleProgress.batchId);

      // Student count is only required for trainer
      const studentCountsPromise =
        user.role === "trainer"
          ? tx
              .select({
                batchId: enrollments.batchId,

                studentCount: sql<number>`
                  COUNT(DISTINCT ${enrollments.studentId})
                `,
              })
              .from(enrollments)
              .where(
                and(
                  inArray(enrollments.batchId, batchIds),
                  eq(enrollments.status, "active"),
                  isNull(enrollments.deletedAt),
                ),
              )
              .groupBy(enrollments.batchId)
          : Promise.resolve([]);

      const [schedules, syllabusCounts, studentCounts, completedLessons] =
        await Promise.all([
          schedulesPromise,
          syllabusPromise,
          studentCountsPromise,
          completedLessonsPromise,
        ]);

      return {
        batches: uniqueBatches,
        schedules,
        syllabusCounts,
        studentCounts,
        completedLessons,
      };
    });

    const {
      batches,
      schedules,
      syllabusCounts,
      studentCounts,
      completedLessons,
    } = result;

    if (!batches.length) {
      return {
        success: true,
        message: "No batches found.",
        data: [],
      };
    }

    // ==========================================
    // SCHEDULE MAP
    // ==========================================

    const scheduleMap = new Map<string, typeof schedules>();

    for (const schedule of schedules) {
      const existing = scheduleMap.get(schedule.batchId);

      if (existing) {
        existing.push(schedule);
      } else {
        scheduleMap.set(schedule.batchId, [schedule]);
      }
    }

    // ==========================================
    // SYLLABUS MAP
    // ==========================================

    const syllabusMap = new Map(
      syllabusCounts.map((item) => [
        item.courseId,
        {
          moduleCount: Number(item.moduleCount),
          lessonCount: Number(item.lessonCount),
        },
      ]),
    );

    // ==========================================
    // STUDENT COUNT MAP
    // ==========================================

    const studentMap = new Map(
      studentCounts.map((item) => [item.batchId, Number(item.studentCount)]),
    );

    // ==========================================
    // PROGRESS MAP
    // ==========================================

    const progressMap = new Map(
      completedLessons.map((item) => [item.batchId, Number(item.completed)]),
    );

    // ==========================================
    // BUILD RESPONSE
    // ==========================================

    const data = batches.map((batch) => {
      const syllabus = syllabusMap.get(batch.courseId) ?? {
        moduleCount: 0,
        lessonCount: 0,
      };

      const completed = progressMap.get(batch.batchId) ?? 0;

      const baseBatch = {
        batchId: batch.batchId,
        batchName: batch.batchName,

        courseId: batch.courseId,
        courseName: batch.courseName,

        duration: batch.duration,

        startDate: batch.startDate,
        endDate: batch.endDate,

        moduleCount: syllabus.moduleCount,
        lessonCount: syllabus.lessonCount,

        progressPercentage:
          syllabus.lessonCount === 0
            ? 0
            : Math.round((completed / syllabus.lessonCount) * 100),

        schedule: scheduleMap.get(batch.batchId) ?? [],

        studentCount:
          user.role === "trainer"
            ? (studentMap.get(batch.batchId) ?? 0)
            : undefined,
      };

      // Student does NOT get student count
      return baseBatch;
    });

    return {
      success: true,
      message: "Dashboard batches fetched successfully.",
      data,
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

/**
 * Fetches batch summary details for the trainer layout.
 *
 * @param batchId - ID of the batch to fetch.
 * @returns Batch details including course info, dates, and schedule.
 */
export async function getTrainerBatchSummeryForLayout(batchId: string) {
  try {
    // Get authenticated trainer user
    const user = await requireRole("trainer");

    // Fetch trainer's batch with schedule
    const rows = await db
      .select({
        batchId: courseBatches.id,
        batchName: courseBatches.batchName,

        courseId: courses.id,
        courseName: courses.title,

        startDate: courseBatches.startDate,
        endDate: courseBatches.endDate,

        scheduleId: batchSchedules.id,
        weekday: batchSchedules.weekday,
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
      .innerJoin(courses, eq(courseBatches.courseId, courses.id))
      .leftJoin(batchSchedules, eq(batchSchedules.batchId, courseBatches.id))
      .where(
        and(
          eq(courseBatches.id, batchId),
          isNull(courseBatches.deletedAt),
          isNull(courses.deletedAt),
        ),
      );

    // Batch not found or doesn't belong to trainer
    if (!rows.length) {
      return {
        success: false,
        status: "not_found" as const,
        message: "Batch not found",
      };
    }

    const first = rows[0];

    // Unique weekdays
    const schedule = [
      ...new Set(
        rows
          .map((row) => row.weekday)
          .filter(
            (day): day is NonNullable<typeof day> =>
              day !== null && day !== undefined,
          ),
      ),
    ];

    return {
      success: true,
      status: "success" as const,
      data: {
        batchId: first.batchId,
        batchName: first.batchName,

        courseId: first.courseId,
        courseName: first.courseName,

        startDate: first.startDate,
        endDate: first.endDate,

        schedule,
      },
    };
  } catch (error) {
    console.error("getTrainerBatchSummeryForLayout:", error);

    return {
      success: false,
      status: "not_found" as const,
      message: "Batch not found",
    };
  }
}

/**
 * Fetches lesson progress summary for a trainer's batch.
 *
 * @param batchId - ID of the batch to fetch summary for.
 * @returns Lesson counts and progress details for the batch.
 */
export async function getTrainerBatchLessonSummary(batchId: string) {
  try {
    // --------------------------------------------------
    // 1. Logged in user
    // --------------------------------------------------

    const { trainer } = await requireTrainer();

    // --------------------------------------------------
    // 3. Verify Batch Ownership + Course
    // --------------------------------------------------

    const [batch] = await db
      .select({
        batchId: courseBatches.id,
        courseId: courses.id,
      })
      .from(courseBatches)
      .innerJoin(courses, eq(courseBatches.courseId, courses.id))
      .where(
        and(
          eq(courseBatches.id, batchId),
          eq(courseBatches.trainerId, trainer.id),
          isNull(courseBatches.deletedAt),
          isNull(courses.deletedAt),
        ),
      )
      .limit(1);

    if (!batch) {
      return {
        success: false,
        status: "not_found" as const,
        message: "Batch not found",
      };
    }

    // --------------------------------------------------
    // 4. Fetch lesson + progress summary
    // --------------------------------------------------

    const [summary] = await db
      .select({
        totalLessonsCount: sql<number>`
          COUNT(DISTINCT ${moduleLessons.id})
        `,

        completedLessonCount: sql<number>`
          SUM(
            CASE
              WHEN ${moduleProgress.status} = 'completed'
              THEN 1
              ELSE 0
            END
          )
        `,

        activeLessonCount: sql<number>`
          SUM(
            CASE
              WHEN ${moduleProgress.status} = 'in_progress'
              THEN 1
              ELSE 0
            END
          )
        `,

        skippedLessonCount: sql<number>`
          SUM(
            CASE
              WHEN ${moduleProgress.status} = 'skipped'
              THEN 1
              ELSE 0
            END
          )
        `,

        notStartedLessonCount: sql<number>`
          SUM(
            CASE
              WHEN ${moduleProgress.id} IS NULL
              OR ${moduleProgress.status} = 'not_started'
              THEN 1
              ELSE 0
            END
          )
        `,
      })
      .from(courseModules)
      .innerJoin(moduleLessons, eq(moduleLessons.moduleId, courseModules.id))
      .leftJoin(
        moduleProgress,
        and(
          eq(moduleProgress.lessonId, moduleLessons.id),
          eq(moduleProgress.batchId, batchId),
        ),
      )
      .where(eq(courseModules.courseId, batch.courseId));

    const totalLessons = Number(summary?.totalLessonsCount ?? 0);

    const completedLessons = Number(summary?.completedLessonCount ?? 0);

    const progressPercentage =
      totalLessons === 0
        ? 0
        : Math.round((completedLessons / totalLessons) * 100);

    // --------------------------------------------------
    // 5. Response
    // --------------------------------------------------

    return {
      success: true,
      status: "success" as const,

      data: {
        totalLessonsCount: totalLessons,

        completedLessonCount: completedLessons,

        activeLessonCount: Number(summary?.activeLessonCount ?? 0),

        skippedLessonCount: Number(summary?.skippedLessonCount ?? 0),

        notStartedLessonCount: Number(summary?.notStartedLessonCount ?? 0),

        progressPercentage,
      },
    };
  } catch (error) {
    console.error("getTrainerBatchLessonSummary error:", error);

    return {
      success: false,
      status: "error" as const,
      message: "Failed to get batch lesson summary",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Fetches curriculum roadmap and lesson progress for a trainer's batch.
 *
 * @param batchId - ID of the batch to fetch roadmap for.
 * @returns Modules with lessons, progress status, and completion details.
 */
export async function getTrainerBatchCurriculumRoadmap(batchId: string) {
  try {
    // Get authenticated trainer
    const user = await requireRole("trainer");

    const rows = await db.transaction(async (tx) => {
      // Verify ownership and get course
      const [batch] = await tx
        .select({
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
        .where(
          and(eq(courseBatches.id, batchId), isNull(courseBatches.deletedAt)),
        )
        .limit(1);

      if (!batch) {
        return null;
      }

      // Fetch curriculum with lesson progress
      return tx
        .select({
          moduleId: courseModules.id,
          moduleTitle: courseModules.title,
          moduleDescription: courseModules.description,
          moduleOrderIndex: courseModules.orderIndex,

          lessonId: moduleLessons.id,
          lessonTitle: moduleLessons.title,
          lessonDescription: moduleLessons.description,
          lessonOrderIndex: moduleLessons.orderIndex,

          progressStatus: moduleProgress.status,
        })
        .from(courseModules)
        .innerJoin(moduleLessons, eq(moduleLessons.moduleId, courseModules.id))
        .leftJoin(
          moduleProgress,
          and(
            eq(moduleProgress.lessonId, moduleLessons.id),
            eq(moduleProgress.batchId, batchId),
          ),
        )
        .where(eq(courseModules.courseId, batch.courseId))
        .orderBy(asc(courseModules.orderIndex), asc(moduleLessons.orderIndex));
    });

    // Batch not found or doesn't belong to trainer
    if (!rows) {
      return {
        success: false,
        message: "Batch not found",
        data: [],
      };
    }

    if (!rows.length) {
      return {
        success: true,
        message: "No curriculum found",
        data: [],
      };
    }

    type Lesson = {
      id: string;
      title: string;
      description: string | null;
      orderIndex: number;
      progressStatus: LessonStatus;
    };

    const moduleMap = new Map<
      string,
      {
        id: string;
        title: string;
        description: string | null;
        orderIndex: number;
        lessons: Lesson[];
      }
    >();

    // Group lessons by module
    for (const row of rows) {
      let courseModule = moduleMap.get(row.moduleId);

      if (!courseModule) {
        courseModule = {
          id: row.moduleId,
          title: row.moduleTitle,
          description: row.moduleDescription,
          orderIndex: row.moduleOrderIndex,
          lessons: [],
        };

        moduleMap.set(row.moduleId, courseModule);
      }

      courseModule.lessons.push({
        id: row.lessonId,
        title: row.lessonTitle,
        description: row.lessonDescription,
        orderIndex: row.lessonOrderIndex,
        progressStatus: row.progressStatus ?? "not_started",
      });
    }

    // Build response
    const data = Array.from(moduleMap.values()).map((courseModule) => {
      let completedLessons = 0;
      let activeLessons = 0;

      for (const lesson of courseModule.lessons) {
        if (lesson.progressStatus === "completed") {
          completedLessons++;
          activeLessons++;
        } else if (
          lesson.progressStatus === "in_progress" ||
          lesson.progressStatus === "skipped"
        ) {
          activeLessons++;
        }
      }

      const totalLessons = courseModule.lessons.length;

      const progressPercentage =
        totalLessons === 0
          ? 0
          : Math.round((completedLessons / totalLessons) * 100);

      let status: "completed" | "in_progress" | "not_started";

      if (completedLessons === totalLessons) {
        status = "completed";
      } else if (activeLessons > 0) {
        status = "in_progress";
      } else {
        status = "not_started";
      }

      return {
        id: courseModule.id,
        title: courseModule.title,
        description: courseModule.description,
        orderIndex: courseModule.orderIndex,

        status,
        moduleProgressPercentage: progressPercentage,
        totalLessonsCount: totalLessons,

        lessons: courseModule.lessons,
      };
    });

    return {
      success: true,
      message: "Curriculum roadmap fetched successfully",
      data,
    };
  } catch (error) {
    console.error("getTrainerBatchCurriculumRoadmap:", error);

    return {
      success: false,
      message: "Failed to fetch curriculum roadmap",
      error: error instanceof Error ? error.message : "Unknown error",
      data: [],
    };
  }
}

/**
 * Updates lesson progress status for a trainer's batch.
 *
 * @param payload - Batch, module, lesson IDs and progress status.
 * @returns Updated lesson progress details or an error response.
 */
export async function updateTrainerLessonProgress(payload: {
  moduleId: string;
  lessonId: string;
  action: LessonStatus;
  batchId: string;
}) {
  try {
    const { moduleId, lessonId, action, batchId } = payload;

    // Validate allowed lesson statuses
    const allowedStatuses = [
      "not_started",
      "in_progress",
      "completed",
      "skipped",
    ] as const;

    if (!allowedStatuses.includes(action)) {
      throw new Error("Invalid lesson progress status");
    }

    const user = await requireRole("trainer");

    const result = await db.transaction(async (tx) => {
      // Verify trainer owns batch and validate lesson
      const [lesson] = await tx
        .select({
          lessonId: moduleLessons.id,
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
          courseModules,
          eq(courseModules.courseId, courseBatches.courseId),
        )
        .innerJoin(moduleLessons, eq(moduleLessons.moduleId, courseModules.id))
        .where(
          and(
            eq(courseBatches.id, batchId),
            isNull(courseBatches.deletedAt),
            eq(courseModules.id, moduleId),
            eq(moduleLessons.id, lessonId),
          ),
        )
        .limit(1);

      if (!lesson) {
        return false;
      }

      // Avoid creating unnecessary not_started records
      if (action === "not_started") {
        await tx
          .delete(moduleProgress)
          .where(
            and(
              eq(moduleProgress.batchId, batchId),
              eq(moduleProgress.lessonId, lessonId),
            ),
          );

        return true;
      }

      // Insert or update progress
      await tx
        .insert(moduleProgress)
        .values({
          id: nanoid(),
          batchId,
          lessonId,
          status: action,
          completedAt: action === "completed" ? new Date() : null,
        })
        .onDuplicateKeyUpdate({
          set: {
            status: action,
            completedAt: action === "completed" ? new Date() : null,
            updatedAt: new Date(),
          },
        });

      return true;
    });

    if (!result) {
      return {
        success: false,
        message: "Lesson does not belong to this trainer batch",
      };
    }

    revalidatePath(`/trainer/batches/${batchId}/progress`);

    return {
      success: true,
      message: "Lesson progress updated successfully",
      data: {
        batchId,
        moduleId,
        lessonId,
        status: action,
      },
    };
  } catch (error) {
    console.error("updateTrainerLessonProgress:", error);

    return {
      success: false,
      message: "Failed to update lesson progress",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
