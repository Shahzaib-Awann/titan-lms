"use server";

import {
  Batch,
  Course,
} from "@/app/(pages)/(dashboard)/admin/enrollments/create/page";
import { db } from "@/lib/db";
import {
  batchSchedules,
  courseBatches,
  courses,
  enrollments,
  studentProfiles,
  trainerProfiles,
  users,
} from "@/lib/db/schema";
import { and, desc, eq, inArray, isNull, like, or } from "drizzle-orm";
import { alias } from "drizzle-orm/mysql-core";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";

const trainerUsers = alias(users, "trainer_users");

/**
 * Fetches all active student enrollments with related student, course,
 * batch, and trainer details.
 *
 * @returns {Promise<Array>} List of student enrollment records.
 * @throws {Error} If fetching enrollments fails.
 */
export async function getStudentEnrollments() {
  try {
    const rows = await db
      .select({
        enrollmentId: enrollments.id,
        enrollmentDate: enrollments.enrolledAt,
        status: enrollments.status,

        // Student
        studentId: enrollments.studentId,
        studentName: users.fullName,
        studentAvatar: users.avatarAssetId,
        rollNumber: studentProfiles.rollNumber,

        // Course
        courseId: courses.id,
        courseName: courses.title,

        // Batch
        batchId: courseBatches.id,
        batchName: courseBatches.batchName,

        // Trainer
        trainerName: trainerUsers.fullName,
      })
      .from(enrollments)

      // Student
      .innerJoin(studentProfiles, eq(enrollments.studentId, studentProfiles.id))
      .innerJoin(users, eq(studentProfiles.userId, users.id))

      // Batch
      .innerJoin(courseBatches, eq(enrollments.batchId, courseBatches.id))

      // Course
      .innerJoin(courses, eq(courseBatches.courseId, courses.id))

      // Trainer
      .innerJoin(
        trainerProfiles,
        eq(courseBatches.trainerId, trainerProfiles.id),
      )
      .innerJoin(trainerUsers, eq(trainerProfiles.userId, trainerUsers.id))

      .where(
        and(
          eq(enrollments.status, "active"),
          isNull(enrollments.deletedAt),
          isNull(studentProfiles.deletedAt),
          isNull(users.deletedAt),
          isNull(courseBatches.deletedAt),
          isNull(courses.deletedAt),
          isNull(trainerProfiles.deletedAt),
          isNull(trainerUsers.deletedAt),
        ),
      )

      .orderBy(desc(enrollments.enrolledAt));

    return rows.map((row) => ({
      id: row.enrollmentId,

      enrollment: {
        date: row.enrollmentDate,
        status: row.status,
      },

      student: {
        id: row.studentId,
        name: row.studentName,
        rollNumber: row.rollNumber,
        avatarUrl: row.studentAvatar ?? null,
      },

      course: {
        id: row.courseId,
        name: row.courseName,
      },

      batch: {
        id: row.batchId,
        name: row.batchName,
      },

      trainer: {
        name: row.trainerName,
      },
    }));
  } catch (error) {
    console.error("Failed to fetch student enrollments:", error);

    throw new Error("Unable to fetch student enrollments");
  }
}

/**
 * Fetches students for enrollment Creation Bulk List with optional search filtering.
 *
 * @param {Object} params - Search and pagination options.
 * @param {string} [params.search] - Search by name, CNIC, phone, or roll number.
 * @param {number} [params.limit] - Maximum number of students to return.
 * @returns {Promise<Array>} List of student enrollment candidates.
 * @throws {Error} If fetching students fails.
 */
export async function fetchStudentsForEnrollmentList({ search = "", limit = 10 }: { search?: string; limit?: number }) {
  try {
    const normalizedSearch = search.trim();

    const students = await db
      .select({
        id: studentProfiles.id,
        avatar: users.avatarAssetId,
        name: users.fullName,
        rollNumber: studentProfiles.rollNumber,
        cnic: users.cnic,
        guardianName: studentProfiles.guardianName,
        phone: users.phone,
      })
      .from(studentProfiles)
      .innerJoin(users, eq(studentProfiles.userId, users.id))
      .where(
        and(
          isNull(studentProfiles.deletedAt),
          isNull(users.deletedAt),
          normalizedSearch
            ? or(
                like(users.fullName, `%${normalizedSearch}%`),
                like(users.cnic, `%${normalizedSearch}%`),
                like(users.phone, `%${normalizedSearch}%`),
                like(studentProfiles.rollNumber, `%${normalizedSearch}%`),
              )
            : undefined,
        ),
      )
      .limit(limit);

    return students.map((student) => ({
      id: student.id,
      avatar: student.avatar ?? null,
      name: student.name,
      rollNumber: student.rollNumber,
      cnic: student.cnic,
      guardianName: student.guardianName ?? null,
      phone: student.phone ?? null,
    }));
  } catch (error) {
    console.error("Failed to fetch students for enrollment:", {
      error,
      search,
      limit,
    });

    throw new Error("Unable to fetch students for enrollment");
  }
}

