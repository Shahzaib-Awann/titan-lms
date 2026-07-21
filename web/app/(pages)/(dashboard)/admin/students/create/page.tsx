import { StudentForm } from "@/components/forms/student-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Student | Titan LMS",
  description: "Create a new student for Titan LMS.",
};

export default function CreateStudentPage() {
  return (
    <div className="flex flex-col gap-6 p-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Create Student</h1>
        <p className="mt-2 text-muted-foreground">
          Add a new student account to get admission in courses.
        </p>
      </div>

      <div className="mt-4">
        <StudentForm />
      </div>
    </div>
  );
}
