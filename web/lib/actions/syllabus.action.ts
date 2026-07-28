"use server";

import { db } from "@/lib/db";
import { courseBatches, courseModules, courses, moduleLessons, moduleProgress } from "@/lib/db/schema";
import { and, asc, count, eq, gte, inArray, isNull, lte } from "drizzle-orm";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { SyllabusSchema } from "@/lib/zod/admin.schema";
import { nanoid } from "nanoid";
import { SyllabusModule } from "@/types/syllabus";
import { requireRole } from "./auth.action";

/**
 * Fetch syllabus statistics for stats cards
 */
export async function getSyllabusStats() {
  try {

    const today = new Date();

    const [
      [courseStats],
      [moduleStats],
      [lessonStats],
      [batchStats],
    ] = await Promise.all([

      // Count active courses
      db
        .select({
          courseCount: count(courses.id),
        })
        .from(courses)
        .where(isNull(courses.deletedAt)),

      // Count modules from active courses
      db
        .select({
          moduleCount: count(courseModules.id),
        })
        .from(courseModules)
        .innerJoin(
          courses,
          eq(courseModules.courseId, courses.id),
        )
        .where(isNull(courses.deletedAt)),

      // Count lessons from active courses
      db
        .select({
          lessonCount: count(moduleLessons.id),
        })
        .from(moduleLessons)
        .innerJoin(
          courseModules,
          eq(moduleLessons.moduleId, courseModules.id),
        )
        .innerJoin(
          courses,
          eq(courseModules.courseId, courses.id),
        )
        .where(isNull(courses.deletedAt)),

      // Count currently active batches
      db
        .select({
          activeBatches: count(courseBatches.id),
        })
        .from(courseBatches)
        .where(
          and(
            isNull(courseBatches.deletedAt),
            lte(courseBatches.startDate, today),
            gte(courseBatches.endDate, today),
          ),
        ),
    ]);

    return {
      courseCount: Number(courseStats.courseCount),
      moduleCount: Number(moduleStats.moduleCount),
      lessonCount: Number(lessonStats.lessonCount),
      activeBatches: Number(batchStats.activeBatches),
    };
  } catch (error) {
    console.error("getSyllabusStats Error:", error);

    throw new Error(
      error instanceof Error
        ? error.message
        : "Failed to fetch syllabus statistics.",
    );
  }
}

/**
 * Fetch course syllabus with modules and lessons
 */
export async function getCourseSyllabus(courseId: string) {
  try {
    await requireRole("admin");

    // Fetch course information
    const [course] = await db
      .select({
        id: courses.id,
        title: courses.title,
        description: courses.description,
      })
      .from(courses)
      .where(and(eq(courses.id, courseId), isNull(courses.deletedAt)))
      .limit(1);


    if (!course) {
      throw new Error("Course not found.");
    }

    // Fetch modules and lessons ordered by sequence
    const modules = await db
      .select({
        id: courseModules.id,
        title: courseModules.title,
        description: courseModules.description,
        orderIndex: courseModules.orderIndex,

        lessonId: moduleLessons.id,
        lessonTitle: moduleLessons.title,
        lessonDescription: moduleLessons.description,
        lessonOrderIndex: moduleLessons.orderIndex,
      })
      .from(courseModules)
      .leftJoin(
        moduleLessons,
        eq(moduleLessons.moduleId, courseModules.id),
      )
      .where(
        eq(courseModules.courseId, courseId),
      )
      .orderBy(
        asc(courseModules.orderIndex),
        asc(moduleLessons.orderIndex),
      );


    // Group lessons under their modules
    const moduleMap = new Map<string, SyllabusModule>();


    for (const row of modules) {
      let courseModule = moduleMap.get(row.id);

      if (!courseModule) {
        courseModule = {
          id: row.id,
          title: row.title,
          description: row.description,
          orderIndex: row.orderIndex,
          lessons: [],
        };

        moduleMap.set(row.id, courseModule);
      }

      // Add lesson to module
      if (row.lessonId) {
        courseModule.lessons.push({
          id: row.lessonId,
          title: row.lessonTitle!,
          description: row.lessonDescription ?? null,
          orderIndex: row.lessonOrderIndex!,
        });
      }
    }

    return {
      courseInfo: {
        id: course.id,
        title: course.title,
        description: course.description ?? "No description available.",
      },

      modules: Array.from(moduleMap.values()),
    };


  } catch (error) {
    console.error(
      "getCourseSyllabus Error:",
      error,
    );

    throw new Error(
      error instanceof Error
        ? error.message
        : "Failed to fetch course syllabus.",
    );
  }
}

