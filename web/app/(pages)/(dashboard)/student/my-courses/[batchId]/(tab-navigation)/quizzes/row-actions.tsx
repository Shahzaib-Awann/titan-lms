"use client";
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

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
  is_attempted: boolean;
  can_attempt: boolean;
  attemptId: string | null;
};

export function RowActions({
  id,
  is_attempted,
  can_attempt,
  attemptId,
}: Props) {
  const { batchId } = useParams();

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

            {can_attempt && (
              <Link
                href={`/student/my-courses/${batchId}/quizzes/attempt/${id}`}
              >
                <DropdownMenuItem>Attempt</DropdownMenuItem>
              </Link>
            )}

            {is_attempted && attemptId && (
              <Link
                href={`/student/my-courses/${batchId}/quizzes/result/${attemptId}`}
              >
                <DropdownMenuItem>View Result</DropdownMenuItem>
              </Link>
            )}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
