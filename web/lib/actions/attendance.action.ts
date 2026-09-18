"use server";

import { and, eq, like, or } from "drizzle-orm";
import {
  courseBatches,
  courses,
  enrollments,
  studentAttendance,
  studentProfiles,
  trainerAttendance,
  trainerProfiles,
  users,
} from "../db/schema";
import { db } from "../db";
import { getEntityStatus } from "../helpers/date-fns";
import { requireRole } from "./auth.action";
import { AttendanceStatus } from "@/types/common";

export async function getAllBatches() {
  const batches = await db
    .select({
      batchId: courseBatches.id,
      batchName: courseBatches.batchName,
      startDate: courseBatches.startDate,
      endDate: courseBatches.endDate,
    })
    .from(courseBatches);

  return batches.map((batch) => ({
    batchId: batch.batchId,
    batchName: batch.batchName,
    batchStatus: getEntityStatus(batch.startDate, batch.endDate),
  }));
}

export async function getStudentAttendance({
  batchId,
  attendanceDate,
  search,
}: {
  batchId?: string;
  attendanceDate?: string;
  search?: string;
}): Promise<
  {
    id: string;
    studentRollNo: string;
    studentName: string;
    attendanceDate: string;
    lastMarked: string;
    courseName: string;
    batchName: string;
    status: AttendanceStatus;
  }[]
> {
  const conditions = [];

  // Filter by batch when provided
  if (batchId) {
    conditions.push(eq(enrollments.batchId, batchId));
  }

  // Filter by attendance date when provided
  if (attendanceDate) {
    conditions.push(eq(studentAttendance.attendanceDate, attendanceDate));
  }

  // Search student by:
  // - student ID
  // - roll number
  // - student name
  // - enrollment ID
  if (search?.trim()) {
    const searchValue = `%${search.trim()}%`;

    conditions.push(
      or(
        like(studentProfiles.id, searchValue),
        like(studentProfiles.rollNumber, searchValue),
        like(users.fullName, searchValue),
        like(enrollments.id, searchValue),
      ),
    );
  }

  const attendance = await db
    .select({
      id: studentAttendance.id,
      student_rollno: studentProfiles.rollNumber,
      student_name: users.fullName,
      attendance_date: studentAttendance.attendanceDate,
      last_marked: studentAttendance.updatedAt,
      course_name: courses.title,
      batch_name: courseBatches.batchName,
      status: studentAttendance.status,
    })
    .from(studentAttendance)
    .innerJoin(
      studentProfiles,
      eq(studentAttendance.studentId, studentProfiles.id),
    )
    .innerJoin(users, eq(studentProfiles.userId, users.id))
    .innerJoin(enrollments, eq(studentAttendance.enrollmentId, enrollments.id))
    .innerJoin(courseBatches, eq(enrollments.batchId, courseBatches.id))
    .innerJoin(courses, eq(courseBatches.courseId, courses.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  return attendance.map((row) => ({
    id: row.id,
    studentRollNo: row.student_rollno,
    studentName: row.student_name,
    attendanceDate: row.attendance_date,
    lastMarked: row.last_marked.toISOString(),
    courseName: row.course_name,
    batchName: row.batch_name,
    status: row.status,
  }));
}

export async function getTrainerAttendance({
  attendanceDate,
  search,
}: {
  batchId?: string;
  attendanceDate?: string;
  search?: string;
}): Promise<
  {
    id: string;
    employeeCode: string;
    trainerName: string;
    attendanceDate: string;
    expertise: string;
    courseName: string;
    batchName: string;
    lastMarked: string;
    status: AttendanceStatus;
  }[]
> {
  const conditions = [];

  // Filter by attendance date when provided
  if (attendanceDate) {
    conditions.push(eq(trainerAttendance.attendanceDate, attendanceDate));
  }

  // Search trainer by:
  // - trainer ID
  // - employee code
  // - trainer name
  // - attendance ID
  // - batch ID
  if (search?.trim()) {
    const searchValue = `%${search.trim()}%`;

    conditions.push(
      or(
        like(trainerProfiles.id, searchValue),
        like(trainerProfiles.employeeCode, searchValue),
        like(users.fullName, searchValue),
        like(trainerAttendance.id, searchValue),
        like(trainerAttendance.batchId, searchValue),
      ),
    );
  }

  const attendance = await db
    .select({
      id: trainerAttendance.id,
      trainer_employee_code: trainerProfiles.employeeCode,
      trainer_name: users.fullName,
      attendance_date: trainerAttendance.attendanceDate,
      expertise: trainerProfiles.specialization,
      course_name: courses.title,
      batch_name: courseBatches.batchName,
      last_marked: trainerAttendance.updatedAt,
      status: trainerAttendance.status,
    })
    .from(trainerAttendance)
    .innerJoin(
      trainerProfiles,
      eq(trainerAttendance.trainerId, trainerProfiles.id),
    )
    .innerJoin(users, eq(trainerProfiles.userId, users.id))
    .innerJoin(courseBatches, eq(trainerAttendance.batchId, courseBatches.id))
    .innerJoin(courses, eq(courseBatches.courseId, courses.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  return attendance.map((row) => ({
    id: row.id,
    employeeCode: row.trainer_employee_code,
    trainerName: row.trainer_name,
    attendanceDate: row.attendance_date,
    expertise: row.expertise ?? "",
    courseName: row.course_name,
    batchName: row.batch_name,
    lastMarked: row.last_marked.toISOString(),
    status: row.status,
  }));
}

// Updates a student or trainer attendance record after verifying admin access.
export async function updateAttendance({
  type,
  id,
  status,
}: {
  type: "student" | "trainer";
  id: string;
  status: "present" | "absent" | "leave";
}) {
  // Ensures only admins can update attendance.
  const user = await requireRole("admin");

  // Selects the correct attendance table based on the record type.
  const attendanceTable =
    type === "student" ? studentAttendance : trainerAttendance;

  // Checks that the attendance record exists before updating it.
  const [attendance] = await db
    .select({
      id: attendanceTable.id,
    })
    .from(attendanceTable)
    .where(eq(attendanceTable.id, id))
    .limit(1);

  // Returns a type-specific error when the record does not exist.
  if (!attendance) {
    throw new Error(
      type === "student"
        ? "Student attendance record not found"
        : "Trainer attendance record not found",
    );
  }

  // Updates the attendance status and records who made the change.
  await db
    .update(attendanceTable)
    .set({
      status,
      markedBy: user.id,
    })
    .where(eq(attendanceTable.id, id));

  // Returns a consistent result for both student and trainer records.
  return {
    type,
    id,
    success: true,
  };
}
