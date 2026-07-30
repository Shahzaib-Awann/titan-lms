"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header";
import { cn } from "@/lib/utils";
import { EnrollmentStatus } from "@/types/common";

export interface StudentEnrollment {
  id: string;

  enrollment: {
    date: Date;
    status: EnrollmentStatus;
  };

  student: {
    id: string;
    name: string;
    rollNumber: string;
    avatarUrl: string | null;
  };

  course: {
    id: string;
    name: string;
  };

  batch: {
    id: string;
    name: string;
  };

  trainer: {
    name: string;
  };
}

export const columns: ColumnDef<StudentEnrollment>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        label=""
        checked={table.getIsAllPageRowsSelected()}
        onChange={(event) =>
          table.toggleAllPageRowsSelected(event.target.checked)
        }
        aria-label="Select all rows"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        label=""
        checked={row.getIsSelected()}
        onChange={(event) => row.toggleSelected(event.target.checked)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },

  {
    accessorKey: "student.name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Student" />
    ),
    cell: ({ row }) => {
      const { name, avatarUrl } = row.original.student;

      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={avatarUrl ?? undefined} alt={name} />
            <AvatarFallback initial={name} />
          </Avatar>

          <div className="flex flex-col">
            <span className="font-medium">{name}</span>
            <span className="text-xs text-muted-foreground">
              {row.original.student.rollNumber}
            </span>
          </div>
        </div>
      );
    },
  },

  {
    accessorKey: "course.name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Course" />
    ),
    cell: ({ row }) => (
      <span className="font-medium">{row.original.course.name}</span>
    ),
  },

  {
    accessorKey: "batch.name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Batch" />
    ),
    cell: ({ row }) => <span>{row.original.batch.name}</span>,
  },

  {
    accessorKey: "trainer.name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Trainer" />
    ),
    cell: ({ row }) => <span>{row.original.trainer.name}</span>,
  },

  {
    accessorKey: "enrollment.date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Enrollment Date" />
    ),
    cell: ({ row }) =>
      new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
      }).format(new Date(row.original.enrollment.date)),
  },

  {
    accessorKey: "enrollment.status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.original.enrollment.status;

      return (
        <Badge
          variant="secondary"
          className={cn(
            status === "active"
              ? "text-green-600"
              : status === "completed"
                ? "text-blue-600"
                : status === "dropped"
                  ? "text-red-600"
                  : status === "suspended"
                    ? "text-orange-600"
                    : "text-muted-foreground",
            "rounded-lg capitalize",
          )}
        >
          {status}
        </Badge>
      );
    },
  },
];
