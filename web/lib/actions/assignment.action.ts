"use server";

import { and, asc, eq, exists, inArray, isNull, sql } from "drizzle-orm";
import {
  assignmentReferenceLinks,
  assignmentSubmissions,
  assignments,
  courseBatches,
  courseModules,
  enrollments,
  moduleLessons,
} from "@/lib/db/schema";
import { db } from "../db";
import { nanoid } from "nanoid";
import { AssignmentWithReferencesFormSchema } from "../zod/trainer.schema";
import z from "zod";
import { requireTrainer } from "./auth.action";
import { revalidatePath } from "next/cache";
import { Assignment } from "@/app/(pages)/(dashboard)/trainer/batches/[batchId]/assignments/columns";
import { AssignmentStatus } from "@/types/common";

/**
 * Fetches course modules and their lessons for a batch.
 *
 * @param {string} batchId - Batch ID to fetch modules for.
 * @returns {Promise<Array>} List of modules with their lessons.
 * @throws {Error} If fetching modules and lessons fails.
 */
export async function getModulesAndLessonsByBatchId(batchId: string) {
  const rows = await db
    .select({
      moduleId: courseModules.id,
      moduleTitle: courseModules.title,
      moduleDescription: courseModules.description,
      lessonId: moduleLessons.id,
      lessonTitle: moduleLessons.title,
      lessonDescription: moduleLessons.description,
    })
    .from(courseBatches)
    .innerJoin(
      courseModules,
      eq(courseModules.courseId, courseBatches.courseId),
    )
    .leftJoin(moduleLessons, eq(moduleLessons.moduleId, courseModules.id))
    .where(and(eq(courseBatches.id, batchId), isNull(courseBatches.deletedAt)))
    .orderBy(asc(courseModules.orderIndex), asc(moduleLessons.orderIndex));

  const modulesMap = new Map<
    string,
    {
      moduleId: string;
      moduleTitle: string;
      moduleDescription: string | null;
      lessons: {
        lessonId: string;
        lessonTitle: string;
        lessonDescription: string | null;
      }[];
    }
  >();

  for (const row of rows) {
    let courseModule = modulesMap.get(row.moduleId);

    if (!courseModule) {
      courseModule = {
        moduleId: row.moduleId,
        moduleTitle: row.moduleTitle,
        moduleDescription: row.moduleDescription,
        lessons: [],
      };

      modulesMap.set(row.moduleId, courseModule);
    }

    if (row.lessonId && row.lessonTitle) {
      courseModule.lessons.push({
        lessonId: row.lessonId,
        lessonTitle: row.lessonTitle,
        lessonDescription: row.lessonDescription,
      });
    }
  }

  return Array.from(modulesMap.values());
}

/**
 * Fetches trainer batch assignments with submission statistics.
 *
 * @param {string} batchId - Batch ID to fetch assignments for.
 * @returns {Promise<Assignment[]>} List of assignments with student statistics.
 * @throws {Error} If fetching assignments fails.
 */
export async function getTrainerBatchAssignmentsForDataTable(
  batchId: string,
): Promise<Assignment[]> {
  const { trainer } = await requireTrainer();

  const rows = await db
    .select({
      id: assignments.id,
      title: assignments.title,
      status: assignments.status,
      assignedAt: assignments.assignedAt,
      dueAt: assignments.dueAt,

      submissions: sql<number>`
        COUNT(
          DISTINCT CASE
            WHEN ${assignmentSubmissions.status} != 'not_submitted'
            THEN ${assignmentSubmissions.enrollmentId}
          END
        )
      `.as("submissions"),

      enrolledStudents: sql<number>`
        COUNT(
          DISTINCT ${enrollments.id}
        )
      `.as("enrolled_students"),

      graded: sql<number>`
        COUNT(
          DISTINCT CASE
            WHEN ${assignmentSubmissions.status} = 'graded'
            THEN ${assignmentSubmissions.enrollmentId}
          END
        )
      `.as("graded"),
    })
    .from(assignments)
    .innerJoin(
      courseBatches,
      and(
        eq(courseBatches.id, assignments.batchId),
        eq(courseBatches.trainerId, trainer.id),
        isNull(courseBatches.deletedAt),
      ),
    )
    .leftJoin(
      enrollments,
      and(
        eq(enrollments.batchId, courseBatches.id),
        isNull(enrollments.deletedAt),
      ),
    )
    .leftJoin(
      assignmentSubmissions,
      and(
        eq(assignmentSubmissions.assignmentId, assignments.id),
        eq(assignmentSubmissions.enrollmentId, enrollments.id),
      ),
    )
    .where(and(eq(assignments.batchId, batchId), isNull(assignments.deletedAt)))
    .groupBy(
      assignments.id,
      assignments.title,
      assignments.status,
      assignments.assignedAt,
      assignments.dueAt,
    )
    .orderBy(asc(assignments.assignedAt));

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    status: row.status as AssignmentStatus,
    assignedAt: row.assignedAt,
    dueAt: row.dueAt,
    submissions: Number(row.submissions ?? 0),
    enrolledStudents: Number(row.enrolledStudents ?? 0),
    graded: Number(row.graded ?? 0),
  }));
}

