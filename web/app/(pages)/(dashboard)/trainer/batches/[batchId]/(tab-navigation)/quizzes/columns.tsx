"use client";

import { ColumnDef } from "@tanstack/react-table";

import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header";
import { RowActions } from "./row-actions";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export interface Quiz {
  id: string;
  title: string;
  description: string | null;

  creationMethod: "manual" | "ai";
  durationMinutes: number;
  totalMarks: number;
  status: "draft" | "published" | "closed" | "archived";

  publishedDate: Date | null;
  createdAt: Date;

  questionCount: number;
}

export const columns: ColumnDef<Quiz>[] = [
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

          {quiz.description && (
            <div className="text-sm text-muted-foreground truncate max-w-100">
              {quiz.description}
            </div>
          )}

          <div className="text-xs text-muted-foreground mt-1">
            Created {quiz.creationMethod === "ai" ? "by AI" : "manually"} ·{" "}
            {format(quiz.createdAt, "MMM dd, yyyy")}
          </div>
        </div>
      );
    },
  },

  {
    accessorKey: "questionCount",

    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Questions" />
    ),

    cell: ({ row }) => (
      <div className="font-medium tabular-nums">
        {row.original.questionCount}
      </div>
    ),
  },

  {
    accessorKey: "totalMarks",

    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Marks" />
    ),

    cell: ({ row }) => (
      <div className="font-medium tabular-nums">{row.original.totalMarks}</div>
    ),
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

      return (
        <Badge
          variant="secondary"
          className={cn(
            "rounded-lg capitalize",
            status === "published" && "text-green-600",
            status === "draft" && "text-yellow-600",
            status === "closed" && "text-red-600",
            status === "archived" && "text-muted-foreground",
          )}
        >
          <span className={cn("mr-1.5 size-1.5 rounded-full bg-current")} />
          {status}
        </Badge>
      );
    },
  },

  {
    id: "actions",

    cell: ({ row }) => <RowActions id={row.original.id} />,
  },
];
