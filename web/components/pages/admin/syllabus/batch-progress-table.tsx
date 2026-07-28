import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@/components/ui/progress";
import { Calendar, Users } from "lucide-react";
import { SyllabusBatchProgress } from "@/types/syllabus";

interface BatchProgressTableProps {
  batches: SyllabusBatchProgress[];
}

export function BatchProgressTable({ batches }: BatchProgressTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="border-border hover:bg-transparent">
          <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Batch
          </TableHead>

          <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Trainer
          </TableHead>

          <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Start Date
          </TableHead>

          <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Students
          </TableHead>

          <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Progress
          </TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {batches.map((batch) => (
          <TableRow
            key={batch.id}
            className="transition-colors duration-200 hover:bg-accent/40"
          >
            <TableCell className="py-5">
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">
                  {batch.name}
                </p>
              </div>
            </TableCell>

            <TableCell className="text-foreground">{batch.trainer}</TableCell>

            <TableCell>
              <MetaItem icon={Calendar} value={batch.startDate} />
            </TableCell>

            <TableCell>
              <MetaItem icon={Users} value={`${batch.studentCount} Students`} />
            </TableCell>

            <TableCell className="w-72">
              <Progress
                value={batch.progressPercentage}
                variant="green"
                className="w-full"
              >
                <div className="mb-2 flex items-center justify-between">
                  <ProgressLabel className="text-xs text-muted-foreground">
                    Completion
                  </ProgressLabel>

                  <ProgressValue className="ml-0 text-xs font-semibold text-primary" />
                </div>
              </Progress>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function MetaItem({
  icon: Icon,
  value,
}: {
  icon: React.ElementType;
  value: string | number;
}) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Icon className="size-4 shrink-0 text-primary/80" />
      <span>{value}</span>
    </div>
  );
}
