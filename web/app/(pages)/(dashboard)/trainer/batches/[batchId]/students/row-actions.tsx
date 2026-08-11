"use client";

import { useState } from "react";
import { ClipboardList, Eye, FileCheck2, MoreHorizontal } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  StudentActionDialog,
  StudentAction,
} from "./_components/student-action-dialog";

type Props = {
  batchId: string;
  student: {
    id: string;
    fullName: string;
    avatarUrl: string | null;
    rollNumber: string;
  };
  enrollment: {
    id: string;
    status: "active" | "completed" | "transferred" | "dropped" | "suspended";
    enrolledAt: string;
  };
};

export function RowActions({ batchId, student, enrollment }: Props) {
  const [open, setOpen] = useState(false);

  const [selectedAction, setSelectedAction] =
    useState<StudentAction>("overview");

  const handleAction = (action: StudentAction) => {
    setSelectedAction(action);
    setOpen(true);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <button
            type="button"
            className="flex size-8 items-center justify-center rounded-md hover:bg-muted"
            aria-label="Open menu"
          >
            <MoreHorizontal className="size-4" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>

            <DropdownMenuItem onClick={() => handleAction("overview")}>
              <Eye className="size-4" />
              <span>View</span>
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => handleAction("assignments")}>
              <ClipboardList className="size-4" />
              <span>Assignments</span>
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => handleAction("submissions")}>
              <FileCheck2 className="size-4" />
              <span>Submissions</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <StudentActionDialog
        open={open}
        onOpenChange={setOpen}
        action={selectedAction}
        batchId={batchId}
        student={student}
        enrollment={enrollment}
      />
    </>
  );
}
