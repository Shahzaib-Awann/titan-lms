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
import z, { ZodError } from "zod";
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

/**
 * Retrieves all published assignments for a student's batch, including
 * assignment reference links, the student's submissions, and submission links.
 *
 * @param {string} batchId - Batch ID for which to retrieve assignments.
 * @returns {Promise<Object>} Result containing the student's assignments and
 * associated submission details, or an error response if the student profile
 * or enrollment is not found.
 * @throws {Error} If fetching assignments or related data fails.
 */
export async function getStudentPortalAssignments(batchId: string) {
  // Authorize User
  const user = await requireRole("student");

  try {
    // Find the current student's profile.
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

    // if the student profile does not exist.
    if (!student) {
      return {
        success: false,
        data: null,
        error: "Student profile not found",
      };
    }

    // Find the student's enrollment in this batch.
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

    // if the enrollment does not exist.
    if (!enrollment) {
      return {
        success: false,
        data: null,
        error: "You are not enrolled in this batch",
      };
    }

    // Fetch all published assignments for the batch.
    const assignmentRows = await db
      .select({
        assignmentId: assignments.id,
        title: assignments.title,
        instructions: assignments.instructions,
        moduleName: courseModules.title,
        lessonName: moduleLessons.title,
        maxMarks: assignments.maxMarks,
        batchId: assignments.batchId,
        assignedAt: assignments.assignedAt,
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

    // if there are no assignments.
    if (assignmentRows.length === 0) {
      return {
        success: true,
        data: [],
      };
    }

    // Extract assignment IDs for related queries.
    const assignmentIds = assignmentRows.map(
      ({ assignmentId }) => assignmentId,
    );

    // Fetch assignment links and student submissions in parallel.
    const [assignmentReferenceLinksResult, submissions] =
      await Promise.all([
        // Get reference links attached to assignments.
        db
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
          ),

        // Get this student's submissions for the assignments.
        db
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
          ),
      ]);

    // Extract submission IDs for fetching submission links.
    const submissionIds = submissions.map(({ id }) => id);

    // Fetch links attached to student submissions.
    const submissionReferenceLinks =
      submissionIds.length > 0
        ? await db
            .select({
              id: assignmentReferenceLinks.id,
              submissionId: assignmentReferenceLinks.submissionId,
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

    // Create a map for quick assignment-link lookup.
    const assignmentLinksById = new Map< string, {
        id: string;
        title: string;
        url: string;
      }[]
    >();

    // Group assignment links by assignment ID.
    for (const link of assignmentReferenceLinksResult) {
      // Get existing links or create an empty list.
      const links = assignmentLinksById.get(link.assignmentId) ?? [];

      // Push the link to the list.
      links.push({
        id: link.id,
        title: link.title,
        url: link.url,
      });

      // Update the map with the links for this assignment.
      assignmentLinksById.set(link.assignmentId, links);
    }

    // Create a map for quick submission lookup by assignment.
    const submissionsByAssignmentId = new Map(
      submissions.map((submission) => [
        submission.assignmentId,
        submission,
      ]),
    );

    // Create a map for quick submission-link lookup.
    const submissionLinksById = new Map<string, {
        id: string;
        title: string;
        url: string;
      }[]>();

    // Group submission links by submission ID.
    for (const link of submissionReferenceLinks) {
      // Skip links without a submission ID.
      if (!link.submissionId) continue;

      // Get existing links or create an empty list.
      const links = submissionLinksById.get(link.submissionId) ?? [];

      // Push the link to the list.
      links.push({
        id: link.id,
        title: link.title,
        url: link.url,
      });

      // Save the updated links for this submission.
      submissionLinksById.set(link.submissionId, links);
    }

    // Build the final assignment response.
    const data = assignmentRows.map((assignment) => {
      // Find the student's submission for this assignment.
      const submission = submissionsByAssignmentId.get(
        assignment.assignmentId,
      );

      // Return assignment data with links and submission details.
      return {
        assignmentId: assignment.assignmentId,
        title: assignment.title,
        instructions: assignment.instructions,
        moduleName: assignment.moduleName ?? null,
        lessonName: assignment.lessonName ?? null,
        maxMarks: assignment.maxMarks,
        batchId: assignment.batchId,
        assignedAt: assignment.assignedAt,
        dueAt: assignment.dueAt,

        assignment_reference_links:
          assignmentLinksById.get(assignment.assignmentId) ?? [],

        submission: submission
          ? {
              id: submission.id,
              status:
                submission.status as AssignmentSubmissionStatus,
              submissionNote: submission.submissionNote,
              submittedAt: submission.submittedAt ?? null,
              marksObtained: submission.marksObtained ?? null,
              teacherFeedback:
                submission.teacherFeedback ?? null,
              gradedAt: submission.gradedAt ?? null,

              submission_reference_links:
                submissionLinksById.get(submission.id) ?? [],
            }
          : null,
      };
    });

    // Return the final assignment data.
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error(
      "Failed to get student portal assignments:",
      error,
    );

    // Return a safe error response.
    return {
      success: false,
      data: null,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch assignments",
    };
  }
}

 /**
  * Submits a student's assignment with optional reference links.
  *
  * @param {string} assignmentId - Assignment ID to submit.
  * @param {unknown} input - Submission data to validate and save.
  * @returns {Promise<Object>} Submission result with a success message or error.
  */
export async function submitAssignment(
  assignmentId: string,
  input: unknown,
): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  // Authorize User
  const user = await requireRole("student");

  try {
    // Validate the submission input.
    const validated = AssignmentSubmissionFormSchema.parse(input);

    // Fetch the student and assignment in parallel.
    const [[student], [assignment]] = await Promise.all([
      db
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
        .limit(1),

      db
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
        .limit(1),
    ]);

    // if the student profile does not exist.
    if (!student) {
      return {
        success: false,
        error: "Student profile not found",
      };
    }

    // if the assignment does not exist.
    if (!assignment) {
      return {
        success: false,
        error: "Assignment not found",
      };
    }

    // if the assignment is not published.
    if (assignment.status !== "published") {
      return {
        success: false,
        error: "This assignment is not available for submission",
      };
    }

    // Find the student's enrollment in the assignment's batch.
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

      // if the enrollment does not exist.
    if (!enrollment) {
      return {
        success: false,
        error: "You are not enrolled in this assignment's batch",
      };
    }

    // Check if the student's enrollment is allowed to submit.
    if (
      enrollment.status !== "active" &&
      enrollment.status !== "completed"
    ) {
      return {
        success: false,
        error: "Your enrollment is not active",
      };
    }

    // Check if the student has already submitted this assignment.
    const [existingSubmission] = await db
      .select({
        id: assignmentSubmissions.id,
      })
      .from(assignmentSubmissions)
      .where(
        and(
          eq(
            assignmentSubmissions.assignmentId,
            assignment.id,
          ),
          eq(
            assignmentSubmissions.enrollmentId,
            enrollment.id,
          ),
        ),
      )
      .limit(1);

    // if a submission already exists.
    if (existingSubmission) {
      return {
        success: false,
        error: "You have already submitted this assignment",
      };
    }

    // Create the submission timestamp.
    const submittedAt = new Date();

    // Get the submitted date without the time.
    const submittedDate = new Date(
      submittedAt.getFullYear(),
      submittedAt.getMonth(),
      submittedAt.getDate(),
    );

    // Get the due date without the time.
    const dueDate = new Date(
      assignment.dueAt.getFullYear(),
      assignment.dueAt.getMonth(),
      assignment.dueAt.getDate(),
    );

    // Determine whether the submission is on time or late.
    const submissionStatus = submittedDate <= dueDate ? "submitted" : "late";

    try {
      // Save the submission and its links atomically.
      const result = await db.transaction(async (tx) => {
        const submissionId = nanoid();

        // Create the assignment submission.
        await tx.insert(assignmentSubmissions).values({
          id: submissionId,
          assignmentId: assignment.id,
          enrollmentId: enrollment.id,
          status: submissionStatus,
          submittedAt,
          submissionNote: validated.submissionNote,
          marksObtained: null,
          teacherFeedback: null,
          gradedBy: null,
          gradedAt: null,
        });

        // Save the submission links.
        if (validated.referenceLinks.length > 0) {
          await tx.insert(assignmentReferenceLinks).values(
            validated.referenceLinks.map((link) => ({
              id: nanoid(),
              assignmentId: assignment.id,
              submissionId,
              resourceType: "assignment_submission" as const,
              title: link.title,
              url: link.url,
              createdAt: submittedAt,
            })),
          );
        }

        // Return the created submission details.
        return {
          submissionId,
          status: submissionStatus,
        };
      });

      // Return a success message based on submission status.
      return {
        success: true,
        message:
          result.status === "late"
            ? "Assignment submitted late"
            : "Assignment submitted successfully",
      };
    } catch (error) {
      // Handle duplicate submission errors from the database.
      if ( error && typeof error === "object" && "errno" in error && error.errno === 1062) {
        return {
          success: false,
          error: "You have already submitted this assignment",
        };
      }

      // Re-throw unexpected transaction errors.
      throw error;
    }
  } catch (error) {
    // Handle validation errors from Zod.
    if (error instanceof ZodError) {
      return {
        success: false,
        error: "Invalid submission data",
      };
    }

    console.error("Failed to submit assignment:", error);

    // Return a safe error response.
    return {
      success: false,
      error: "Failed to submit assignment",
    };
  }
}



 /**
  * Retrieves assignment details and submission statistics for a trainer's batch.
  *
  * @param {string} batchId - Batch ID containing the assignment.
  * @param {string} assignmentId - Assignment ID to retrieve.
  * @returns {Promise<Object>} Assignment details with student submission statistics.
  */
export async function getAssignmentSubmissionsSummary(
  batchId: string,
  assignmentId: string,
) {
  // Authorize Trainer
  const { trainer } = await requireTrainer();

  // Find the assignment and verify trainer access to the batch.
  const [assignment] = await db
    .select({
      id: assignments.id,
      title: assignments.title,
      instructions: assignments.instructions,
      dueAt: assignments.dueAt,
      maxMarks: assignments.maxMarks,
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
        eq(courseBatches.trainerId, trainer.id),
        isNull(assignments.deletedAt),
        isNull(courseBatches.deletedAt),
      ),
    )
    .limit(1);

  // Handle cases where assignment is not found.
  if (!assignment) {
    notFound();
  }

  // Fetch statistics for students and submissions in parallel.
  const [[studentStats], [submissionStats]] =
    await Promise.all([
      // Count all active students in the batch.
      db
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
        ),

        // Count submitted and graded assignments.
      db
        .select({
          submittedCount: count(
            assignmentSubmissions.id,
          ),
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
            eq(
              assignmentSubmissions.assignmentId,
              assignmentId,
            ),
            eq(enrollments.batchId, batchId),
            eq(enrollments.status, "active"),
            isNull(enrollments.deletedAt),
          ),
        ),
    ]);

    // Convert database count values to numbers.
  const totalStudentCount = Number(
    studentStats?.totalStudentCount ?? 0,
  );

  const submittedCount = Number(
    submissionStats?.submittedCount ?? 0,
  );

  const gradedCount = Number(
    submissionStats?.gradedCount ?? 0,
  );

  // Return assignment details and submission statistics.
  return {
    success: true,
    data: {
      assignment: {
      title: assignment.title,
      instructions: assignment.instructions,
      dueAt: assignment.dueAt,
      maxMarks: assignment.maxMarks,
      moduleName: assignment.moduleName ?? null,
      lessonName: assignment.lessonName ?? null,
    },
    stats: {
      totalStudentCount,
      submittedCount,
      pendingCount: Math.max(
        totalStudentCount - submittedCount,
        0,
      ),
      gradedCount,
    },
    }
  };
}

