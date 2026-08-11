"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EnrollmentStatus } from "@/types/common";
import { RowActions } from "./row-actions";

export interface TrainerBatchStudentRow {
  student: {
    id: string;
    userId: string;
    fullName: string;
    avatarUrl: string | null;
    rollNumber: string;
  };

  enrollment: {
    id: string;
    status: EnrollmentStatus;
    enrolledAt: string;
  };

  assignments: {
    total: number;
    submitted: number;
    graded: number;
    late: number;
    pending: number;
  };
}

export const columns = ({
  batchId,
}: {
  batchId: string;
}): ColumnDef<TrainerBatchStudentRow>[] => [
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
    id: "rollNumber",
    accessorFn: (row) => row.student.rollNumber,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Roll No." />
    ),
    cell: ({ row }) => (
      <div className="font-medium">{row.original.student.rollNumber}</div>
    ),
  },

  {
    id: "student",
    accessorFn: (row) => row.student.fullName,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Student" />
    ),
    cell: ({ row }) => {
      const student = row.original.student;

      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage
              src={student.avatarUrl ?? undefined}
              alt={student.fullName}
            />
            <AvatarFallback initial={student.fullName} />
          </Avatar>

          <div className="font-medium">{student.fullName}</div>
        </div>
      );
    },
  },

  {
    id: "status",
    accessorFn: (row) => row.enrollment.status,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.original.enrollment.status as EnrollmentStatus;

      return (
        <Badge
          variant="secondary"
          className={cn(
            "rounded-lg capitalize",
            status === "active" && "text-green-600",
            status === "completed" && "text-blue-600",
            status === "transferred" && "text-purple-600",
            status === "dropped" && "text-orange-600",
            status === "suspended" && "text-red-600",
          )}
        >
          {status}
        </Badge>
      );
    },
  },

  {
    id: "assignments",
    accessorFn: (row) => row.assignments.submitted,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Assignments" />
    ),
    cell: ({ row }) => {
      const { total, submitted } = row.original.assignments;

      return (
        <div className="font-medium">
          {submitted} / {total}
        </div>
      );
    },
  },

  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <RowActions
          batchId={batchId}
          student={row.original.student}
          enrollment={row.original.enrollment}
        />
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
];
