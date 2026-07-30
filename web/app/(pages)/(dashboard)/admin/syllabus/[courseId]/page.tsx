// app/admin/syllabus/[courseId]/page.tsx

import { getCourseSyllabus } from "@/lib/actions/syllabus.action";
import { DynamicSyllabusLoader } from "@/components/pages/admin/syllabus/course-builder/syllabus-page-dynamic-loader";
import { AlertTriangle } from "lucide-react";

interface PageProps {
  params: Promise<{
    courseId: string;
  }>;
}

export default async function CourseSyllabusPage({ params }: PageProps) {
  const { courseId } = await params;

  let data;

  try {
    data = await getCourseSyllabus(courseId);
  } catch (error) {
    if (error instanceof Error && error.message === "Course not found.") {
      return (
        <div className="flex min-h-[80vh] flex-col items-center justify-center gap-3">
          <div className="rounded-full bg-destructive/10 p-5">
            <AlertTriangle className="text-destructive size-8" />
          </div>
          <h3 className="text-xl mt-5 font-semibold text-foreground">
            Course Not Found
          </h3>
          <p className="mt-1 text-center text-sm leading-relaxed text-muted-foreground">
            The course you are looking for does not exist or may have been
            removed.
          </p>
        </div>
      );
    }

    throw error;
  }

  return (
    <DynamicSyllabusLoader
      course={data.courseInfo}
      initialModules={data.modules}
    />
  );
}
