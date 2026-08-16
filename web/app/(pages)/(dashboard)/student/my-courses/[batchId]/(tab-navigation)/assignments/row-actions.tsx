"use client";

import { useState } from "react";
import { MoreHorizontal } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { StudentPortalAssignment } from "./columns";
import SubmissionFormDialog from "./submission-form-dialog";
import { ViewAssignmentDialog } from "@/components/pages/assignments/view-assignment-dialog";

type Props = {
  data: StudentPortalAssignment;
};

export function RowActions({ data }: Props) {
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [submissionDialogOpen, setSubmissionDialogOpen] = useState(false);

  const handleViewClick = () => {
    setViewDialogOpen(true);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>

          <MoreHorizontal className="size-4" />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>

            <DropdownMenuItem onClick={handleViewClick}>View</DropdownMenuItem>

            {!data?.submission && (
              <DropdownMenuItem onClick={() => setSubmissionDialogOpen(true)}>
                Submit Assignment
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {viewDialogOpen && (
        <ViewAssignmentDialog
          viewDialogOpen={viewDialogOpen}
          setViewDialogOpen={setViewDialogOpen}
          assignment={data}
        />
      )}

      {submissionDialogOpen && (
        <SubmissionFormDialog
          open={submissionDialogOpen}
          onOpenChange={setSubmissionDialogOpen}
          assignment={data}
        />
      )}
    </>
  );
}
