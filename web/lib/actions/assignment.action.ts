"use server";

import { and, asc, count, eq, exists, inArray, isNull, sql } from "drizzle-orm";
import {
  assets,
  assignmentReferenceLinks,
  assignmentSubmissions,
  assignments,
  courseBatches,
  courseModules,
  enrollments,
  moduleLessons,
  studentProfiles,
  users,
} from "@/lib/db/schema";
import { db } from "../db";
import { nanoid } from "nanoid";
import { AssignmentSubmissionFormSchema, AssignmentSubmissionGradingFormSchema, AssignmentWithReferencesFormSchema } from "../zod/trainer.schema";
import z from "zod";
import { requireRole, requireTrainer } from "./auth.action";
import { revalidatePath } from "next/cache";
import { Assignment } from "@/app/(pages)/(dashboard)/trainer/batches/[batchId]/assignments/columns";
import { AssignmentStatus, AssignmentSubmissionStatus } from "@/types/common";
import { notFound } from "next/navigation";

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
  const { trainer } = await requireTrainer();

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
          createdBy: trainer.id,
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

export async function getStudentPortalAssignments(
  batchId: string,
) {
  // ------------------------------------------------------------
  // 1. Authenticate + validate role
  // ------------------------------------------------------------

  const user = await requireRole("student");

  // ------------------------------------------------------------
  // 2. Find the student's profile
  // ------------------------------------------------------------

  const [student] = await db
    .select({
      id: studentProfiles.id,
    })
    .from(studentProfiles)
    .where(
      and(
        eq(studentProfiles.userId, user.id),
        isNull(studentProfiles.deletedAt),
      ),
    )
    .limit(1);

  if (!student) {
    throw new Error("Student profile not found");
  }

  // ------------------------------------------------------------
  // 3. Verify student is enrolled in this batch
  // ------------------------------------------------------------

  const [enrollment] = await db
    .select({
      id: enrollments.id,
      batchId: enrollments.batchId,
      status: enrollments.status,
    })
    .from(enrollments)
    .where(
      and(
        eq(enrollments.batchId, batchId),
        eq(enrollments.studentId, student.id),
        isNull(enrollments.deletedAt),
      ),
    )
    .limit(1);

  if (!enrollment) {
    throw new Error("You are not enrolled in this batch");
  }

  // ------------------------------------------------------------
  // 4. Get assignments
  // ------------------------------------------------------------

  const assignmentRows = await db
    .select({
      assignmentId: assignments.id,
      title: assignments.title,
      instructions: assignments.instructions,

      moduleName: courseModules.title,
      lessonName: moduleLessons.title,

      maxMarks: assignments.maxMarks,

      batchId: assignments.batchId,

      createdAt: assignments.createdAt,
      dueAt: assignments.dueAt,
    })
    .from(assignments)
    .leftJoin(
      courseModules,
      eq(assignments.moduleId, courseModules.id),
    )
    .leftJoin(
      moduleLessons,
      eq(assignments.lessonId, moduleLessons.id),
    )
    .where(
      and(
        eq(assignments.batchId, batchId),
        eq(assignments.status, "published"),
        isNull(assignments.deletedAt),
      ),
    )
    .orderBy(assignments.dueAt);

  // No assignments
  if (assignmentRows.length === 0) {
    return [];
  }

  const assignmentIds = assignmentRows.map(
    (assignment) => assignment.assignmentId,
  );

  // ------------------------------------------------------------
  // 5. Get assignment reference links
  // ------------------------------------------------------------

  const assignmentReferenceLinksResult =
    await db
      .select({
        id: assignmentReferenceLinks.id,
        assignmentId: assignmentReferenceLinks.assignmentId,
        title: assignmentReferenceLinks.title,
        url: assignmentReferenceLinks.url,
      })
      .from(assignmentReferenceLinks)
      .where(
        and(
          inArray(
            assignmentReferenceLinks.assignmentId,
            assignmentIds,
          ),
          eq(
            assignmentReferenceLinks.resourceType,
            "assignment",
          ),
        ),
      );

  // ------------------------------------------------------------
  // 6. Get student's submissions
  // ------------------------------------------------------------

  const submissions = await db
    .select({
      id: assignmentSubmissions.id,
      assignmentId: assignmentSubmissions.assignmentId,

      status: assignmentSubmissions.status,
      submittedAt: assignmentSubmissions.submittedAt,
      submissionNote: assignmentSubmissions.submissionNote,
      marksObtained: assignmentSubmissions.marksObtained,
      teacherFeedback: assignmentSubmissions.teacherFeedback,
      gradedAt: assignmentSubmissions.gradedAt,
    })
    .from(assignmentSubmissions)
    .where(
      and(
        eq(
          assignmentSubmissions.enrollmentId,
          enrollment.id,
        ),
        inArray(
          assignmentSubmissions.assignmentId,
          assignmentIds,
        ),
      ),
    );

  const submissionIds = submissions.map(
    (submission) => submission.id,
  );

  // ------------------------------------------------------------
  // 7. Get submission reference links
  // ------------------------------------------------------------

  const submissionReferenceLinks =
    submissionIds.length > 0
      ? await db
          .select({
            id: assignmentReferenceLinks.id,
            submissionId:
              assignmentReferenceLinks.submissionId,
            title: assignmentReferenceLinks.title,
            url: assignmentReferenceLinks.url,
          })
          .from(assignmentReferenceLinks)
          .where(
            and(
              inArray(
                assignmentReferenceLinks.submissionId,
                submissionIds,
              ),
              eq(
                assignmentReferenceLinks.resourceType,
                "assignment_submission",
              ),
            ),
          )
      : [];

  // ------------------------------------------------------------
  // 8. Create lookup maps
  // ------------------------------------------------------------

  const assignmentLinksByAssignmentId = new Map<
    string,
    {
    id: string;
    title: string;
    url: string;
  }[]
  >();

  for (const link of assignmentReferenceLinksResult) {
    const existing =
      assignmentLinksByAssignmentId.get(link.assignmentId) ?? [];

    existing.push({
      id: link.id,
      title: link.title,
      url: link.url,
    });

    assignmentLinksByAssignmentId.set(
      link.assignmentId,
      existing,
    );
  }

  const submissionByAssignmentId = new Map<
    string,
    {
    id: string;
    assignmentId: string;
    status: AssignmentSubmissionStatus;
    submissionNote: string | null;
    submittedAt: Date | null;
    marksObtained: number | null;
    teacherFeedback: string | null;
    gradedAt: Date | null;
  }
  >();

  for (const submission of submissions) {
    submissionByAssignmentId.set(
      submission.assignmentId,
      submission,
    );
  }

  const submissionLinksBySubmissionId = new Map<
    string,
    {
    id: string;
    title: string;
    url: string;
  }[]
  >();

  for (const link of submissionReferenceLinks) {
    if (!link.submissionId) continue;

    const existing =
      submissionLinksBySubmissionId.get(link.submissionId) ?? [];

    existing.push({
      id: link.id,
      title: link.title,
      url: link.url,
    });

    submissionLinksBySubmissionId.set(
      link.submissionId,
      existing,
    );
  }

  // ------------------------------------------------------------
  // 9. Build final response
  // ------------------------------------------------------------

  return assignmentRows.map((assignment) => {
    const submission = submissionByAssignmentId.get(
      assignment.assignmentId,
    );

    return {
      assignmentId: assignment.assignmentId,
      title: assignment.title,
      instructions: assignment.instructions,

      moduleName: assignment.moduleName ?? null,
      lessonName: assignment.lessonName ?? null,

      maxMarks: assignment.maxMarks,

      batchId: assignment.batchId,

      // Your requested shape says assignedAt = assignment.createdAt
      assignedAt: assignment.createdAt,

      dueAt: assignment.dueAt,

      assignment_reference_links:
        assignmentLinksByAssignmentId.get(
          assignment.assignmentId,
        ) ?? [],

      submission: submission
        ? {
            id: submission.id,
            status: submission.status as AssignmentSubmissionStatus,

            submissionNote: submission.submissionNote,

            submittedAt:
              submission.submittedAt ?? null,

            marksObtained:
              submission.marksObtained ?? null,

            teacherFeedback:
              submission.teacherFeedback ?? null,

            gradedAt:
              submission.gradedAt ?? null,

            submission_reference_links:
              submissionLinksBySubmissionId.get(
                submission.id,
              ) ?? [],
          }
        : null,
    };
  });
}

