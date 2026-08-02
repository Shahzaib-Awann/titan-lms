import { SearchSortFilterBar } from "@/components/pages/syllabus-filters";
import { getTrainerActiveBatches } from "@/lib/actions/batch.action";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  Users,
  GraduationCap,
  AlertCircle,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

import { formatDate, getEntityStatus } from "@/lib/helpers/date-fns";
import { BatchScheduleItem } from "@/components/pages/batch-schedule-item";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

const BatchesPage = async ({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    sort?: "asc" | "desc";
  }>;
}) => {
  const { search, sort } = await searchParams;

  const response = await getTrainerActiveBatches({
    search,
    sort,
  });

  const batches = response.data ?? [];

  return (
    <section className="space-y-10 pt-10">
      <SearchSortFilterBar />

      {!response.success && (
        <Alert variant="destructive" className="flex flex-row items-center">
          <AlertCircle className="h-4 w-4" />

          <AlertDescription>
            We couldn&apos;t load your batches. Please try again later.
          </AlertDescription>
        </Alert>
      )}

      {response.success && batches.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-20 text-center">
          <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-primary/10">
            <GraduationCap className="size-6 text-primary" />
          </div>

          <h3 className="text-lg font-semibold">No Active Batches</h3>

          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            You don&apos;t have any active batches assigned yet.
          </p>
        </div>
      )}

      {response.success && batches.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {batches.map((batch) => {
            const status = getEntityStatus(batch.startDate, batch.endDate);

            return (
              <Card
                key={batch.batchId}
                className="shadow-sm transition hover:-translate-y-0.5"
              >
                <CardContent className="grid gap-6 py-4 md:grid-cols-2">
                  {/* LEFT SIDE */}
                  <div className="flex flex-col justify-between">
                    <div>
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <div className="inline-flex uppercase tracking-wider items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                          <GraduationCap className="mr-1 h-3.5 w-3.5" />
                          {batch.courseName}
                        </div>

                        <Badge
                          variant={
                            status === "live"
                              ? "success"
                              : status === "completed"
                                ? "default"
                                : "info"
                          }
                          className={`rounded-full uppercase tracking-wider`}
                        >
                          {status}
                        </Badge>
                      </div>

                      <h3 className="text-2xl font-semibold">
                        {batch.batchName}
                      </h3>

                      {/* Meta */}
                      <div className="mt-6 space-y-3">
                        <Meta
                          icon={CalendarDays}
                          text={
                            <span className="flex items-center gap-2">
                              {formatDate(batch.startDate)}
                              <ArrowRight className="size-3.5" />
                              {formatDate(batch.endDate)}
                            </span>
                          }
                        />

                        <Meta icon={Clock3} text={`${batch.duration} weeks`} />

                        <Meta
                          icon={Users}
                          text={`${batch.studentCount} Students`}
                        />
                      </div>
                    </div>

                    <Link
                      href={`/trainer/batches/${batch.batchId}`}
                      className="mt-6"
                    >
                      <Button>
                        Manage Batch
                        <ArrowRight className="ml-2 size-4" />
                      </Button>
                    </Link>
                  </div>

                  {/* RIGHT SIDE */}
                  <div className="space-y-6 pl-6 border-l flex flex-col justify-between">
                    {/* Progress */}

                    <div className="rounded-xl bg-muted/40">
                      <div className="mb-3 flex items-center justify-between">
                        <p className="text-sm font-medium">Course Progress</p>

                        <span className="text-sm font-semibold text-primary">
                          {batch.progressPercentage}%
                        </span>
                      </div>

                      <Progress
                        value={batch.progressPercentage}
                        variant="green"
                      />
                    </div>

                    {/* Schedule */}

                    <div className="mt-3">
                      <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                        Weekly Schedule
                      </h4>

                      <div className="space-y-3">
                        {batch.schedule.map((schedule) => (
                          <BatchScheduleItem
                            key={schedule.id}
                            schedule={schedule}
                            textVariant="xs"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default BatchesPage;

function Meta({
  icon: Icon,
  text,
}: {
  icon: React.ElementType;
  text: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="size-4 shrink-0 text-primary/80" />
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}
