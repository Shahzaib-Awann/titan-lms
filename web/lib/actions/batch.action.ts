"use server";

import { db } from "@/lib/db";
import { eq, isNull, and, inArray } from "drizzle-orm";
import {
  users,
  trainerProfiles,
  courses,
  courseBatches,
  batchSchedules,
  assets,
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
