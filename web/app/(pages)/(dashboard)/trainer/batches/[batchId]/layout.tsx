import TrainerTabNavigation from "@/components/pages/trainer/tab-navigation";
import { Badge } from "@/components/ui/badge";
import { notFound } from "next/navigation";
import { getTrainerBatchSummeryForLayout } from "@/lib/actions/batch.action";
import { getEntityStatus } from "@/lib/helpers/date-fns";

export default async function BatchesLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ batchId: string }>;
}) {
  const { batchId } = await params;

  const response = await getTrainerBatchSummeryForLayout(batchId);

  if (!response.success) {
    notFound();
  }

  const batch = response.data;

  if (!batch) {
    notFound();
  }

  const status = getEntityStatus(batch.startDate, batch.endDate);

  return (
    <>
      <header className="my-2 flex items-end justify-between">
        <section className="space-y-1">
          <div className="flex items-center gap-2">
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

            <span className="text-sm text-muted-foreground">
              Batch ID: {batch.batchId}
            </span>
          </div>

          <h1 className="text-lg font-semibold tracking-wide">
            {batch.batchName}
          </h1>

          <p className="text-muted-foreground">{batch.courseName}</p>
        </section>

        <section className="space-y-1 text-right">
          <h2 className="text-sm uppercase tracking-wider font-medium">
            Schedule
          </h2>

          <p className="font-medium capitalize text-muted-foreground">
            {batch.schedule.length > 0
              ? batch.schedule.join(", ")
              : "No schedule assigned"}
          </p>
        </section>
      </header>

      <TrainerTabNavigation batchId={batchId} />

      <main className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</main>
    </>
  );
}
