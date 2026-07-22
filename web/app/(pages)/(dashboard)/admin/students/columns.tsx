"use client";

import { ColumnDef } from "@tanstack/react-table";

import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header";
import { RowActions } from "./row-actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { UserStatus } from "@/types/common";

export interface Student {
  id: string;
  studentId: string;

  avatarId: string | null;
  avatarUrl: string | null;

  rollNumber: string;
  fullName: string;
  cnic: string;
  guardian: string | null;

  admissionDate: string | Date | null;

  status: UserStatus;
}

export const columns: ColumnDef<Student>[] = [
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
    accessorKey: "fullName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Student" />
    ),
    cell: ({ row }) => {
      const student = row.original;

      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage
              src={student.avatarUrl ?? undefined}
              alt={student.fullName}
            />
            <AvatarFallback initial={student.fullName} />
          </Avatar>

          <div>
            <div className="font-medium">{student.fullName}</div>
            <div className="text-xs text-muted-foreground">
              {student.rollNumber}
            </div>
          </div>
        </div>
      );
    },
  },

  {
    accessorKey: "cnic",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="CNIC" />
    ),
  },

  {
    accessorKey: "guardian",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Guardian" />
    ),
    cell: ({ row }) => row.getValue("guardian") || "-",
  },

  {
    accessorKey: "admissionDate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Admission Date" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("admissionDate");

      if (!value) return "-";

      return new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
      }).format(new Date(value as string));
    },
  },

  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as UserStatus;

      return (
        <Badge
          variant="secondary"
          className={cn(
            status === "active"
              ? "text-green-600"
              : status === "suspended"
                ? "text-red-600"
                : "text-muted-foreground",
            "rounded-lg",
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
      return <RowActions id={row.original.id} />;
    },
  },
];