/**
 * Update course syllabus with modules and lessons
 */
export async function updateCourseSyllabus(
  courseId: string,
  modules: SyllabusModule[],
) {
  try {

    await requireRole("admin");

    // Validate syllabus payload
    const validatedModules = SyllabusSchema.parse(modules);

    return await db.transaction(async (tx) => {
      const results = [];

      /**
       * Handle module creation and updates
       */
      for (const courseModule of validatedModules) {
        let moduleId = courseModule.id;

        // Update existing module
        if (courseModule.id) {
          await tx
            .update(courseModules)
            .set({
              title: courseModule.title,
              description: courseModule.description ?? null,
              orderIndex: courseModule.orderIndex,
            })
            .where(eq(courseModules.id, courseModule.id));
        }

        // Create new module
        else {
          const newModuleId = nanoid();

          await tx.insert(courseModules).values({
            id: newModuleId,
            courseId,
            title: courseModule.title,
            description: courseModule.description ?? null,
            orderIndex: courseModule.orderIndex,
          });

          moduleId = newModuleId;
        }

        /**
         * Handle lesson creation and updates
         */
        for (const lesson of courseModule.lessons) {
          // Update existing lesson
          if (lesson.id) {
            await tx
              .update(moduleLessons)
              .set({
                moduleId: moduleId!,
                title: lesson.title,
                description: lesson.description ?? null,
                orderIndex: lesson.orderIndex,
              })
              .where(eq(moduleLessons.id, lesson.id));

            continue;
          }

          // Create new lesson
          await tx
            .insert(moduleLessons)
            .values({
              id: nanoid(),
              moduleId: moduleId!,
              title: lesson.title,
              description: lesson.description ?? null,
              orderIndex: lesson.orderIndex,
            });
        }


        results.push({
          moduleId,
          title: courseModule.title,
        });
      }

      revalidatePath(`/admin/syllabus`);
      revalidatePath(`/admin/syllabus/${courseId}`);

      return {
        success: true,
        modules: results,
      };
    });

  } catch (error) {
  console.error(
    "updateCourseSyllabus Error:",
    error,
  );

  if (error instanceof z.ZodError) {
    throw new Error(
      error.issues.map((issue) => issue.message).join(", "),
    );
  }

  throw new Error(
    error instanceof Error
      ? error.message
      : "Failed to update course syllabus.",
  );
}
}

/**
 * Delete syllabus module or lesson
 */
export async function deleteSyllabusItem(
  type: "module" | "lesson",
  id: string,
  courseId: string,
) {
  try {

    await requireRole("admin");

    return await db.transaction(async (tx) => {
      /**
       * Delete lesson and related progress
       */
      if (type === "lesson") {
        // Delete lesson progress records
        await tx
          .delete(moduleProgress)
          .where(
            eq(moduleProgress.lessonId, id),
          );

        // Delete lesson record
        await tx
          .delete(moduleLessons)
          .where(
            eq(moduleLessons.id, id),
          );
      }

      /**
       * Delete module and all related lessons
       */
      else if (type === "module") {
        // Fetch module lessons
        const lessons = await tx
          .select({
            id: moduleLessons.id,
          })
          .from(moduleLessons)
          .where(
            eq(moduleLessons.moduleId, id),
          );

        const lessonIds = lessons.map(
          ({ id }) => id,
        );

        // Delete progress for module lessons
        if (lessonIds.length) {
          await tx
            .delete(moduleProgress)
            .where(
              inArray(
                moduleProgress.lessonId,
                lessonIds,
              ),
            );

          // Delete module lessons
          await tx
            .delete(moduleLessons)
            .where(
              inArray(
                moduleLessons.id,
                lessonIds,
              ),
            );
        }

        // Delete module record
        await tx
          .delete(courseModules)
          .where(
            eq(courseModules.id, id),
          );
      }

      // Handle invalid delete type
      else {
        throw new Error("Invalid delete type.");
      }

      // Refresh syllabus pages
      revalidatePath("/admin/syllabus");
      revalidatePath(`/admin/syllabus/${courseId}`);

      return { success: true, type, id };
    });
  } catch (error) {
    console.error("deleteSyllabusItem Error:", error);

    throw new Error(
      error instanceof Error
        ? error.message
        : "Failed to delete syllabus item.",
    );
  }
}