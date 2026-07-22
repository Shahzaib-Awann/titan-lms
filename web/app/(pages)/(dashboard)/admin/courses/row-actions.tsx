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
import { deleteCourse } from "@/lib/actions/admin/course.action";

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

            <Link href={`/admin/courses/edit/${id}`}>
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
          title="Delete Course?"
          description="This will remove the course from the active records."
          confirmText="Delete"
          successMessage="Course deleted successfully."
          onConfirm={() => deleteCourse(id)}
          onSuccess={() => {
            router.refresh();
          }}
        />
      )}
    </>
  );
}
