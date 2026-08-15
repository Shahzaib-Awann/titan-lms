"use client";

import { ColumnDef } from "@tanstack/react-table";

import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header";
import { RowActions } from "./row-actions";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/helpers/date-fns";

export interface QuizAttempt {
  id: string;
  title: string;
  questionsCount: number;

  is_attempted: boolean;
  attemptId: string | null;

  score: number;

  totalMarks: number;
  percentage: number;

  status: "in_progress" | "submitted" | "cancelled" | "cheated" | "not_started";

  durationMinutes: number;
  publishedDate: Date;

  submittedAt: Date | null;

  canAttempt: boolean;
}

export const columns: ColumnDef<QuizAttempt>[] = [
  {
    id: "select",

    header: ({ table }) => (
      <Checkbox
        label=""
        checked={table.getIsAllPageRowsSelected()}
        onChange={(e) => table.toggleAllPageRowsSelected(e.target.checked)}
        aria-label="Select all"
      />
    ),

    cell: ({ row }) => (
      <Checkbox
        label=""
        checked={row.getIsSelected()}
        onChange={(e) => row.toggleSelected(e.target.checked)}
        aria-label="Select row"
      />
    ),

    enableSorting: false,
    enableHiding: false,
  },

  {
    id: "quiz",

    accessorKey: "title",

    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Quiz" />
    ),

    cell: ({ row }) => {
      const quiz = row.original;

      return (
        <div className="min-w-0 py-1">
          <div className="font-medium truncate">{quiz.title}</div>

          <div className="text-xs text-muted-foreground mt-1">
            Published {formatDate(quiz.publishedDate)}
          </div>
        </div>
      );
    },
  },

  {
    accessorKey: "questionsCount",

    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Questions" />
    ),

    cell: ({ row }) => (
      <div className="font-medium tabular-nums">
        {row.original.questionsCount}
      </div>
    ),
  },

  {
    id: "score",

    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Score" />
    ),

    cell: ({ row }) => {
      const quiz = row.original;

      if (!quiz.is_attempted) {
        return <div className="text-muted-foreground">Not attempted</div>;
      }

      return (
        <div className="font-medium tabular-nums">
          {quiz.score} / {quiz.totalMarks}
        </div>
      );
    },
  },

  {
    accessorKey: "percentage",

    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Percentage" />
    ),

    cell: ({ row }) => {
      const quiz = row.original;

      if (!quiz.is_attempted) {
        return <div className="text-muted-foreground">—</div>;
      }

      return (
        <div className="font-medium tabular-nums">
          {quiz.percentage.toFixed(1)}%
        </div>
      );
    },
  },

  {
    accessorKey: "durationMinutes",

    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Duration" />
    ),

    cell: ({ row }) => {
      const minutes = row.original.durationMinutes;

      if (minutes < 60) {
        return <div className="tabular-nums">{minutes} min</div>;
      }

      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;

      return (
        <div className="tabular-nums">
          {hours}h{remainingMinutes > 0 ? ` ${remainingMinutes}m` : ""}
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

      const statusLabels = {
        in_progress: "In Progress",
        submitted: "Submitted",
        cancelled: "Cancelled",
        cheated: "Cheated",
        not_started: "Not Started",
      };

      return (
        <Badge
          variant="secondary"
          className={cn(
            "rounded-lg",
            status === "in_progress" && "text-yellow-600",
            status === "submitted" && "text-green-600",
            status === "cancelled" && "text-muted-foreground",
            status === "cheated" && "text-red-600",
            status === "not_started" && "text-blue-600",
          )}
        >
          <span className="mr-1.5 size-1.5 rounded-full bg-current" />
          {statusLabels[status]}
        </Badge>
      );
    },
  },

  {
    id: "submittedAt",

    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Submitted" />
    ),

    cell: ({ row }) => {
      const submittedAt = row.original.submittedAt;

      if (!submittedAt) {
        return <div className="text-muted-foreground">—</div>;
      }

      return (
        <div className="tabular-nums text-sm">{formatDate(submittedAt)}</div>
      );
    },
  },
  {
    id: "actions",

    cell: ({ row }) => (
      <RowActions
        id={row.original.id}
        is_attempted={row.original.is_attempted}
        can_attempt={row.original.canAttempt}
        attemptId={row.original.attemptId}
      />
    ),
  },
];