/**
 * Retrieves all active students and their submission details for an assignment.
 *
 * @param {string} batchId - Batch ID containing the assignment.
 * @param {string} assignmentId - Assignment ID to retrieve submissions for.
 * @returns {Promise<Object>} Student submission data formatted for a datatable.
 */
export async function getAssignmentSubmissionsDatatable(
  batchId: string,
  assignmentId: string,
) {
  // Authorize Trainer
  const { trainer } = await requireTrainer();

  // Fetch all active students and their assignment submissions.
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
      and(
        eq(assignments.id, assignmentId),
        eq(assignments.batchId, batchId),
      ),
    )
    .innerJoin(
      courseBatches,
      and(
        eq(courseBatches.id, batchId),
        eq(courseBatches.trainerId, trainer.id),
      ),
    )
    .leftJoin(
      assets,
      and(
        eq(users.avatarAssetId, assets.id),
        isNull(assets.deletedAt),
      ),
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
        isNull(courseBatches.deletedAt),
        isNull(assignments.deletedAt),
      ),
    )
    .orderBy(studentProfiles.rollNumber);

  // Return student submission data in datatable format.
  return {
    success: true,
    data: {
      submissions: rows.map((row) => ({
      student: {
        id: row.studentId,
        fullName: row.fullName,
        avatarUrl: row.avatarUrl ?? null,
        rollNumber: row.rollNumber,
      },
      submissionId: row.submissionId ?? "",
      submissionStatus:
        row.submissionStatus ?? "not_submitted",
      submittedAt: row.submittedAt ?? null,
      marksObtained:
        row.marksObtained !== null
          ? Number(row.marksObtained)
          : null,
      maxMarks: Number(row.maxMarks),
    }))
    }
  };
}

