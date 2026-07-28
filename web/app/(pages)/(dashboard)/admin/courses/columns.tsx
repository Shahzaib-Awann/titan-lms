"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";

import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header";
import { RowActions } from "./row-actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export interface Course {
  id: string;
  title: string;
  durationWeeks: number | null;
  feeAmount: string | null;
  createdAt: Date;
  batches: number;
  createdBy: {
    id: string | null;
    name: string | null;
    avatarUrl: string | null;
  };
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
    cell: ({ row }) => <div className="font-medium">{row.original.title}</div>,
  },

  {
    accessorKey: "createdBy",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created By" />
    ),
    cell: ({ row }) => {
      const creator = row.original.createdBy;

      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage
              src={creator.avatarUrl ?? undefined}
              alt={creator.name ?? "Unknown"}
            />
            <AvatarFallback initial={creator.name} />
          </Avatar>

          <div className="text-sm">{creator.name ?? "Unknown"}</div>
        </div>
      );
    },
  },

  {
    accessorKey: "batches",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Batches" />
    ),
    cell: ({ row }) => (
      <div className="text-center">{row.original.batches}</div>
    ),
  },

  {
    accessorKey: "durationWeeks",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Duration" />
    ),
    cell: ({ row }) => {
      const duration = row.original.durationWeeks;

      return (
        <div className="text-center">
          {duration ? `${duration} weeks` : "—"}
        </div>
      );
    },
  },

  {
    accessorKey: "feeAmount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fee" />
    ),
    cell: ({ row }) => {
      const amount = row.original.feeAmount;

      if (!amount) {
        return <span className="text-muted-foreground">—</span>;
      }

      return (
        <div>
          {new Intl.NumberFormat("en-PK", {
            style: "currency",
            currency: "PKR",
            maximumFractionDigits: 0,
          }).format(Number(amount))}
        </div>
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
      }).format(row.original.createdAt),
  },

  {
    id: "actions",
    cell: ({ row }) => {
      return <RowActions id={row.original.id} />;
    },
  },
];
