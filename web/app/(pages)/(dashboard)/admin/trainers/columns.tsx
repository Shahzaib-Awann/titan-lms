"use client";

import { Checkbox } from "@/components/ui/checkbox";

import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { RowActions } from "./row-actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export interface Trainer {
  id: string;
  trainerId: string;
  avatarId: string | null;
  avatarUrl: string | null;

  fullName: string;

  employeeCode: string;
  specialization: string | null;
  hourlyRate: number | null;

  status: "active" | "inactive" | "suspended";

  joinedAt: Date | null;
}

export const columns: ColumnDef<Trainer>[] = [
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
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => {
      const trainer = row.original;

      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage
              src={trainer.avatarUrl ?? undefined}
              alt={trainer.fullName}
            />
            <AvatarFallback initial={trainer.fullName} />
          </Avatar>

          <div className="font-medium">{trainer.fullName}</div>
        </div>
      );
    },
  },

  {
    accessorKey: "employeeCode",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Employee Code" />
    ),
  },

  {
    accessorKey: "specialization",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Specialization" />
    ),

    cell: ({ row }) => <div>{row.getValue("specialization") || "N/A"}</div>,
  },

  {
    accessorKey: "hourlyRate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Hourly Rate" />
    ),

    cell: ({ row }) => {
      const rate = row.getValue("hourlyRate") as number | null;

      return <div>{rate ? `${rate} PKR` : "N/A"}</div>;
    },
  },

  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),

    cell: ({ row }) => {
      const status = row.getValue("status") as Trainer["status"];

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
    accessorKey: "joinedAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Joined" />
    ),

    cell: ({ row }) => {
      const date = row.getValue("joinedAt") as Date | null;

      return date
        ? new Intl.DateTimeFormat("en-US", {
            dateStyle: "medium",
          }).format(new Date(date))
        : "N/A";
    },
  },

  {
    id: "actions",

    cell: ({ row }) => {
      const trainer = row.original;

      return <RowActions id={trainer.id} />;
    },
  },
];