/**
 * Fetches all courses with their active batches and trainers for enrollment purposes.
 *
 * @returns {Promise<Array<Object>>} List of courses with nested batch and trainer data.
 * @throws {Error} If fetching courses fails.
 */
export async function getCoursesWithBatchesForEnrollments(): Promise<Course[]> {
  try {
    const rows = await db
      .select({
        courseId: courses.id,
        courseTitle: courses.title,
        durationWeeks: courses.durationWeeks,
        feeAmount: courses.feeAmount,

        batchId: courseBatches.id,
        batchName: courseBatches.batchName,
        startDate: courseBatches.startDate,
        endDate: courseBatches.endDate,

        trainerId: trainerProfiles.id,
        trainerName: users.fullName,
        trainerSpecialization: trainerProfiles.specialization,
        trainerAvatar: users.avatarAssetId,

        scheduleId: batchSchedules.id,
        weekday: batchSchedules.weekday,
        startTime: batchSchedules.startTime,
        endTime: batchSchedules.endTime,
        room: batchSchedules.room,
      })
      .from(courses)
      .leftJoin(
        courseBatches,
        and(
          eq(courseBatches.courseId, courses.id),
          isNull(courseBatches.deletedAt),
        ),
      )
      .leftJoin(
        trainerProfiles,
        eq(courseBatches.trainerId, trainerProfiles.id),
      )
      .leftJoin(
        users,
        and(eq(trainerProfiles.userId, users.id), isNull(users.deletedAt)),
      )
      .leftJoin(batchSchedules, eq(batchSchedules.batchId, courseBatches.id))
      .where(isNull(courses.deletedAt));

    const coursesMap = new Map();

    for (const row of rows) {
      if (!coursesMap.has(row.courseId)) {
        coursesMap.set(row.courseId, {
          id: row.courseId,
          title: row.courseTitle,
          durationWeeks: row.durationWeeks,
          feeAmount: Number(row.feeAmount),
          batches: [],
        });
      }

      const course = coursesMap.get(row.courseId);

      if (!row.batchId) continue;

      let batch = course.batches.find((item: Batch) => item.id === row.batchId);

      if (!batch) {
        batch = {
          id: row.batchId,
          batchName: row.batchName,
          startDate: row.startDate?.toISOString(),
          endDate: row.endDate?.toISOString(),
          trainer: {
            id: row.trainerId,
            fullName: row.trainerName,
            specialization: row.trainerSpecialization,
            avatar: row.trainerAvatar ?? null,
          },
          schedules: [],
        };

        course.batches.push(batch);
      }

      if (row.scheduleId) {
        batch.schedules.push({
          id: row.scheduleId,
          weekday: row.weekday,
          startTime: row.startTime,
          endTime: row.endTime,
          room: row.room,
        });
      }
    }

    return Array.from(coursesMap.values());
  } catch (error) {
    console.error("Failed to fetch courses with batches:", {
      error,
    });

    throw new Error("Unable to fetch courses with batches");
  }
}

/**
 * Creates new student enrollments in bulk for a specific course and batch.
 *
 * @param {Object} payload - Enrollment data.
 * @param {string[]} payload.studentIds - Array of student IDs to enroll.
 * @param {string} payload.courseId - ID of the course.
 * @param {string} payload.batchId - ID of the batch.
 * @returns {Promise<Object>} Result object with success status and message.
 * @throws {Error} If validation fails or enrollment creation fails.
 */
