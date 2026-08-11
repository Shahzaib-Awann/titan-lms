import { TrainerBatchStudentRow } from "./columns";
import { BatchStudentDataTable } from "./_components/batch-student-datatable";

export default async function StudentsPage({
  params,
}: {
  params: Promise<{ batchId: string }>;
}) {
  const { batchId } = await params;

  const data: TrainerBatchStudentRow[] = [
    {
      student: {
        id: "student-001",
        userId: "user-001",
        fullName: "Ali Raza",
        avatarUrl: null,
        rollNumber: "ST-001",
      },
      enrollment: {
        id: "enrollment-001",
        status: "active",
        enrolledAt: "2026-01-15T10:00:00.000Z",
      },
      assignments: {
        total: 10,
        submitted: 8,
        graded: 7,
        late: 1,
        pending: 2,
      },
    },
    {
      student: {
        id: "student-002",
        userId: "user-002",
        fullName: "Ayesha Khan",
        avatarUrl: null,
        rollNumber: "ST-002",
      },
      enrollment: {
        id: "enrollment-002",
        status: "completed",
        enrolledAt: "2025-09-10T10:00:00.000Z",
      },
      assignments: {
        total: 12,
        submitted: 12,
        graded: 12,
        late: 2,
        pending: 0,
      },
    },
    {
      student: {
        id: "student-003",
        userId: "user-003",
        fullName: "Hamza Ahmed",
        avatarUrl: null,
        rollNumber: "ST-003",
      },
      enrollment: {
        id: "enrollment-003",
        status: "suspended",
        enrolledAt: "2026-02-20T10:00:00.000Z",
      },
      assignments: {
        total: 10,
        submitted: 5,
        graded: 4,
        late: 2,
        pending: 5,
      },
    },
  ];

  return (
    <div className="container mx-auto py-10">
      <BatchStudentDataTable data={data} batchId={batchId} />
    </div>
  );
}