export async function submitAssignment(
  assignmentId: string,
  input: unknown,
) {
  // ------------------------------------------------------------
  // 1. Validate input
  // ------------------------------------------------------------
  const validated = AssignmentSubmissionFormSchema.parse(input);

  // ------------------------------------------------------------
  // 2. Authorize student
  // ------------------------------------------------------------
  const user = await requireRole("student");

  // ------------------------------------------------------------
  // 3. Find the student's profile
  // ------------------------------------------------------------
  const [student] = await db
    .select({
      id: studentProfiles.id,
    })
    .from(studentProfiles)
    .where(
      and(
        eq(studentProfiles.userId, user.id),
        isNull(studentProfiles.deletedAt),
      ),
    )
    .limit(1);

  if (!student) {
    throw new Error("Student profile not found");
  }

  // ------------------------------------------------------------
  // 4. Find assignment
  // ------------------------------------------------------------
  const [assignment] = await db
    .select({
      id: assignments.id,
      batchId: assignments.batchId,
      dueAt: assignments.dueAt,
      status: assignments.status,
    })
    .from(assignments)
    .where(
      and(
        eq(assignments.id, assignmentId),
        isNull(assignments.deletedAt),
      ),
    )
    .limit(1);

  if (!assignment) {
    throw new Error("Assignment not found");
  }

  // ------------------------------------------------------------
  // 5. Make sure assignment is available for submission
  // ------------------------------------------------------------
  if (assignment.status !== "published") {
    throw new Error("This assignment is not available for submission");
  }

  // ------------------------------------------------------------
  // 6. Verify student belongs to assignment's batch
  // ------------------------------------------------------------
  const [enrollment] = await db
    .select({
      id: enrollments.id,
      status: enrollments.status,
    })
    .from(enrollments)
    .where(
      and(
        eq(enrollments.batchId, assignment.batchId),
        eq(enrollments.studentId, student.id),
        isNull(enrollments.deletedAt),
      ),
    )
    .limit(1);

  if (!enrollment) {
    throw new Error("You are not enrolled in this assignment's batch");
  }

  // A dropped/suspended student should not be able to submit.
  if (
    enrollment.status !== "active" &&
    enrollment.status !== "completed"
  ) {
    throw new Error("Your enrollment is not active");
  }

  // ------------------------------------------------------------
  // 7. Make sure this assignment has not already been submitted
  // ------------------------------------------------------------
  const [existingSubmission] = await db
    .select({
      id: assignmentSubmissions.id,
      status: assignmentSubmissions.status,
    })
    .from(assignmentSubmissions)
    .where(
      and(
        eq(assignmentSubmissions.assignmentId, assignmentId),
        eq(assignmentSubmissions.enrollmentId, enrollment.id),
      ),
    )
    .limit(1);

  if (existingSubmission) {
    throw new Error("You have already submitted this assignment");
  }

  // ------------------------------------------------------------
  // 8. Determine submission status
  // ------------------------------------------------------------
  const submittedAt = new Date();

const today = new Date(
  submittedAt.getFullYear(),
  submittedAt.getMonth(),
  submittedAt.getDate(),
);

const dueDate = new Date(
  assignment.dueAt.getFullYear(),
  assignment.dueAt.getMonth(),
  assignment.dueAt.getDate(),
);

const submissionStatus =
  today <= dueDate
    ? "submitted"
    : "late";

  // ------------------------------------------------------------
  // 9. Create submission + reference links atomically
  // ------------------------------------------------------------
  const result = await db.transaction(async (tx) => {
    const submissionId = nanoid();

    await tx.insert(assignmentSubmissions).values({
      id: submissionId,

      assignmentId: assignment.id,
      enrollmentId: enrollment.id,

      status: submissionStatus,
      submittedAt,
      submissionNote: validated.submissionNote,

      // These remain null because the assignment has
      // not been graded yet.
      marksObtained: null,
      teacherFeedback: null,
      gradedBy: null,
      gradedAt: null,
    });

    // ----------------------------------------------------------
    // 10. Create reference links
    // ----------------------------------------------------------
    if (validated.referenceLinks.length > 0) {
      await tx.insert(assignmentReferenceLinks).values(
        validated.referenceLinks.map((link) => ({
          id: nanoid(),

          assignmentId: assignment.id,
          submissionId,

          resourceType: "assignment_submission" as const,

          title: link.title,
          url: link.url,

          createdAt: new Date(),
        })),
      );
    }

    return {
      submissionId,
      status: submissionStatus,
    };
  });

  return {
    success: true,
    message:
      result.status === "late"
        ? "Assignment submitted late"
        : "Assignment submitted successfully",
    submissionId: result.submissionId,
    status: result.status,
  };
}