export async function createStudentEnrollments(payload: {
  studentIds: string[];
  courseId: string;
  batchId: string;
}) {
  const { studentIds, courseId, batchId } = payload;

  try {
    return await db.transaction(async (tx) => {
      // Verify batch belongs to course
      const batch = await tx.query.courseBatches.findFirst({
        where: and(
          eq(courseBatches.id, batchId),
          eq(courseBatches.courseId, courseId),
          isNull(courseBatches.deletedAt),
        ),
      });

      if (!batch) {
        throw new Error("Invalid course batch selected");
      }

      // Find already enrolled students
      const existingEnrollments = await tx
        .select({
          studentId: enrollments.studentId,
          name: users.fullName,
        })
        .from(enrollments)
        .innerJoin(
          studentProfiles,
          eq(enrollments.studentId, studentProfiles.id),
        )
        .innerJoin(users, eq(studentProfiles.userId, users.id))
        .where(
          and(
            eq(enrollments.batchId, batchId),
            inArray(enrollments.studentId, studentIds),
            isNull(studentProfiles.deletedAt),
            isNull(users.deletedAt),
          ),
        );

      if (existingEnrollments.length > 0) {
        const alreadyRegisteredStudents = existingEnrollments
          .map((student) => student.name)
          .join(", ");

        throw new Error(
          `${alreadyRegisteredStudents} ${existingEnrollments.length > 1 ? "are" : "is"} already registered in this batch`,
        );
      }

      // Create enrollments
      const enrollmentData = studentIds.map((studentId) => ({
        id: nanoid(),
        studentId,
        batchId,
        status: "active" as const,
      }));

      await tx.insert(enrollments).values(enrollmentData);

      return {
        success: true,
        message: `${studentIds.length} student(s) enrolled successfully`,
      };
    });
  } catch (error) {
    console.error("Failed to create enrollments:", {
      error,
      payload,
    });

    throw error;
  }
}

/**
 * Updates the status of one or more student enrollments.
 *
 * @param {Object} payload - The update payload.
 * @param {string[]} payload.enrollmentIds - Array of enrollment IDs to update.
 * @param {string} payload.action - The status action: "completed", "suspended", or "dropped".
 * @returns {Promise<Object>} Result object with success status and message.
 * @throws {Error} If validation fails or update fails.
 */
export async function updateStudentEnrollmentStatus(payload: { enrollmentIds: string[]; action: "completed" | "suspended" | "dropped" }) {

  const { enrollmentIds, action } = payload;

  try {
    return await db.transaction(async (tx) => {
      /**
       * Find active enrollments
       */
      const existingEnrollments = await tx
        .select({
          id: enrollments.id,
          status: enrollments.status,
        })
        .from(enrollments)
        .where(
          and(
            inArray(enrollments.id, enrollmentIds),
            eq(enrollments.status, "active"),
            isNull(enrollments.deletedAt),
          ),
        );

      /**
       * Validate enrollments
       */
      if (existingEnrollments.length !== enrollmentIds.length) {
        throw new Error(
          "One or more enrollments are invalid or already updated.",
        );
      }

      const now = new Date();

      /**
       * Build update payload
       */
      const updateData =
        action === "dropped"
          ? {
              status: "dropped" as const,
              completedAt: now,
              deletedAt: now,
            }
          : action === "completed"
            ? {
                status: "completed" as const,
                completedAt: now,
              }
            : {
                status: "suspended" as const,
              };

      /**
       * Update enrollments
       */
      await tx
        .update(enrollments)
        .set(updateData)
        .where(inArray(enrollments.id, enrollmentIds));

      return {
        success: true,
        message:
          action === "completed"
            ? "Student enrollment marked as completed successfully."
            : action === "suspended"
              ? "Student enrollment suspended successfully."
              : "Student enrollment removed successfully.",
      };
    });
  } catch (error) {
    console.error("Failed to update student enrollment status:", {
      payload,
      error,
      occurredAt: new Date().toISOString(),
    });

    throw error instanceof Error
      ? error
      : new Error("Unable to update enrollment status");
  } finally {
    revalidatePath("/admin/enrollments");
  }
}

/**
 * Transfers one or more students to a different course and batch.
 *
 * @param {Object} payload - The transfer payload.
 * @param {string[]} payload.studentIds - Array of student IDs to transfer.
 * @param {string} payload.transferToCourseId - ID of the destination course.
 * @param {string} payload.transferToBatchId - ID of the destination batch.
 * @returns {Promise<Object>} Result object with success status and message.
 * @throws {Error} If validation fails or transfer fails.
 */
