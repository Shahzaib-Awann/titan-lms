"use client";

import { useState } from "react";
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { deleteAssignment } from "@/lib/actions/assignment.action";

type Props = {
  id: string;
  batchId: string;
};

export function RowActions({ id, batchId }: Props) {
  const router = useRouter();

  const [openDelete, setOpenDelete] = useState(false);

  const handleDeleteClick = () => {
    setOpenDelete(true);
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

            <Link
              href={`/trainer/batches/${batchId}/assignments/${id}/submissions`}
            >
              <DropdownMenuItem>Submissions</DropdownMenuItem>
            </Link>

            <Link href={`/trainer/batches/${batchId}/assignments/edit/${id}`}>
              <DropdownMenuItem>Edit</DropdownMenuItem>
            </Link>

            <DropdownMenuItem variant="destructive" onClick={handleDeleteClick}>
              Delete
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {openDelete && (
        <ConfirmDialog
          open={openDelete}
          onOpenChange={setOpenDelete}
          title="Delete Assignment?"
          description="This will remove the assignment from the active records."
          confirmText="Delete"
          successMessage="Assignment deleted successfully."
          onConfirm={() => deleteAssignment(id, batchId)}
          onSuccess={() => {
            router.refresh();
          }}
        />
      )}
    </>
  );
}
