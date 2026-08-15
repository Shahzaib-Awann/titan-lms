"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header";
import { RowActions } from "./row-actions";
import { isBefore, isToday } from "date-fns";
import { formatDate, getDaysLeft } from "@/lib/helpers/date-fns";
import { cn, formatUnderscoreLabel } from "@/lib/utils";
import { AssignmentSubmissionStatus } from "@/types/common";

export interface StudentPortalAssignment {
  assignmentId: string;
  title: string;
  instructions: string | null;
  moduleName: string | null;
  lessonName: string | null;
  maxMarks: number;
  assignedAt: Date;
  dueAt: Date;

  assignment_reference_links: {
    id: string;
    title: string;
    url: string;
  }[];

  submission: {
    id: string;
    status: AssignmentSubmissionStatus;
    submissionNote: string | null;
    submittedAt: Date | null;
    marksObtained: number | null;
    teacherFeedback: string | null;
    gradedAt: Date | null;

    submission_reference_links: {
      id: string;
      title: string;
      url: string;
    }[];
  } | null;
}

const getStatusColor = (
  status: AssignmentSubmissionStatus | null | undefined,
) => {
  switch (status) {
    case "submitted":
      return "text-blue-600";

    case "graded":
      return "text-green-600";

    case "late":
      return "text-red-600";

    case "resubmitted":
      return "text-orange-600";

    case "not_submitted":
    default:
      return "text-muted-foreground";
  }
};

export const columns: ColumnDef<StudentPortalAssignment>[] = [
  // Assignment
  {
    accessorKey: "title",

    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Assignment" />
    ),

    cell: ({ row }) => {
      const assignment = row.original;

      return (
        <div className="max-w-[320px]">
          <div className="font-medium">{assignment.title}</div>

          {assignment.instructions && (
            <div className="text-muted-foreground mt-1 line-clamp-1 text-sm">
              {assignment.instructions}
            </div>
          )}
        </div>
      );
    },
  },

  // Module
  {
    accessorKey: "moduleName",

    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Module" />
    ),

    cell: ({ row }) => {
      const assignment = row.original;

      return (
        <div>
          <div className="font-medium">{assignment.moduleName ?? "—"}</div>

          {assignment.lessonName && (
            <div className="text-muted-foreground text-sm">
              {assignment.lessonName}
            </div>
          )}
        </div>
      );
    },
  },

  // Due
  {
    accessorKey: "dueAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Due" />
    ),
    cell: ({ row }) => {
      const assignment = row.original;
      const submissionStatus = assignment.submission?.status ?? "not_submitted";

      const daysLeft =
        submissionStatus === "not_submitted"
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
                dueToday && "text-orange-500",
                isOverdue && "text-red-500",
              )}
            >
              {isOverdue
                ? "Late"
                : dueToday
                  ? "Due today"
                  : `${daysLeft} ${daysLeft === 1 ? "day" : "days"} left`}
            </span>
          )}
        </div>
      );
    },
  },

  // Submission
  {
    id: "submission",

    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Submission" />
    ),

    cell: ({ row }) => {
      const assignment = row.original;
      const submission = assignment.submission;

      const status: AssignmentSubmissionStatus =
        submission?.status ?? "not_submitted";

      return (
        <div>
          <div
            className={`flex items-center capitalize gap-2 font-medium ${getStatusColor(
              status,
            )}`}
          >
            <span className="h-2 w-2 rounded-full bg-current" />

            {formatUnderscoreLabel(status, "not submitted")}
          </div>

          {/* Submitted but not graded */}
          {status === "submitted" && (
            <div className="text-muted-foreground mt-1 text-sm">Not Graded</div>
          )}

          {/* Graded */}
          {status === "graded" && submission?.marksObtained !== null && (
            <div className="text-muted-foreground mt-1 text-sm">
              {submission?.marksObtained} / {assignment.maxMarks}
            </div>
          )}

          {/* Resubmitted */}
          {status === "resubmitted" && (
            <div className="text-muted-foreground mt-1 text-sm">
              Awaiting grading
            </div>
          )}
        </div>
      );
    },
  },

  // Action
  {
    id: "actions",

    header: "Action",

    cell: ({ row }) => {
      const assignment = row.original;

      return <RowActions data={assignment} />;
    },
  },
];
