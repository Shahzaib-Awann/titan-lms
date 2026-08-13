"use client";

import { ColumnDef } from "@tanstack/react-table";
import {
  CheckCircle2,
  Clock3,
  FileCheck2,
  RotateCcw,
  Send,
  XCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/helpers/date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AssignmentSubmissionStatus } from "@/types/common";
import { RowActions } from "./row-actions";

export interface TrainerAssignmentSubmission {
  student: {
    id: string;
    fullName: string;
    AvatarUrl: string | null;
    rollNumber: string;
  };

  submissionId: string;
  submissionStatus: AssignmentSubmissionStatus;
  submittedAt: Date | null;
  marksObtained: number | null;
  maxMarks: number;
}

const statusConfig: Record<
  AssignmentSubmissionStatus,
  {
    label: string;
    icon: typeof CheckCircle2;
    className: string;
  }
> = {
  not_submitted: {
    label: "Not Submitted",
    icon: XCircle,
    className: "text-muted-foreground",
  },
  submitted: {
    label: "Submitted",
    icon: Send,
    className: "text-blue-500",
  },
  late: {
    label: "Late",
    icon: Clock3,
    className: "text-orange-500",
  },
  graded: {
    label: "Graded",
    icon: CheckCircle2,
    className: "text-green-600",
  },
  resubmitted: {
    label: "Resubmitted",
    icon: RotateCcw,
    className: "text-purple-500",
  },
};

export const columns: ColumnDef<TrainerAssignmentSubmission>[] = [
  {
    accessorKey: "student.fullName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Student" />
    ),
    cell: ({ row }) => {
      const { fullName, AvatarUrl } = row.original.student;

      return (
        <div className="flex min-w-0 items-center gap-3">
          <Avatar>
            <AvatarImage src={AvatarUrl ?? undefined} alt={fullName} />
            <AvatarFallback initial={fullName} />
          </Avatar>

          <span className="truncate font-medium">{fullName}</span>
        </div>
      );
    },
  },

  {
    accessorKey: "student.rollNumber",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Roll Number" />
    ),
    cell: ({ row }) => (
      <span className="text-sm">{row.original.student.rollNumber}</span>
    ),
  },

  {
    accessorKey: "submissionStatus",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.original.submissionStatus;
      const config = statusConfig[status];
      const Icon = config.icon;

      return (
        <Badge
          variant="secondary"
          className={cn("gap-1.5 rounded-lg", config.className)}
        >
          <Icon className="size-3.5" />
          {config.label}
        </Badge>
      );
    },
  },

  {
    accessorKey: "submittedAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Submitted At" />
    ),
    cell: ({ row }) => {
      const submittedAt = row.original.submittedAt;

      return submittedAt ? (
        <span className="text-sm">{formatDate(submittedAt)}</span>
      ) : (
        <span className="text-sm text-muted-foreground">—</span>
      );
    },
  },

  {
    id: "marks",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Marks" />
    ),
    cell: ({ row }) => {
      const { marksObtained, maxMarks, submissionStatus } = row.original;

      if (submissionStatus === "not_submitted") {
        return <span className="text-sm text-muted-foreground">—</span>;
      }

      if (marksObtained === null) {
        return (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <FileCheck2 className="size-4" />
            Not graded
          </div>
        );
      }

      return (
        <span className="text-sm font-medium">
          {marksObtained}{" "}
          <span className="font-normal text-muted-foreground">
            / {maxMarks}
          </span>
        </span>
      );
    },
  },

  {
    id: "actions",
    header: () => <div className="text-right pr-4">Actions</div>,
    cell: ({ row }) => (
      <RowActions
        id={row.original.submissionId}
        marksObtained={row.original.marksObtained}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
];
