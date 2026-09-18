"use client";

import { MoreHorizontal } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";

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
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/helpers/date-fns";

export interface Attendance {
  id: string;
  studentRollNo: string;
  studentName: string;
  attendanceDate: string;
  lastMarked: string;
  courseName: string;
  batchName: string;
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
    accessorKey: "studentRollNo",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Student ID" />
    ),
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("studentRollNo")}</div>
    ),
  },

  {
    accessorKey: "studentName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Student Name" />
    ),
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("studentName")}</div>
    ),
  },

  {
    accessorKey: "courseName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Course" />
    ),
  },

  {
    accessorKey: "batchName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Batch" />
    ),
  },

  {
    accessorKey: "attendanceDate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Attendance Date" />
    ),
    cell: ({ row }) => {
      const attendanceDate = row.getValue("attendanceDate") as string;

      return <div>{formatDate(attendanceDate)}</div>;
    },
  },

  {
    accessorKey: "lastMarked",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Last Marked" />
    ),
    cell: ({ row }) => {
      const lastMarked = row.getValue("lastMarked") as string;

      return (
        <div className="flex items-center justify-center flex-col">
          <span>{formatDate(lastMarked)}</span>
          <span className="opacity-75">
            {new Date(lastMarked).toLocaleTimeString("en-US", {
              timeZone: "UTC",
              hour: "numeric",
              minute: "2-digit",
            })}
          </span>
        </div>
      );
    },
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
                  navigator.clipboard.writeText(student.studentRollNo)
                }
              >
                Copy Student Roll No
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