export async function transferStudentEnrollments(payload: { studentIds: string[]; transferToCourseId: string; transferToBatchId: string }) {

  const { studentIds, transferToCourseId, transferToBatchId } = payload;

  try {
    return await db.transaction(async (tx) => {
      /**
       * Validate destination batch
       */
      const destinationBatch = await tx.query.courseBatches.findFirst({
        where: and(
          eq(courseBatches.id, transferToBatchId),
          eq(courseBatches.courseId, transferToCourseId),
          isNull(courseBatches.deletedAt),
        ),
      });

      if (!destinationBatch) {
        throw new Error(
          "Invalid destination batch. Batch does not belong to the selected course.",
        );
      }

      /**
       * Find active enrollments
       */
      const activeEnrollments = await tx
        .select({
          enrollmentId: enrollments.id,
          batchId: enrollments.batchId,
          studentId: enrollments.studentId,
          studentName: users.fullName,
          courseId: courseBatches.courseId,
        })
        .from(enrollments)
        .innerJoin(
          studentProfiles,
          eq(enrollments.studentId, studentProfiles.id),
        )
        .innerJoin(users, eq(studentProfiles.userId, users.id))
        .innerJoin(courseBatches, eq(enrollments.batchId, courseBatches.id))
        .where(
          and(
            inArray(enrollments.studentId, studentIds),
            eq(enrollments.status, "active"),
            isNull(enrollments.deletedAt),
            isNull(studentProfiles.deletedAt),
            isNull(users.deletedAt),
            isNull(courseBatches.deletedAt),
          ),
        );

      /**
       * Validate every student has an active enrollment
       */
      const enrolledStudentIds = activeEnrollments.map((x) => x.studentId);

      const missingStudents = studentIds.filter(
        (id) => !enrolledStudentIds.includes(id),
      );

      if (missingStudents.length > 0) {
        throw new Error(
          "One or more students do not have an active enrollment.",
        );
      }

      /**
       * Same course validation
       *
       * If destination course equals current course,
       * ensure the destination batch is different.
       */
      for (const enrollment of activeEnrollments) {
        if (
          enrollment.courseId === transferToCourseId &&
          enrollment.batchId === transferToBatchId
        ) {
          throw new Error(
            `${enrollment.studentName} is already enrolled in the selected batch.`,
          );
        }
      }

      /**
       * Check if already enrolled in destination batch
       */
      const existingDestinationEnrollments = await tx
        .select({
          studentId: enrollments.studentId,
          studentName: users.fullName,
        })
        .from(enrollments)
        .innerJoin(
          studentProfiles,
          eq(enrollments.studentId, studentProfiles.id),
        )
        .innerJoin(users, eq(studentProfiles.userId, users.id))
        .where(
          and(
            eq(enrollments.batchId, transferToBatchId),
            inArray(enrollments.studentId, studentIds),
            isNull(enrollments.deletedAt),
            isNull(studentProfiles.deletedAt),
            isNull(users.deletedAt),
          ),
        );

      if (existingDestinationEnrollments.length > 0) {
        const names = existingDestinationEnrollments
          .map((x) => x.studentName)
          .join(", ");

        throw new Error(
          `${names} ${
            existingDestinationEnrollments.length > 1 ? "are" : "is"
          } already enrolled in the selected batch.`,
        );
      }

      /**
       * Close previous enrollments
       */
      const now = new Date();

      await tx
        .update(enrollments)
        .set({
          status: "transferred",
          completedAt: now,
        })
        .where(
          inArray(
            enrollments.id,
            activeEnrollments.map((e) => e.enrollmentId),
          ),
        );

      /**
       * Create new enrollments
       */
      const newEnrollments = activeEnrollments.map((enrollment) => ({
        id: nanoid(),
        studentId: enrollment.studentId,
        batchId: transferToBatchId,
        status: "active" as const,
      }));

      await tx.insert(enrollments).values(newEnrollments);

      revalidatePath("/admin/enrollments");

      return {
        success: true,
        message: `${studentIds.length} student(s) transferred successfully.`,
      };
    });
  } catch (error) {
    console.error("Failed to transfer student enrollments", {
      error,
      payload,
      studentCount: payload.studentIds.length,
      transferToCourseId: payload.transferToCourseId,
      transferToBatchId: payload.transferToBatchId,
      occurredAt: new Date().toISOString(),
    });

    throw error;
  }
}