/**
 * Fetches an assignment and its reference links for editing.
 *
 * @param {string} assignmentId - Assignment ID to fetch.
 * @returns {Promise<Object>} Assignment details with reference links.
 * @throws {Error} If the assignment is not found or cannot be fetched.
 */
export async function getAssignmentForEdit(assignmentId: string) {
  if (!assignmentId) {
    throw new Error("Assignment ID is required");
  }

  const { trainer } = await requireTrainer();

  const [assignment] = await db
    .select({
      id: assignments.id,
      moduleId: assignments.moduleId,
      lessonId: assignments.lessonId,
      title: assignments.title,
      instructions: assignments.instructions,
      maxMarks: assignments.maxMarks,
      status: assignments.status,
      assignedAt: assignments.assignedAt,
      dueAt: assignments.dueAt,
    })
    .from(assignments)
    .innerJoin(
      courseBatches,
      and(
        eq(assignments.batchId, courseBatches.id),
        eq(courseBatches.trainerId, trainer.id),
        isNull(courseBatches.deletedAt),
      ),
    )
    .where(and(eq(assignments.id, assignmentId), isNull(assignments.deletedAt)))
    .limit(1);

  if (!assignment) {
    throw new Error("Assignment not found");
  }

  const referenceLinks = await db
    .select({
      id: assignmentReferenceLinks.id,
      title: assignmentReferenceLinks.title,
      url: assignmentReferenceLinks.url,
    })
    .from(assignmentReferenceLinks)
    .where(
      and(
        eq(assignmentReferenceLinks.assignmentId, assignment.id),
        eq(assignmentReferenceLinks.resourceType, "assignment"),
        isNull(assignmentReferenceLinks.submissionId),
      ),
    );

  return {
    id: assignment.id,
    moduleId: assignment.moduleId,
    lessonId: assignment.lessonId,
    title: assignment.title,
    instructions: assignment.instructions,
    maxMarks: Number(assignment.maxMarks),
    status: assignment.status,
    assignedAt: assignment.assignedAt,
    dueAt: assignment.dueAt,
    referenceLinks: referenceLinks.map((link) => ({
      id: link.id,
      title: link.title,
      url: link.url,
    })),
  };
}

/**
 * Creates or updates an assignment and manages related reference links.
 *
 * @param {Object} payload - Assignment data and target batch.
 * @param {Object} payload.data - Assignment form data.
 * @param {string} payload.batchId - Batch ID for the assignment.
 * @returns {Promise<Object>} Operation result with the assignment ID.
 * @throws {Error} If validation, authorization, or database operation fails.
 */
