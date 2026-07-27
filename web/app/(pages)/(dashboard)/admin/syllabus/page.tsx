import { SyllabusStatsCards } from "./_components/syllabus-stats-cards";
import { SyllabusCourseList } from "./_components/syllabus-course-list";
import { mockCourses, computeStats } from "./_data/mock-data";
import { SyllabusFilters } from "./_components/syllabus-filters";

export default function SyllabusPage() {
  const stats = computeStats(mockCourses);

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

      <SyllabusFilters />

      {/* Course List with Filters */}
      <SyllabusCourseList courses={mockCourses} />
    </div>
  );
}