export async function getAssignmentSubmissionsSummary(
  batchId: string,
  assignmentId: string,
) {
  // ------------------------------------------------------------
  // 1. Authorize trainer
  // ------------------------------------------------------------
  const { trainer } = await requireTrainer();

  // ------------------------------------------------------------
  // 2. Get assignment
  //
  // Verify all of these:
  // - assignment exists
  // - assignment belongs to the supplied batch
  // - batch belongs to the authenticated trainer
  // ------------------------------------------------------------
  const [assignment] = await db
    .select({
      id: assignments.id,
      title: assignments.title,
      instructions: assignments.instructions,
      dueAt: assignments.dueAt,
      maxMarks: assignments.maxMarks,

      batchId: courseBatches.id,

      moduleName: courseModules.title,
      lessonName: moduleLessons.title,
    })
    .from(assignments)
    .innerJoin(
      courseBatches,
      eq(assignments.batchId, courseBatches.id),
    )
    .leftJoin(
      courseModules,
      eq(assignments.moduleId, courseModules.id),
    )
    .leftJoin(
      moduleLessons,
      eq(assignments.lessonId, moduleLessons.id),
    )
    .where(
      and(
        eq(assignments.id, assignmentId),
        eq(assignments.batchId, batchId),
        eq(courseBatches.id, batchId),
        eq(courseBatches.trainerId, trainer.id),

        isNull(assignments.deletedAt),
        isNull(courseBatches.deletedAt),
      ),
    )
    .limit(1);

  if (!assignment) {
    notFound();
  }

  // ------------------------------------------------------------
  // 3. Count active students in this batch
  // ------------------------------------------------------------
  const [studentStats] = await db
    .select({
      totalStudentCount: count(enrollments.id),
    })
    .from(enrollments)
    .where(
      and(
        eq(enrollments.batchId, batchId),
        eq(enrollments.status, "active"),
        isNull(enrollments.deletedAt),
      ),
    );

  // ------------------------------------------------------------
  // 4. Count assignment submissions
  // ------------------------------------------------------------
  const [submissionStats] = await db
    .select({
      submittedCount: count(assignmentSubmissions.id),

      gradedCount: sql<number>`
        COUNT(
          CASE
            WHEN ${assignmentSubmissions.status} = 'graded'
            AND ${assignmentSubmissions.marksObtained} IS NOT NULL
            THEN 1
          END
        )
      `,
    })
    .from(assignmentSubmissions)
    .innerJoin(
      enrollments,
      eq(
        assignmentSubmissions.enrollmentId,
        enrollments.id,
      ),
    )
    .where(
      and(
        eq(assignmentSubmissions.assignmentId, assignmentId),
        eq(assignmentSubmissions.enrollmentId, enrollments.id),

        // Make sure the submission belongs to this batch.
        eq(enrollments.batchId, batchId),

        // Only count current active enrollments.
        eq(enrollments.status, "active"),
        isNull(enrollments.deletedAt),
      ),
    );

  // ------------------------------------------------------------
  // 5. Normalize stats
  // ------------------------------------------------------------
  const totalStudentCount = Number(
    studentStats?.totalStudentCount ?? 0,
  );

  const submittedCount = Number(
    submissionStats?.submittedCount ?? 0,
  );

  const gradedCount = Number(
    submissionStats?.gradedCount ?? 0,
  );

  const pendingCount = Math.max(
    totalStudentCount - submittedCount,
    0,
  );

  // ------------------------------------------------------------
  // 6. Return response
  // ------------------------------------------------------------
  return {
    success: true,

    assignment: {
      title: assignment.title,
      instructions: assignment.instructions,
      dueAt: assignment.dueAt,
      maxMarks: assignment.maxMarks,
      moduleName: assignment.moduleName,
      lessonName: assignment.lessonName,
    },

    stats: {
      totalStudentCount,
      submittedCount,
      pendingCount,
      gradedCount,
    },
  };
}