/**
 * Grades a student's assignment submission with marks and teacher feedback.
 *
 * @param {Object} payload - Grading payload.
 * @param {string} payload.submissionId - Submission ID to grade.
 * @param {number} payload.obtainedMarks - Marks obtained by the student.
 * @param {string} payload.teacherFeedback - Feedback from the trainer.
 * @returns {Promise<Object>} Grading result with success/error status.
 */
export async function gradeAssignmentSubmission(
  payload: {
    submissionId: string;
    obtainedMarks: number;
    teacherFeedback: string;
  },
) {
  // Authorize Trainer
  const { trainer } = await requireTrainer();

  try {
    // Find the submission and verify trainer access.
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
      .innerJoin(
        courseBatches,
        and(
          eq(courseBatches.id, assignments.batchId),
          eq(courseBatches.trainerId, trainer.id),
        ),
      )
      .where(
        and(
          eq(
            assignmentSubmissions.id,
            payload.submissionId,
          ),
          isNull(assignments.deletedAt),
          isNull(courseBatches.deletedAt),
        ),
      )
      .limit(1);

    // if the submission does not exist.
    if (!submission) {
      return {
        success: false,
        error: "Submission not found",
      };
    }

    // if the assignment has not been submitted yet.
    if (submission.status === "not_submitted") {
      return {
        success: false,
        error:
          "Cannot grade an assignment that has not been submitted",
      };
    }

    // Create a grading schema using the assignment's maximum marks.
    const GradingSchema =
      AssignmentSubmissionGradingFormSchema(
        Number(submission.maxMarks),
      );

    // Validate the marks and teacher feedback.
    const validated = GradingSchema.parse({
      marks: Number(payload.obtainedMarks),
      feedback: payload.teacherFeedback,
    });

    // Create the grading timestamp.
    const gradedAt = new Date();

    // Update the submission with the grading details.
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
      .where(eq(assignmentSubmissions.id, submission.id));

    // Return a successful grading response.
    return {
      success: true,
      message: "Assignment graded successfully",
    };
  } catch (error) {
    // Handle grading validation errors from Zod.
    if (error instanceof ZodError) {
      return {
        success: false,
        error: "Invalid grading data",
      };
    }

    console.error("Failed to grade assignment submission:", error);

    // Return a safe error response.
    return {
      success: false,
      error: "Failed to grade assignment submission",
    };
  }
}

