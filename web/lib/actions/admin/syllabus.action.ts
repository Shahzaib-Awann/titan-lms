"use server";

import { db } from "@/lib/db";
import { courseModules, courses, moduleLessons, moduleProgress } from "@/lib/db/schema";
import { asc, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { SyllabusSchema } from "@/lib/zod/admin.schema";
import { ModuleWithLessons } from "@/app/(pages)/(dashboard)/admin/syllabus/[courseId]/_types/syllabus";
import { nanoid } from "nanoid";

export async function getCourseSyllabus(courseId: string) {
  try {
    const [course] = await db
      .select({
        id: courses.id,
        title: courses.title,
        description: courses.description,
      })
      .from(courses)
      .where(eq(courses.id, courseId))
      .limit(1);


    if (!course) {
      throw new Error("Course not found.");
    }


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
        eq(
          moduleLessons.moduleId,
          courseModules.id,
        ),
      )
      .where(
        eq(courseModules.courseId, courseId),
      )
      .orderBy(
        asc(courseModules.orderIndex),
        asc(moduleLessons.orderIndex),
      );


    const syllabus: ModuleWithLessons[] = [];


    for (const row of modules) {
      let existingModule = syllabus.find(
        (item) => item.id === row.id,
      );


      if (!existingModule) {
        existingModule = {
          id: row.id,
          title: row.title,
          description: row.description,
          orderIndex: row.orderIndex,
          lessons: [],
        };

        syllabus.push(existingModule);
      }


      if (row.lessonId) {
        existingModule.lessons.push({
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

      modules: syllabus,
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

export async function updateCourseSyllabus(
  courseId: string,
  modules: ModuleWithLessons[],
) {
  try {
    // Validate input
    const validatedModules = SyllabusSchema.parse(modules);

    return await db.transaction(async (tx) => {
      const results = [];

      for (const courseModule of validatedModules) {
        let moduleId = courseModule.id;

        /**
         * Update existing module
         */
        if (courseModule.id) {
          const [existingModule] = await tx
            .select({
              id: courseModules.id,
            })
            .from(courseModules)
            .where(eq(courseModules.id, courseModule.id))
            .limit(1);

          if (!existingModule) {
            throw new Error(
              `Module with id ${courseModule.id} not found.`,
            );
          }

          await tx
            .update(courseModules)
            .set({
              title: courseModule.title,
              description: courseModule.description ?? null,
              orderIndex: courseModule.orderIndex,
            })
            .where(eq(courseModules.id, courseModule.id));
        }

        /**
         * Create new module
         */
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
         * Handle lessons
         */
        for (const lesson of courseModule.lessons) {
          /**
           * Update existing lesson
           */
          if (lesson.id) {
            const [existingLesson] = await tx
              .select({
                id: moduleLessons.id,
              })
              .from(moduleLessons)
              .where(eq(moduleLessons.id, lesson.id))
              .limit(1);

            if (!existingLesson) {
              throw new Error(
                `Lesson with id ${lesson.id} not found.`,
              );
            }


            await tx
              .update(moduleLessons)
              .set({
                moduleId: moduleId!,
                title: lesson.title,
                description: lesson.description ?? null,
                orderIndex: lesson.orderIndex,
              })
              .where(eq(moduleLessons.id, lesson.id));
          }


          /**
           * Create new lesson
           */
          else {
            await tx.insert(moduleLessons).values({
              id: nanoid(),
              moduleId: moduleId!,
              title: lesson.title,
              description: lesson.description ?? null,
              orderIndex: lesson.orderIndex,
            });
          }
        }


        results.push({
          moduleId,
          title: courseModule.title,
        });
      }


      revalidatePath(`/admin/syllabus`);


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

export async function deleteSyllabusItem(
  type: "module" | "lesson",
  id: string,
  courseId: string,
) {
  try {
    return await db.transaction(async (tx) => {

      /**
       * Delete lesson
       */
      if (type === "lesson") {

        // Delete related progress first
        await tx
          .delete(moduleProgress)
          .where(
            eq(
              moduleProgress.lessonId,
              id,
            ),
          );


        // Delete lesson
        await tx
          .delete(moduleLessons)
          .where(
            eq(
              moduleLessons.id,
              id,
            ),
          );

        revalidatePath("/admin/syllabus");
        revalidatePath(`/admin/syllabus/${courseId}`);


        return {
          success: true,
          type,
          id,
        };
      }


      /**
       * Delete module
       */
      if (type === "module") {

        // Find module lessons
        const lessons = await tx
          .select({
            id: moduleLessons.id,
          })
          .from(moduleLessons)
          .where(
            eq(
              moduleLessons.moduleId,
              id,
            ),
          );


        const lessonIds = lessons.map(
          (lesson) => lesson.id,
        );


        // Delete progress for all lessons
        if (lessonIds.length > 0) {

          await tx
            .delete(moduleProgress)
            .where(
              inArray(
                moduleProgress.lessonId,
                lessonIds,
              ),
            );


          // Delete lessons
          await tx
            .delete(moduleLessons)
            .where(
              inArray(
                moduleLessons.id,
                lessonIds,
              ),
            );
        }


        // Delete module
        await tx
          .delete(courseModules)
          .where(
            eq(
              courseModules.id,
              id,
            ),
          );


        revalidatePath("/admin/syllabus");
        revalidatePath(`/admin/syllabus/${courseId}`);

        return {
          success: true,
          type,
          id,
        };
      }


      throw new Error("Invalid delete type.");
    });

  } catch (error) {
    console.error(
      "deleteSyllabusItem Error:",
      error,
    );

    throw new Error(
      error instanceof Error
        ? error.message
        : "Failed to delete syllabus item.",
    );
  }
}