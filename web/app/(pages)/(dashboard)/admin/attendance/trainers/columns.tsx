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

export interface TrainerAttendance {
  id: number;
  trainer_id: string;
  trainer_name: string;
  expertise: string;
  last_marked: string;
  status: "present" | "absent" | "leave";
}

export const columns: ColumnDef<TrainerAttendance>[] = [
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
      />
    ),
  },

  {
    accessorKey: "trainer_id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Trainer ID" />
    ),
  },

  {
    accessorKey: "trainer_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Trainer Name" />
    ),
  },

  {
    accessorKey: "expertise",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Expertise" />
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
      const status = row.getValue("status") as TrainerAttendance["status"];

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
      const trainer = row.original;

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
                  navigator.clipboard.writeText(trainer.trainer_id)
                }
              >
                Copy Trainer ID
              </DropdownMenuItem>

              <DropdownMenuItem
                render={<Link href={`/trainers/edit/${trainer.id}`} />}
              >
                Edit Trainer
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
