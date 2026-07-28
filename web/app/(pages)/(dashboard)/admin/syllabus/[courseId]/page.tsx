// app/admin/syllabus/[courseId]/page.tsx

import { getCourseSyllabus } from "@/lib/actions/syllabus.action";
import { DynamicSyllabusLoader } from "@/components/pages/admin/syllabus/course-builder/syllabus-page-dynamic-loader";

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
        <div className="flex min-h-screen flex-col items-center justify-center gap-3">
          <h1 className="text-2xl font-semibold">Course not found</h1>

          <p className="text-muted-foreground">
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
