"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header";
import { cn } from "@/lib/utils";
import { RowActions } from "./row-actions";
import { AssignmentStatus } from "@/types/common";
import { formatDate, getDaysLeft } from "@/lib/helpers/date-fns";
import { isBefore, isToday } from "date-fns";
import { Progress } from "@/components/ui/progress";

export interface Assignment {
  id: string;
  title: string;

  status: AssignmentStatus;

  assignedAt: Date;
  dueAt: Date;

  submissions: number;
  enrolledStudents: number;
  graded: number;
}

interface ColumnsProps {
  batchId: string;
}

export const columns = ({ batchId }: ColumnsProps): ColumnDef<Assignment>[] => [
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Assignment" />
    ),
    cell: ({ row }) => {
      const assignment = row.original;

      return (
        <div className="min-w-0">
          <div className="font-medium truncate">{assignment.title}</div>
        </div>
      );
    },
  },

  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.original.status;

      return (
        <Badge
          variant="secondary"
          className={cn(
            "rounded-lg capitalize",
            status === "published" && "text-green-600",
            status === "draft" && "text-muted-foreground",
            status === "closed" && "text-red-400",
          )}
        >
          {status}
        </Badge>
      );
    },
  },

  {
    accessorKey: "assignedAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Assigned" />
    ),
    cell: ({ row }) => (
      <span className="text-sm">{formatDate(row.original.assignedAt)}</span>
    ),
  },

  {
    accessorKey: "dueAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Due" />
    ),
    cell: ({ row }) => {
      const assignment = row.original;

      const daysLeft =
        assignment.status === "published"
          ? getDaysLeft(assignment.dueAt)
          : null;

      const dueDate = new Date(assignment.dueAt);

      const isOverdue = isBefore(dueDate, new Date()) && !isToday(dueDate);
      const dueToday = isToday(dueDate);
      const isFuture = !isOverdue && !dueToday;

      return (
        <div className="flex flex-col">
          <span className="text-sm">{formatDate(assignment.dueAt)}</span>

          {daysLeft !== null && (
            <span
              className={cn(
                "text-xs font-medium",
                isFuture && "text-green-500",
                dueToday && "text-orange-400",
                isOverdue && "text-red-500",
              )}
            >
              {isOverdue
                ? "Overdue"
                : dueToday
                  ? "Due today"
                  : `${daysLeft} ${daysLeft === 1 ? "day" : "days"} left`}
            </span>
          )}
        </div>
      );
    },
  },

  {
    id: "submissions",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Submissions" />
    ),
    cell: ({ row }) => {
      const assignment = row.original;

      if (
        assignment.submissions === null ||
        assignment.enrolledStudents === null
      ) {
        return <span className="text-muted-foreground">—</span>;
      }

      const percentage =
        assignment.enrolledStudents > 0
          ? Math.round(
              (assignment.submissions / assignment.enrolledStudents) * 100,
            )
          : 0;

      return (
        <div className="flex flex-col max-w-35">
          <span className="text-xs font-medium mb-1 text-right text-muted-foreground">
            {assignment.submissions} / {assignment.enrolledStudents}
          </span>

          <Progress value={percentage} variant="green" />
        </div>
      );
    },
  },

  {
    id: "graded",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Graded" />
    ),
    cell: ({ row }) => {
      const assignment = row.original;

      if (assignment.graded === null || assignment.submissions === null) {
        return <span className="text-muted-foreground">—</span>;
      }

      // No one has submitted yet.
      if (assignment.submissions === 0) {
        return (
          <div className="flex flex-col">
            <span className="text-sm font-medium">0 / 0</span>

            <span className="text-muted-foreground text-xs">
              No submissions
            </span>
          </div>
        );
      }

      const remaining = Math.max(assignment.submissions - assignment.graded, 0);

      return (
        <div className="flex flex-col">
          <span className="text-sm font-medium">
            {assignment.graded} / {assignment.submissions}
          </span>

          <span
            className={cn(
              "text-xs",
              remaining > 0 ? "text-muted-foreground" : "text-green-600",
            )}
          >
            {remaining > 0 ? `${remaining} left` : "All Graded"}
          </span>
        </div>
      );
    },
  },

  {
    id: "actions",
    header: () => <div className="text-right pr-4">Actions</div>,
    cell: ({ row }) => <RowActions id={row.original.id} batchId={batchId} />,
    enableSorting: false,
    enableHiding: false,
  },
];