export async function getAssignmentSubmissionsDatatable(
  batchId: string,
  assignmentId: string,
) {
  const rows = await db
    .select({
      studentId: studentProfiles.id,
      fullName: users.fullName,
      avatarUrl: assets.url,
      rollNumber: studentProfiles.rollNumber,

      submissionId: assignmentSubmissions.id,
      submissionStatus: assignmentSubmissions.status,
      submittedAt: assignmentSubmissions.submittedAt,
      marksObtained: assignmentSubmissions.marksObtained,

      maxMarks: assignments.maxMarks,
    })
    .from(enrollments)
    .innerJoin(
      studentProfiles,
      eq(enrollments.studentId, studentProfiles.id),
    )
    .innerJoin(
      users,
      eq(studentProfiles.userId, users.id),
    )
    .innerJoin(
      assignments,
      eq(assignments.id, assignmentId),
    )
    .leftJoin(
      assets,
      eq(users.avatarAssetId, assets.id),
    )
    .leftJoin(
      assignmentSubmissions,
      and(
        eq(
          assignmentSubmissions.enrollmentId,
          enrollments.id,
        ),
        eq(
          assignmentSubmissions.assignmentId,
          assignmentId,
        ),
      ),
    )
    .where(
      and(
        eq(enrollments.batchId, batchId),
        eq(enrollments.status, "active"),
        isNull(enrollments.deletedAt),
        isNull(studentProfiles.deletedAt),
        isNull(users.deletedAt),
      ),
    )
    .orderBy(studentProfiles.rollNumber);

  return {
    success: true,

    submissions: rows.map((row) => ({
      student: {
        id: row.studentId,
        fullName: row.fullName,
        AvatarUrl: row.avatarUrl ?? null,
        rollNumber: row.rollNumber,
      },

      submissionId: row.submissionId ??"",
      submissionStatus: row.submissionStatus ?? "not_submitted",
      submittedAt: row.submittedAt ?? null,
      marksObtained: Number(row.marksObtained) ?? null,
      maxMarks: Number(row.maxMarks),
    })),
  };
}