export async function createOrUpdateAssignment(payload: {
  data: z.infer<typeof AssignmentWithReferencesFormSchema>;
  batchId: string;
}): Promise<{
  success: true;
  operation: "created" | "updated";
  assignmentId: string;
}> {
  const { user, trainer } = await requireTrainer();

  // Validate the form before opening a transaction.
  const parsedData = AssignmentWithReferencesFormSchema.safeParse(payload.data);

  if (!parsedData.success) {
    throw new Error(parsedData.error.message);
  }

  if (!payload.batchId) {
    throw new Error("Batch is required");
  }

  const data = parsedData.data;
  const batchId = payload.batchId;

  try {
    const result = await db.transaction(async (tx) => {
      // Verify that the batch belongs to the logged-in trainer.
      const [batch] = await tx
        .select({
          id: courseBatches.id,
          courseId: courseBatches.courseId,
        })
        .from(courseBatches)
        .where(
          and(
            eq(courseBatches.id, batchId),
            eq(courseBatches.trainerId, trainer.id),
            isNull(courseBatches.deletedAt),
          ),
        )
        .limit(1);

      if (!batch) {
        throw new Error(
          "Batch not found or you are not authorized to manage it",
        );
      }

      // Validate the selected module when no lesson is provided.
      if (data.moduleId && !data.lessonId) {
        const [module] = await tx
          .select({
            id: courseModules.id,
          })
          .from(courseModules)
          .where(
            and(
              eq(courseModules.id, data.moduleId),
              eq(courseModules.courseId, batch.courseId),
            ),
          )
          .limit(1);

        if (!module) {
          throw new Error(
            "The selected module does not belong to this batch's course",
          );
        }
      }

      // Validate the lesson and its module/course relationship in one query.
      if (data.lessonId) {
        const [lesson] = await tx
          .select({
            id: moduleLessons.id,
            moduleId: moduleLessons.moduleId,
          })
          .from(moduleLessons)
          .innerJoin(
            courseModules,
            eq(moduleLessons.moduleId, courseModules.id),
          )
          .where(
            and(
              eq(moduleLessons.id, data.lessonId),
              eq(courseModules.courseId, batch.courseId),
            ),
          )
          .limit(1);

        if (!lesson) {
          throw new Error(
            "The selected lesson does not belong to this batch's course",
          );
        }

        // Ensure the lesson belongs to the selected module.
        if (data.moduleId && lesson.moduleId !== data.moduleId) {
          throw new Error(
            "The selected lesson does not belong to the selected module",
          );
        }
      }

      // CREATE MODE
      if (!data.id) {
        const assignmentId = nanoid();

        await tx.insert(assignments).values({
          id: assignmentId,
          batchId,
          moduleId: data.moduleId ?? null,
          lessonId: data.lessonId ?? null,
          createdBy: user.id,
          title: data.title,
          instructions: data.instructions ?? null,
          maxMarks: data.maxMarks,
          status: data.status,
          assignedAt: new Date(data.assignedAt),
          dueAt: new Date(data.dueAt),
        });

        // Insert all assignment references in one query.
        if (data.referenceLinks.length > 0) {
          await tx.insert(assignmentReferenceLinks).values(
            data.referenceLinks.map((reference) => ({
              id: nanoid(),
              assignmentId,
              submissionId: null,
              resourceType: "assignment" as const,
              title: reference.title,
              url: reference.url,
            })),
          );
        }

        return {
          success: true as const,
          operation: "created" as const,
          assignmentId,
        };
      }

      // UPDATE MODE
      const assignmentId = data.id;

      // Verify the assignment belongs to this trainer's batch.
      const [existingAssignment] = await tx
        .select({
          id: assignments.id,
        })
        .from(assignments)
        .innerJoin(
          courseBatches,
          and(
            eq(courseBatches.id, assignments.batchId),
            eq(courseBatches.trainerId, trainer.id),
            isNull(courseBatches.deletedAt),
          ),
        )
        .where(
          and(
            eq(assignments.id, assignmentId),
            eq(assignments.batchId, batchId),
            isNull(assignments.deletedAt),
          ),
        )
        .limit(1);

      if (!existingAssignment) {
        throw new Error(
          "Assignment not found or you are not authorized to update it",
        );
      }

      // Update the assignment.
      await tx
        .update(assignments)
        .set({
          moduleId: data.moduleId ?? null,
          lessonId: data.lessonId ?? null,
          title: data.title,
          instructions: data.instructions ?? null,
          maxMarks: data.maxMarks,
          status: data.status,
          assignedAt: new Date(data.assignedAt),
          dueAt: new Date(data.dueAt),
        })
        .where(eq(assignments.id, assignmentId));

      // Load current assignment references.
      const existingLinks = await tx
        .select({
          id: assignmentReferenceLinks.id,
          title: assignmentReferenceLinks.title,
          url: assignmentReferenceLinks.url,
        })
        .from(assignmentReferenceLinks)
        .where(
          and(
            eq(assignmentReferenceLinks.assignmentId, assignmentId),
            eq(assignmentReferenceLinks.resourceType, "assignment"),
          ),
        );

      const existingLinkIds = new Set(existingLinks.map((link) => link.id));

      const incomingLinkIds = new Set(
        data.referenceLinks
          .filter((reference) => reference.id)
          .map((reference) => reference.id!),
      );

      // Reject reference IDs that do not belong to this assignment.
      for (const reference of data.referenceLinks) {
        if (reference.id && !existingLinkIds.has(reference.id)) {
          throw new Error("Invalid assignment reference link");
        }
      }

      // Delete references removed from the form in one query.
      const linksToDelete = existingLinks
        .filter((link) => !incomingLinkIds.has(link.id))
        .map((link) => link.id);

      if (linksToDelete.length > 0) {
        await tx
          .delete(assignmentReferenceLinks)
          .where(
            and(
              eq(assignmentReferenceLinks.assignmentId, assignmentId),
              eq(assignmentReferenceLinks.resourceType, "assignment"),
              inArray(assignmentReferenceLinks.id, linksToDelete),
            ),
          );
      }

      // Insert all newly added references in one query.
      const newReferences = data.referenceLinks.filter(
        (reference) => !reference.id,
      );

      if (newReferences.length > 0) {
        await tx.insert(assignmentReferenceLinks).values(
          newReferences.map((reference) => ({
            id: nanoid(),
            assignmentId,
            submissionId: null,
            resourceType: "assignment" as const,
            title: reference.title,
            url: reference.url,
          })),
        );
      }

      // Update existing references only when their values changed.
      const existingReferencesToUpdate = data.referenceLinks.filter(
        (reference) => {
          if (!reference.id) return false;

          const existing = existingLinks.find(
            (link) => link.id === reference.id,
          );

          return (
            existing &&
            (existing.title !== reference.title ||
              existing.url !== reference.url)
          );
        },
      );

      for (const reference of existingReferencesToUpdate) {
        await tx
          .update(assignmentReferenceLinks)
          .set({
            title: reference.title,
            url: reference.url,
          })
          .where(
            and(
              eq(assignmentReferenceLinks.id, reference.id!),
              eq(assignmentReferenceLinks.assignmentId, assignmentId),
              eq(assignmentReferenceLinks.resourceType, "assignment"),
            ),
          );
      }

      return {
        success: true as const,
        operation: "updated" as const,
        assignmentId,
      };
    });

    // Revalidate only after the transaction successfully commits.
    revalidatePath(`/trainer/batches/${batchId}/assignments`);

    return result;
  } catch (error) {
    console.error("Failed to create or update assignment:", {
      batchId,
      assignmentId: payload.data.id ?? null,
      trainerId: trainer.id,
      error,
    });

    // Preserve the original application error message.
    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Failed to create or update assignment.");
  }
}

