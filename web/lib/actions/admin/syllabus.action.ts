"use server";

import { db } from "@/lib/db"; // Import your Drizzle DB instance
import { courseModules, moduleLessons } from "@/lib/db/schema";
import { eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { nanoid } from "nanoid";
import { saveSyllabusSchema, moduleSchema } from "@/lib/zod/admin.schema";
import z from "zod";

export type CourseModuleInput = z.infer<typeof moduleSchema>;
export type SaveSyllabusPayload = z.infer<typeof saveSyllabusSchema>;

export async function saveSyllabus(courseId: string, modules: CourseModuleInput[]) {
  // 1. Validate payload against Zod schema
  const validationResult = saveSyllabusSchema.safeParse({ courseId, modules });

  if (!validationResult.success) {
    return {
      success: false,
      message: "Invalid payload format.",
      errors: validationResult.error.flatten().fieldErrors,
    };
  }

  const { modules: validatedModules } = validationResult.data;

  try {
    await db.transaction(async (tx) => {
      // Fetch existing DB state for comparison
      const existingModules = await tx
        .select({ id: courseModules.id })
        .from(courseModules)
        .where(eq(courseModules.courseId, courseId));

      const existingModuleIds = existingModules.map((m) => m.id);
      const clientModuleIds = validatedModules
        .map((m) => m.id)
        .filter((id) => !id.startsWith("mod_"));

      // Delete removed modules
      const modulesToDelete = existingModuleIds.filter((id) => !clientModuleIds.includes(id));
      if (modulesToDelete.length > 0) {
        await tx.delete(moduleLessons).where(inArray(moduleLessons.moduleId, modulesToDelete));
        await tx.delete(courseModules).where(inArray(courseModules.id, modulesToDelete));
      }

      // Upsert Modules and Lessons
      for (let mIdx = 0; mIdx < validatedModules.length; mIdx++) {
        const mod = validatedModules[mIdx];
        let actualModuleId = mod.id;

        if (mod.id.startsWith("mod_")) {
          actualModuleId = nanoid();
          await tx.insert(courseModules).values({
            id: actualModuleId,
            courseId,
            title: mod.title,
            description: mod.description,
            orderIndex: mIdx,
          });
        } else {
          await tx
            .update(courseModules)
            .set({
              title: mod.title,
              description: mod.description,
              orderIndex: mIdx,
              updatedAt: new Date(),
            })
            .where(eq(courseModules.id, mod.id));
        }

        // Process Lessons
        const existingLessons = await tx
          .select({ id: moduleLessons.id })
          .from(moduleLessons)
          .where(eq(moduleLessons.moduleId, actualModuleId));

        const existingLessonIds = existingLessons.map((l) => l.id);
        const clientLessonIds = mod.lessons
          .map((l) => l.id)
          .filter((id) => !id.startsWith("les_"));

        const lessonsToDelete = existingLessonIds.filter((id) => !clientLessonIds.includes(id));
        if (lessonsToDelete.length > 0) {
          await tx.delete(moduleLessons).where(inArray(moduleLessons.id, lessonsToDelete));
        }

        for (let lIdx = 0; lIdx < mod.lessons.length; lIdx++) {
          const les = mod.lessons[lIdx];

          if (les.id.startsWith("les_")) {
            await tx.insert(moduleLessons).values({
              id: nanoid(),
              moduleId: actualModuleId,
              title: les.title,
              description: les.description,
              orderIndex: lIdx,
            });
          } else {
            await tx
              .update(moduleLessons)
              .set({
                moduleId: actualModuleId,
                title: les.title,
                description: les.description,
                orderIndex: lIdx,
                updatedAt: new Date(),
              })
              .where(eq(moduleLessons.id, les.id));
          }
        }
      }
    });

    revalidatePath(`/admin/syllabus/${courseId}`);
    return { success: true, message: "Syllabus saved successfully!" };
  } catch (error) {
    console.error("Failed to save syllabus:", error);
    return { success: false, message: "Failed to save syllabus. Please try again." };
  }
}