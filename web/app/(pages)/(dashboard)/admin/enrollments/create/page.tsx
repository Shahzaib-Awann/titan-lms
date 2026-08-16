import StudentEnrollmentForm from "@/components/forms/student-enrollment-form";
import { getCoursesWithBatchesForEnrollments } from "@/lib/actions/enrollment.action";

// --- Types & Interfaces ---
export interface Schedule {
  id: string;
  weekday: string;
  startTime: string;
  endTime: string;
  room: string | null;
}

export interface Trainer {
  id: string;
  fullName: string | null;
  specialization: string | null;
  avatar: string | null;
}

export interface Batch {
  id: string;
  batchName: string | null;
  startDate: Date | null;
  endDate: Date | null;
  trainer: Trainer;
  schedules: Schedule[];
}

export interface Course {
  id: string;
  title: string;
  durationWeeks: number;
  feeAmount: number;
  batches: Batch[];
}

export interface StudentForEnrollmentList {
  id: string;
  avatar: string | null;
  name: string;
  cnic: string;
  rollNumber: string;
  guardianName: string | null;
  phone: string | null;
}

export default async function CreateEnrollmentPage() {
  const coursesData: Course[] = await getCoursesWithBatchesForEnrollments();

  return (
    <div className="flex flex-col gap-6 p-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">
          Create Students Bulk Enrollments
        </h1>

        <p className="text-muted-foreground mt-2">
          Add new students enrollments in bulk to manage the learning platform.
        </p>
      </div>

      <div className="mt-4">
        <StudentEnrollmentForm courses={coursesData} />
      </div>
    </div>
  );
}