/**
 * Soft-deletes an assignment and closes its status.
 *
 * @param {string} assignmentId - Assignment ID to delete.
 * @param {string} batchId - Batch ID the assignment belongs to.
 * @returns {Promise<Object>} Deletion result with the assignment ID.
 * @throws {Error} If the assignment is not found or deletion fails.
 */
export async function deleteAssignment(
  assignmentId: string,
  batchId: string,
): Promise<{
  success: true;
  assignmentId: string;
  status: "closed";
}> {
  try {
    const { trainer } = await requireTrainer();

    if (!assignmentId?.trim() || !batchId?.trim()) {
      throw new Error("Assignment ID and Batch ID are required");
    }

    const result = await db
      .update(assignments)
      .set({
        status: "closed",
        deletedAt: new Date(),
      })
      .where(
        and(
          eq(assignments.id, assignmentId),
          eq(assignments.batchId, batchId),
          isNull(assignments.deletedAt),
          exists(
            db
              .select({ id: courseBatches.id })
              .from(courseBatches)
              .where(
                and(
                  eq(courseBatches.id, assignments.batchId),
                  eq(courseBatches.trainerId, trainer.id),
                  isNull(courseBatches.deletedAt),
                ),
              ),
          ),
        ),
      );

    if (result[0].affectedRows !== 1) {
      throw new Error(
        "Assignment not found or you are not authorized to delete it",
      );
    }

    return {
      success: true,
      assignmentId,
      status: "closed",
    };
  } catch (error) {
    console.error("Failed to delete assignment:", {
      assignmentId,
      batchId,
      error,
    });

    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Failed to delete assignment.");
  }
}
