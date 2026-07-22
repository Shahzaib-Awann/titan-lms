import { CourseForm } from "@/components/forms/course-form";
import { getCourseForEdit } from "@/lib/actions/admin/course.action";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Course | Titan LMS",
  description: "Edit course for Titan LMS.",
};

export default async function EditCoursePage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;
  const course = await getCourseForEdit(id);

  if (!course) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Course not found.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Edit Course</h1>

        <p className="mt-2 text-muted-foreground">
          Edit the course information.
        </p>
      </div>

      <div className="mt-4">
        <CourseForm data={course} />
      </div>
    </div>
  );
}
