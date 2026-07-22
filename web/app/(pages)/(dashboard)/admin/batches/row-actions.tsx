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
import { deleteCourseBatch } from "@/lib/actions/admin/batch.action";

type Props = {
  id: string;
};

export function RowActions({ id }: Props) {
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

            <Link href={`/admin/batches/edit/${id}`}>
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
          title="Delete Batch?"
          description="This will remove the batch from the active records."
          confirmText="Delete"
          successMessage="Batch deleted successfully."
          onConfirm={() => deleteCourseBatch(id)}
          onSuccess={() => {
            router.refresh();
          }}
        />
      )}
    </>
  );
}