export async function gradeAssignmentSubmission(
  payload: {
    submissionId: string;
    obtainedMarks: string;
    teacherFeedback: string;
  },
) {
  const { trainer } = await requireTrainer();

  // ------------------------------------------------------------
  // 1. Get submission + assignment max marks
  // ------------------------------------------------------------
  const [submission] = await db
    .select({
      id: assignmentSubmissions.id,
      status: assignmentSubmissions.status,
      maxMarks: assignments.maxMarks,
    })
    .from(assignmentSubmissions)
    .innerJoin(
      assignments,
      eq(
        assignmentSubmissions.assignmentId,
        assignments.id,
      ),
    )
    .where(
      eq(
        assignmentSubmissions.id,
        payload.submissionId,
      ),
    )
    .limit(1);

  if (!submission) {
    throw new Error("Submission not found");
  }

  // ------------------------------------------------------------
  // 2. Don't grade an unsubmitted assignment
  // ------------------------------------------------------------
  if (submission.status === "not_submitted") {
    throw new Error(
      "Cannot grade an assignment that has not been submitted",
    );
  }

  // ------------------------------------------------------------
  // 3. Validate grading input against assignment max marks
  // ------------------------------------------------------------
  const GradingSchema = AssignmentSubmissionGradingFormSchema(
    Number(submission.maxMarks),
  );

  const validated = GradingSchema.parse({
    marks: Number(payload.obtainedMarks),
    feedback: payload.teacherFeedback,
  });

  // ------------------------------------------------------------
  // 4. Update submission
  // ------------------------------------------------------------
  const gradedAt = new Date();

  await db
    .update(assignmentSubmissions)
    .set({
      status: "graded",

      marksObtained: Number(validated.marks),
      teacherFeedback: validated.feedback,

      gradedBy: trainer.id,
      gradedAt,

      updatedAt: gradedAt,
    })
    .where(
      eq(
        assignmentSubmissions.id,
        payload.submissionId,
      ),
    );

  // ------------------------------------------------------------
  // 5. Return response
  // ------------------------------------------------------------
  return {
    success: true,
    message: "Assignment graded successfully",
  };
}

