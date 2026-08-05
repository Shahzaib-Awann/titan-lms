import Link from "next/link";
import {
  CalendarDays,
  Clock3,
  GraduationCap,
  ArrowRight,
  AlertCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { formatDate, getEntityStatus } from "@/lib/helpers/date-fns";
import { getTrainerBatches } from "@/lib/actions/dashboard.action";
import { TrainerBatchesResponse } from "@/types/dashboards";
import { Badge } from "@/components/ui/badge";
import { BatchScheduleItem } from "../batch-schedule-item";

const BatchesCardsGrid = async () => {
  const batchesResponse: TrainerBatchesResponse = await getTrainerBatches();

  const success = batchesResponse?.success;
  const batches = batchesResponse?.data ?? [];

  return (
    <section className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">My Batches</h3>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage your active teaching batches.
          </p>
        </div>

        <Link
          href="/trainer/batches"
          className="text-sm font-medium text-primary hover:underline"
        >
          View All
        </Link>
      </header>

      {!success && (
        <Alert variant="destructive" className="flex flex-row items-center">
          <AlertCircle className="h-4 w-4" />

          <AlertDescription>
            We couldn&apos;t load your batches. Please try again later.
          </AlertDescription>
        </Alert>
      )}

      {success && batches.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-12 text-center">
          <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-primary/10">
            <GraduationCap className="size-6 text-primary" />
          </div>

          <h3 className="text-lg font-semibold">No Active Batches</h3>

          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            You don&apos;t have any active batches assigned yet.
          </p>
        </div>
      )}

      {success && batches.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {batches.map((batch) => {
            const status = getEntityStatus(batch.startDate, batch.endDate);

            return (
              <Card key={batch.batchId} className="shadow-sm">
                <CardContent className="flex h-full flex-col justify-between">
                  <div>
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <div className="inline-flex uppercase tracking-wider items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                        <GraduationCap className="mr-1 h-3.5 w-3.5" />
                        Course
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

                    <h4 className="text-xl font-semibold">
                      {batch.courseName}
                    </h4>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {batch.batchName}
                    </p>

                    <div className="mt-6 space-y-3">
                      <div className="flex items-center gap-3 text-sm">
                        <CalendarDays className="h-4 w-4 text-primary" />

                        <div className="flex items-center gap-2 text-muted-foreground">
                          <span>{formatDate(batch.startDate)}</span>

                          <ArrowRight className="size-3.5" />

                          <span>{formatDate(batch.endDate)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-sm">
                        <Clock3 className="h-4 w-4 text-primary" />

                        <span className="text-muted-foreground">
                          {batch.duration} weeks
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 rounded-xl bg-muted/40">
                    <h5 className="mb-3 text-sm font-medium">
                      Weekly Schedule
                    </h5>

                    <div className="space-y-3">
                      {batch.schedule.map((sch) => (
                        <BatchScheduleItem
                          key={sch.id}
                          schedule={sch}
                          textVariant="xs"
                        />
                      ))}
                    </div>

                    <Link href={`/trainer/batches/${batch.batchId}`}>
                      <Button
                        className="mt-6 w-full cursor-pointer"
                        variant="glass"
                      >
                        Manage Batch
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
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

export default BatchesCardsGrid;
