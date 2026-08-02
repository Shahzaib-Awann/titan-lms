"use server";

import { db } from "@/lib/db";
import { eq, isNull, and, inArray, sql, or, gte, like, asc, desc } from "drizzle-orm";
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
} from "@/lib/db/schema";
import { BatchFormSchema } from "@/lib/zod/admin.schema";
import { requireRole } from "./auth.action";
import z from "zod";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import { BatchStatus } from "@/types/common";

/**
 * Get all active trainers for batch dropdown
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
 * Get all active courses for batch dropdown
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
 * Fetch all active course batches with schedules
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
 * Fetch single course batch by ID for edit
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
 * Create or update course batch
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
 * Soft delete course batch
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

export async function getTrainerActiveBatches(options?: {
  search?: string;
  sort?: "asc" | "desc";
}) {

  const { search, sort = "asc" } = options ?? {};

  try {
    // --------------------------------------------------
    // 1. Logged in user
    // --------------------------------------------------

    const user = await requireRole("trainer");

    // --------------------------------------------------
    // 2. Trainer Profile
    // --------------------------------------------------

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

    // --------------------------------------------------
    // 3. Search matching batch ids
    // --------------------------------------------------

    let batchIds: string[] | undefined;

    if (search?.trim()) {
      const term = `%${search.trim()}%`;

      const rows = await db
        .selectDistinct({
          id: courseBatches.id,
        })
        .from(courseBatches)
        .innerJoin(courses, eq(courseBatches.courseId, courses.id))
        .where(
          and(
            eq(courseBatches.trainerId, trainer.id),
            isNull(courseBatches.deletedAt),
            or(
              gte(courseBatches.endDate, today),
              isNull(courseBatches.endDate)
            ),
            or(
              like(courseBatches.batchName, term),
              like(courses.title, term),
              like(courses.description, term)
            )
          )
        );

      batchIds = rows.map((x) => x.id);

      if (batchIds.length === 0) {
        return {
          success: true,
          message: "No batches found",
          data: [],
        };
      }
    }

    // --------------------------------------------------
    // 4. Main Batch Query
    // --------------------------------------------------

    const batches = await db
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
      .innerJoin(courses, eq(courseBatches.courseId, courses.id))
      .where(
        and(
          eq(courseBatches.trainerId, trainer.id),
          isNull(courseBatches.deletedAt),

          or(
            gte(courseBatches.endDate, today),
            isNull(courseBatches.endDate)
          ),

          batchIds
            ? inArray(courseBatches.id, batchIds)
            : undefined
        )
      )
      .orderBy(
        sort === "asc"
          ? asc(courseBatches.batchName)
          : desc(courseBatches.batchName)
      );

    if (!batches.length) {
      return {
        success: true,
        message: "No active batches",
        data: [],
      };
    }

    const ids = batches.map((b) => b.batchId);
    const courseIds = batches.map((b) => b.courseId);

    // --------------------------------------------------
    // 5. Parallel Queries
    // --------------------------------------------------

    const [
      schedules,
      syllabusCounts,
      studentCounts,
      completedLessons,
    ] = await Promise.all([
      // schedules
      db
        .select()
        .from(batchSchedules)
        .where(inArray(batchSchedules.batchId, ids)),

      // module + lesson counts
      db
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
        .leftJoin(
          courseModules,
          eq(courseModules.courseId, courses.id)
        )
        .leftJoin(
          moduleLessons,
          eq(moduleLessons.moduleId, courseModules.id)
        )
        .where(inArray(courses.id, courseIds))
        .groupBy(courses.id),

      // active students
      db
        .select({
          batchId: enrollments.batchId,
          studentCount: sql<number>`
            COUNT(DISTINCT ${enrollments.studentId})
          `,
        })
        .from(enrollments)
        .where(
          and(
            inArray(enrollments.batchId, ids),
            eq(enrollments.status, "active"),
            isNull(enrollments.deletedAt)
          )
        )
        .groupBy(enrollments.batchId),

      // completed lessons
      db
        .select({
          batchId: moduleProgress.batchId,
          completed: sql<number>`
            COUNT(DISTINCT ${moduleProgress.lessonId})
          `,
        })
        .from(moduleProgress)
        .where(
          and(
            inArray(moduleProgress.batchId, ids),
            eq(moduleProgress.status, "completed")
          )
        )
        .groupBy(moduleProgress.batchId),
    ]);

    // --------------------------------------------------
    // 6. Maps
    // --------------------------------------------------

    const scheduleMap = new Map<string, typeof schedules>();

    schedules.forEach((s) => {
      const arr = scheduleMap.get(s.batchId);

      if (arr) arr.push(s);
      else scheduleMap.set(s.batchId, [s]);
    });

    const syllabusMap = new Map(
      syllabusCounts.map((s) => [
        s.courseId,
        {
          moduleCount: Number(s.moduleCount),
          lessonCount: Number(s.lessonCount),
        },
      ])
    );

    const studentMap = new Map(
      studentCounts.map((s) => [
        s.batchId,
        Number(s.studentCount),
      ])
    );

    const progressMap = new Map(
      completedLessons.map((p) => [
        p.batchId,
        Number(p.completed),
      ])
    );

    // --------------------------------------------------
    // 7. Response
    // --------------------------------------------------

    const data = batches.map((batch) => {
      const syllabus = syllabusMap.get(batch.courseId) ?? {
        moduleCount: 0,
        lessonCount: 0,
      };

      const completed =
        progressMap.get(batch.batchId) ?? 0;

      const progressPercentage =
        syllabus.lessonCount === 0
          ? 0
          : Math.round(
              (completed / syllabus.lessonCount) * 100
            );

      return {
        batchId: batch.batchId,
        batchName: batch.batchName,

        courseId: batch.courseId,
        courseName: batch.courseName,

        duration: batch.duration,

        startDate: batch.startDate,
        endDate: batch.endDate,

        moduleCount: syllabus.moduleCount,
        lessonCount: syllabus.lessonCount,

        studentCount:
          studentMap.get(batch.batchId) ?? 0,

        progressPercentage,

        schedule:
          scheduleMap.get(batch.batchId) ?? [],
      };
    });

    return {
      success: true,
      message: "Trainer active batches fetched successfully",
      data,
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      message: "Failed to fetch trainer batches",
      error:
        error instanceof Error
          ? error.message
          : "Unknown error",
    };
  }
}

export async function getTrainerBatchSummeryForLayout(batchId: string) {
  try {
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
        status: "not_found" as const,
        message: "Batch not found",
      };
    }


    // Fetch only batch assigned to this trainer
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
        courses,
        eq(courseBatches.courseId, courses.id),
      )
      .leftJoin(
        batchSchedules,
        eq(courseBatches.id, batchSchedules.batchId),
      )
      .where(
        and(
          eq(courseBatches.id, batchId),
          eq(courseBatches.trainerId, trainer.id),
          isNull(courseBatches.deletedAt),
          isNull(courses.deletedAt),
        ),
      );


    // Batch not found OR not owned by trainer
    if (!rows.length) {
      return {
        success: false,
        status: "not_found" as const,
        message: "Batch not found",
      };
    }


    const first = rows[0];


    const schedule = rows
      .filter((row) => row.scheduleId)
      .map((row) => row.weekday);


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

        // only days
        schedule: [...new Set(schedule)],
      },
    };


  } catch (error) {
    console.error(
      "getTrainerBatchSummeryForLayout error:",
      error,
    );

    return {
      success: false,
      status: "not_found" as const,
      message: "Batch not found",
    };
  }
}
