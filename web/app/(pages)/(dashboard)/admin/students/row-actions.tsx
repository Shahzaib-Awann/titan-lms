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
import { deleteStudent } from "@/lib/actions/admin/student.action";

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

            <Link href={`/admin/students/edit/${id}`}>
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
          title="Delete Student?"
          description="This will remove the student from the active records."
          confirmText="Delete"
          successMessage="Student deleted successfully."
          onConfirm={() => deleteStudent(id)}
          onSuccess={() => {
            router.refresh();
          }}
        />
      )}
    </>
  );
}
