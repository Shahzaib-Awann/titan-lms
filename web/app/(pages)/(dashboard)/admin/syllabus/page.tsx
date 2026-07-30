import { SyllabusStatsCards } from "@/components/pages/admin/syllabus/syllabus-stats-cards";
import { SyllabusCourseList } from "@/components/pages/admin/syllabus/syllabus-course-list";
import { SyllabusFilters } from "@/components/pages/admin/syllabus/syllabus-filters";
import {
  getSyllabusCoursesSummaryList,
  getSyllabusStats,
} from "@/lib/actions/syllabus.action";
import { Suspense } from "react";
import { AlertTriangle } from "lucide-react";

export default async function SyllabusPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    sort?: "asc" | "desc";
  }>;
}) {
  const params = await searchParams;

  const [stats, courses] = await Promise.all([
    getSyllabusStats(),

    getSyllabusCoursesSummaryList({
      search: params.search,
      sort: params.sort,
    }),
  ]);

  const coursesError = !courses.success ? courses.message : null;

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

      {coursesError ? (
        <div className="p-6 flex flex-col items-center">
          <div className="rounded-full bg-destructive/10 p-5">
            <AlertTriangle className="text-destructive size-8" />
          </div>
          <h3 className="text-xl mt-5 font-semibold text-foreground">
            Unable to load courses
          </h3>
          <p className="mt-1 text-center text-sm leading-relaxed text-muted-foreground">
            {coursesError}
          </p>
        </div>
      ) : (
        <SyllabusCourseList courses={courses.data ?? []} />
      )}
    </div>
  );
}
