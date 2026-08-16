"use client";

import { MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Props = {
  id: string;
  marksObtained: number | null;
};

export function RowActions({ id, marksObtained }: Props) {
  const pathname = usePathname();

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

            <Link href={`${pathname}/${id}`}>
              <DropdownMenuItem>View Submission</DropdownMenuItem>
            </Link>

            <Link href={`${pathname}/edit/${id}`}>
              <DropdownMenuItem>
                {marksObtained ? "Edit Grade" : "Grade Now"}
              </DropdownMenuItem>
            </Link>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
