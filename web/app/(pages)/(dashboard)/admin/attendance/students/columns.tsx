"use client";

import { MoreHorizontal } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";

export interface Attendance {
  id: number;
  student_id: string;
  student_name: string;
  last_marked: string;
  batch: string;
  status: "present" | "absent" | "leave";
}

export const columns: ColumnDef<Attendance>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        label=""
        checked={table.getIsAllPageRowsSelected()}
        onChange={(e) => {
          e.stopPropagation();
          table.toggleAllPageRowsSelected(e.target.checked);
        }}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        label=""
        checked={row.getIsSelected()}
        onChange={(e) => {
          e.stopPropagation();
          row.toggleSelected(e.target.checked);
        }}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },

  {
    accessorKey: "student_id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Student ID" />
    ),
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("student_id")}</div>
    ),
  },

  {
    accessorKey: "student_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Student Name" />
    ),
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("student_name")}</div>
    ),
  },

  {
    accessorKey: "batch",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Batch" />
    ),
  },

  {
    accessorKey: "last_marked",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Last Marked" />
    ),
  },

  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as Attendance["status"];

      return (
        <Badge
          variant="outline"
          className={cn(
            "rounded-lg capitalize",
            status === "present" && "text-green-600",
            status === "absent" && "text-red-600",
            status === "leave" && "text-yellow-600",
          )}
        >
          {status}
        </Badge>
      );
    },
  },

  {
    id: "actions",
    cell: ({ row }) => {
      const student = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="size-4" />
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Actions</DropdownMenuLabel>

              <DropdownMenuItem
                onClick={() =>
                  navigator.clipboard.writeText(student.student_id)
                }
              >
                Copy Student ID
              </DropdownMenuItem>

              <DropdownMenuItem
                render={<Link href={`/students/edit/${student.id}`} />}
              >
                Edit Student
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
