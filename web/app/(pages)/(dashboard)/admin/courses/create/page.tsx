import { CourseForm } from "@/components/forms/course-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Course | Titan LMS",
  description: "Create a new course for Titan LMS.",
};

export default function CreateCoursePage() {
  return (
    <div className="flex flex-col gap-6 p-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Create Course</h1>
        <p className="text-muted-foreground mt-2">
          Add a new course to manage the learning platform.
        </p>
      </div>

      <div className="mt-4">
        <CourseForm />
      </div>
    </div>
  );
}
