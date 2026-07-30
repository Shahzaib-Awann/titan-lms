import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BatchProgressTable } from "./batch-progress-table";
import { EmptyState } from "./empty-state";
import {
  Clock,
  LayoutList,
  PlayCircle,
  Settings,
  ChartBar,
} from "lucide-react";
import Link from "next/link";
import { CourseSyllabusSummary } from "@/types/syllabus";

interface CourseSyllabusCardProps {
  course: CourseSyllabusSummary;
}

export function CourseSyllabusCard({ course }: CourseSyllabusCardProps) {
  const hasSyllabus = course.hasSyllabus;

  return (
    <Card className="shadow-sm min-h-90">
      <div className="grid h-full grid-cols-3">
        {/* Card Header */}
        <CardHeader className="grid h-full grid-rows-[1fr_auto]">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-center gap-2.5 flex-wrap">
              <CardTitle className="text-2xl font-semibold leading-snug">
                {course.title}
              </CardTitle>
            </div>
            <CardDescription className="line-clamp-4 text-sm leading-relaxed">
              {course.description || "No description available"}
            </CardDescription>
          </div>

          <div className="flex flex-col items-start gap-x-5 gap-y-2 py-2">
            <div className="flex items-center  gap-1.5 text-sm text-muted-foreground">
              <Clock className="size-3.5 text-muted-foreground/60" />
              <span>
                <span className="font-medium text-foreground">
                  {course.durationWeeks}
                </span>{" "}
                weeks
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <LayoutList className="size-3.5 text-muted-foreground/60" />
              <span>
                <span className="font-medium text-foreground">
                  {course.moduleCount}
                </span>{" "}
                modules
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <PlayCircle className="size-3.5 text-muted-foreground/60" />
              <span>
                <span className="font-medium text-foreground">
                  {course.lessonCount}
                </span>{" "}
                lessons
              </span>
            </div>
          </div>

          {/* Action Button */}
          <div className="shrink-0">
            <Link href={`/admin/syllabus/${course.id}`}>
              <Button variant="secondary">
                <Settings className="mr-1.5 size-3.5" />
                Manage
              </Button>
            </Link>
          </div>
        </CardHeader>

        <CardContent className="border-l col-span-2">
          {/* Batch Progress Section */}
          {hasSyllabus ? (
            <>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <ChartBar className="size-3.5 text-muted-foreground/70" />
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Active Batch Progress
                  </p>
                </div>

                {course.batches.length > 0 ? (
                  <BatchProgressTable batches={course.batches} />
                ) : (
                  <p className="py-3 text-center text-sm text-muted-foreground">
                    No active batches for this course.
                  </p>
                )}
              </div>
            </>
          ) : (
            <>
              <EmptyState variant="no_syllabus" courseId={course.id} />
            </>
          )}
        </CardContent>
      </div>
    </Card>
  );
}
