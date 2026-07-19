"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header";

export interface Course {
  id: string;
  title: string;
  instructor: string;
  students: number;
  lessons: number;
  status: "published" | "draft" | "archived";
  createdAt: string;
}

export const columns: ColumnDef<Course>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        label=""
        checked={table.getIsAllPageRowsSelected()}
        onChange={(e) => table.toggleAllPageRowsSelected(e.target.checked)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        label=""
        checked={row.getIsSelected()}
        onChange={(e) => row.toggleSelected(e.target.checked)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },

  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Course" />
    ),
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("title")}</div>
    ),
  },

  {
    accessorKey: "instructor",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Instructor" />
    ),
  },

  {
    accessorKey: "students",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Students" />
    ),
    cell: ({ row }) => (
      <div className="text-center">{row.getValue("students")}</div>
    ),
  },

  {
    accessorKey: "lessons",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Lessons" />
    ),
    cell: ({ row }) => (
      <div className="text-center">{row.getValue("lessons")}</div>
    ),
  },

  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as Course["status"];

      return (
        <span
          className={
            status === "published"
              ? "text-green-600"
              : status === "draft"
                ? "text-yellow-600"
                : "text-muted-foreground"
          }
        >
          {status}
        </span>
      );
    },
  },

  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created" />
    ),
    cell: ({ row }) =>
      new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
      }).format(new Date(row.getValue("createdAt"))),
  },

  {
    id: "actions",
    cell: ({ row }) => {
      const course = row.original;

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
                onClick={() => navigator.clipboard.writeText(course.id)}
              >
                Copy course ID
              </DropdownMenuItem>

              <DropdownMenuItem>View course</DropdownMenuItem>

              <DropdownMenuItem>Edit course</DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuItem className="text-destructive">
              Delete course
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
