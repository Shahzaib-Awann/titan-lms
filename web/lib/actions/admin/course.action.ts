"use server";

import { nanoid } from "nanoid";
import { and, count, eq, isNull, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/lib/db";
import { assets, courseBatches, courses, users } from "@/lib/db/schema";
import { requireRole } from "@/lib/actions/admin/auth.action";
import { CourseFormSchema } from "@/lib/zod/admin.schema";

/**
 * Fetch all active courses with datatable relations
 */
export async function getCourses() {
  try {
    return await db.transaction(async (tx) => {
      return await tx
        .select({
          id: courses.id,

          title: courses.title,
          durationWeeks: courses.durationWeeks,
          feeAmount: courses.feeAmount,
          createdAt: courses.createdAt,

          batches: count(courseBatches.id),

          createdBy: {
            id: users.id,
            name: users.fullName,
            avatarUrl: assets.url,
          },
        })
        .from(courses)

        // Course creator
        .leftJoin(users, eq(courses.createdBy, users.id))

        // Course batches count
        .leftJoin(courseBatches, eq(courseBatches.courseId, courses.id))

        // Creator avatar
        .leftJoin(assets, eq(users.avatarAssetId, assets.id))

        .where(isNull(courses.deletedAt))

        .groupBy(
          courses.id,
          users.id,
          users.fullName,
          assets.url,
          courses.title,
          courses.durationWeeks,
          courses.feeAmount,
          courses.createdAt,
        );
    });
  } catch (error) {
    console.error("getCoursesAction Error:", error);

    throw new Error(
      error instanceof Error ? error.message : "Failed to fetch courses.",
    );
  }
}

/**
 * Fetch single course by ID for edit
 */
export async function getCourseForEdit(id: string) {
  try {
    await requireRole("admin");

    return await db.transaction(async (tx) => {
      const [course] = await tx
        .select({
          id: courses.id,

          title: courses.title,
          slug: courses.slug,
          description: courses.description,

          durationWeeks: courses.durationWeeks,
          feeAmount: courses.feeAmount,

          createdAt: courses.createdAt,
          updatedAt: courses.updatedAt,
        })
        .from(courses)
        .where(and(eq(courses.id, id), isNull(courses.deletedAt)))
        .limit(1);

      if (!course) return null;

      return {
        ...course,
        feeAmount: Number(course.feeAmount),
      };
    });
  } catch (error) {
    console.error("getCourseForEdit Error:", error);

    throw new Error(
      error instanceof Error ? error.message : "Failed to fetch course.",
    );
  }
}

/**
 * Create or update course
 */
export async function saveCourse(data: z.infer<typeof CourseFormSchema>) {
  try {
    const user = await requireRole("admin");

    const parsed = CourseFormSchema.parse(data);

    await db.transaction(async (tx) => {
      /**
       * Update Course
       */
      if (parsed.id) {
        const [existingCourse] = await tx
          .select({ id: courses.id })
          .from(courses)
          .where(and(eq(courses.slug, parsed.slug), ne(courses.id, parsed.id)))
          .limit(1);

        if (existingCourse) {
          throw new Error("A course with this slug already exists.");
        }

        await tx
          .update(courses)
          .set({
            title: parsed.title,
            slug: parsed.slug,
            description: parsed.description,
            durationWeeks: parsed.durationWeeks,
            feeAmount: parsed.feeAmount.toString(),
          })
          .where(eq(courses.id, parsed.id));

        revalidatePath("/admin/courses");
        return;
      }

      /**
       * Create Course
       */
      const [existingCourse] = await tx
        .select({ id: courses.id })
        .from(courses)
        .where(eq(courses.slug, parsed.slug))
        .limit(1);

      if (existingCourse) {
        throw new Error("A course with this slug already exists.");
      }

      await tx.insert(courses).values({
        id: nanoid(),
        title: parsed.title,
        slug: parsed.slug,
        description: parsed.description,
        durationWeeks: parsed.durationWeeks,
        feeAmount: parsed.feeAmount.toString(),
        createdBy: user.id,
      });

      revalidatePath("/admin/courses");
    });

    return { success: true };
  } catch (error) {
    console.error("saveCourse Error:", error);

    throw new Error(
      error instanceof Error ? error.message : "Failed to save course.",
    );
  }
}

/**
 * Soft delete course
 */
export async function deleteCourse(id: string) {
  try {
    await requireRole("admin");

    return await db.transaction(async (tx) => {
      const [course] = await tx
        .select({
          id: courses.id,
          title: courses.title,
        })
        .from(courses)
        .where(and(eq(courses.id, id), isNull(courses.deletedAt)))
        .limit(1);

      if (!course) {
        throw new Error("Course not found.");
      }

      await tx
        .update(courses)
        .set({
          deletedAt: new Date(),
        })
        .where(eq(courses.id, id));

      revalidatePath("/admin/courses");

      return {
        success: true,
        id,
      };
    });
  } catch (error) {
    console.error("deleteCourseAction Error:", error);

    throw new Error(
      error instanceof Error ? error.message : "Failed to delete course.",
    );
  }
}