export async function getAssignmentSubmissionBySubmissionId(
  batchId: string,
  assignmentId: string,
  submissionId: string,
) {
  // ------------------------------------------------------------
  // 1. Authorize trainer
  // ------------------------------------------------------------
  const { trainer } = await requireTrainer();

  // ------------------------------------------------------------
  // 2. Get assignment
  //
  // We intentionally do NOT check batch ownership here.
  // The batch has already been validated by the previous action.
  //
  // We only verify that this assignment belongs to the
  // authenticated trainer.
  // ------------------------------------------------------------
  const [assignment] = await db
    .select({
      id: assignments.id,
      title: assignments.title,
      assignedAt: assignments.assignedAt,
      maxMarks: assignments.maxMarks,

      moduleName: courseModules.title,
      lessonName: moduleLessons.title,
    })
    .from(assignments)
    .leftJoin(
      courseModules,
      eq(assignments.moduleId, courseModules.id),
    )
    .leftJoin(
      moduleLessons,
      eq(assignments.lessonId, moduleLessons.id),
    )
    .where(
      and(
        eq(assignments.id, assignmentId),
        eq(assignments.createdBy, trainer.id),
        isNull(assignments.deletedAt),
      ),
    )
    .limit(1);

  if (!assignment) {
    notFound();
  }

  // ------------------------------------------------------------
  // 3. Get submission + student information
  //
  // The submission must belong to the requested assignment.
  // ------------------------------------------------------------
  const [submission] = await db
    .select({
      submissionId: assignmentSubmissions.id,

      submissionStatus: assignmentSubmissions.status,
      submittedAt: assignmentSubmissions.submittedAt,
      gradedAt: assignmentSubmissions.gradedAt,

      marksObtained: assignmentSubmissions.marksObtained,
      teacherFeedback: assignmentSubmissions.teacherFeedback,
      submissionNote: assignmentSubmissions.submissionNote,

      studentId: studentProfiles.id,
      fullName: users.fullName,
      avatarUrl: assets.url,
      rollNumber: studentProfiles.rollNumber,
    })
    .from(assignmentSubmissions)
    .innerJoin(
      enrollments,
      eq(
        assignmentSubmissions.enrollmentId,
        enrollments.id,
      ),
    )
    .innerJoin(
      studentProfiles,
      eq(
        enrollments.studentId,
        studentProfiles.id,
      ),
    )
    .innerJoin(
      users,
      eq(
        studentProfiles.userId,
        users.id,
      ),
    )
    .leftJoin(
      assets,
      eq(
        users.avatarAssetId,
        assets.id,
      ),
    )
    .where(
      and(
        eq(
          assignmentSubmissions.id,
          submissionId,
        ),
        eq(
          assignmentSubmissions.assignmentId,
          assignmentId,
        ),
        isNull(studentProfiles.deletedAt),
        isNull(users.deletedAt),
      ),
    )
    .limit(1);

  if (!submission) {
    notFound();
  }

  // ------------------------------------------------------------
  // 4. Get submission reference links
  // ------------------------------------------------------------
  const referenceLinks =
    await db
      .select({
        id: assignmentReferenceLinks.id,
        title: assignmentReferenceLinks.title,
        url: assignmentReferenceLinks.url,
      })
      .from(assignmentReferenceLinks)
      .where(
        and(
          eq(
            assignmentReferenceLinks.assignmentId,
            assignmentId,
          ),
          eq(
            assignmentReferenceLinks.submissionId,
            submissionId,
          ),
          eq(
            assignmentReferenceLinks.resourceType,
            "assignment_submission",
          ),
        ),
      );

  // ------------------------------------------------------------
  // 5. Return response
  // ------------------------------------------------------------
  return {
    success: true,

    data: {
      assignment: {
        id: assignment.id,
        title: assignment.title,
        assignedAt: assignment.assignedAt,
        maxMarks: Number(assignment.maxMarks),
        moduleName: assignment.moduleName,
        lessonName: assignment.lessonName,
      },

      submission: {
        submissionId: submission.submissionId,

        student: {
          id: submission.studentId,
          fullName: submission.fullName,
          avatarUrl: submission.avatarUrl,
          rollNumber: submission.rollNumber,
        },

        submissionStatus: submission.submissionStatus,

        submittedAt: submission.submittedAt,
        gradedAt: submission.gradedAt,

        marksObtained:
          submission.marksObtained !== null
            ? Number(submission.marksObtained)
            : null,

        teacherFeedback:
          submission.teacherFeedback,

        submissionNote:
          submission.submissionNote,

        submission_reference_links:
          referenceLinks,
      },
    },
  };
}