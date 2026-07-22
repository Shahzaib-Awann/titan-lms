import { StudentForm } from "@/components/forms/student-form";
import { getStudentForEdit } from "@/lib/actions/admin/student.action";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Student | Titan LMS",
  description: "Edit student for Titan LMS.",
};

export default async function EditStudentPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;
  const student = await getStudentForEdit(id);

  if (!student) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Student not found.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Edit Student</h1>

        <p className="mt-2 text-muted-foreground">
          Edit the student account information.
        </p>
      </div>

      <div className="mt-4">
        <StudentForm data={student} />
      </div>
    </div>
  );
}