/**
 * Retrieves a specific assignment submission with student and reference link details.
 *
 * @param {string} batchId - Batch ID containing the assignment.
 * @param {string} assignmentId - Assignment ID associated with the submission.
 * @param {string} submissionId - Submission ID to retrieve.
 * @returns {Promise<Object>} Assignment, student, submission, and reference link details.
 */
export async function getAssignmentSubmissionBySubmissionId(
  batchId: string,
  assignmentId: string,
  submissionId: string,
) {
  // Authorize Trainer
  const { trainer } = await requireTrainer();

  // Find the assignment and verify trainer access to the batch.
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
    .innerJoin(
      courseBatches,
      and(
        eq(courseBatches.id, assignments.batchId),
        eq(courseBatches.id, batchId),
        eq(courseBatches.trainerId, trainer.id),
      ),
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
        isNull(assignments.deletedAt),
        isNull(courseBatches.deletedAt),
      ),
    )
    .limit(1);

  // if the assignment does not exist or is not accessible.
  if (!assignment) {
    notFound();
  }

  // Find the requested submission and its student details.
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
      eq(studentProfiles.userId, users.id),
    )
    .leftJoin(
      assets,
      and(
        eq(users.avatarAssetId, assets.id),
        isNull(assets.deletedAt),
      ),
    )
    .where(
      and(
        eq(assignmentSubmissions.id, submissionId),
        eq(
          assignmentSubmissions.assignmentId,
          assignmentId,
        ),
        eq(enrollments.batchId, batchId),
        isNull(enrollments.deletedAt),
        isNull(studentProfiles.deletedAt),
        isNull(users.deletedAt),
      ),
    )
    .limit(1);

  // if the submission does not exist or is not accessible.
  if (!submission) {
    notFound();
  }

  // Fetch reference links attached to the submission.
  const referenceLinks = await db
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

  // Return assignment, student, submission, and link details.
  return {
    success: true,
    data: {
      assignment: {
        id: assignment.id,
        title: assignment.title,
        assignedAt: assignment.assignedAt,
        maxMarks: Number(assignment.maxMarks),
        moduleName: assignment.moduleName ?? null,
        lessonName: assignment.lessonName ?? null,
      },

      submission: {
        submissionId: submission.submissionId,

        student: {
          id: submission.studentId,
          fullName: submission.fullName,
          avatarUrl: submission.avatarUrl ?? null,
          rollNumber: submission.rollNumber,
        },

        submissionStatus: submission.submissionStatus,
        submittedAt: submission.submittedAt,
        gradedAt: submission.gradedAt,

        marksObtained:
          submission.marksObtained !== null
            ? Number(submission.marksObtained)
            : null,

        teacherFeedback: submission.teacherFeedback,
        submissionNote: submission.submissionNote,

        submission_reference_links: referenceLinks,
      },
    },
  };
}