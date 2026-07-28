import { SyllabusStatsCards } from "@/components/pages/admin/syllabus/syllabus-stats-cards";
import { SyllabusCourseList } from "@/components/pages/admin/syllabus/syllabus-course-list";
import { mockCourses } from "@/lib/data/syllabus.mock";
import { SyllabusFilters } from "@/components/pages/admin/syllabus/syllabus-filters";
import { getSyllabusStats } from "@/lib/actions/syllabus.action";
import { Suspense } from "react";

export default async function SyllabusPage() {
  const stats = await getSyllabusStats();

  return (
    <div className="flex flex-col gap-8 p-6 lg:p-8 max-w-[1600px] mx-auto w-full animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div>
            <h1 className="text-[32px] font-extrabold tracking-[-0.03em] text-foreground">
              Syllabus Management
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Organize course modules, lessons, and learning progress from one
              centralized workspace.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <SyllabusStatsCards stats={stats} />

      <Suspense fallback={<div>Loading...</div>}>
        <SyllabusFilters />
      </Suspense>

      {/* Course List with Filters */}
      <SyllabusCourseList courses={mockCourses} />
    </div>
  );
}
