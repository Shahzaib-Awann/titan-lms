"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { RowActions } from "./row-actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export interface Admin {
  id: string;
  cnic: string;
  fullName: string;
  phone: string;

  avatarId: string | null;
  avatarUrl: string | null;

  role: "admin" | "trainer" | "student";
  status: "active" | "inactive" | "suspended";

  createdAt: Date;
}

export const columns: ColumnDef<Admin>[] = [
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
      const admin = row.original;

      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage
              src={admin.avatarUrl ?? undefined}
              alt={admin.fullName}
            />
            <AvatarFallback initial={admin.fullName} />
          </Avatar>

          <div className="font-medium">{admin.fullName}</div>
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
    accessorKey: "phone",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Phone" />
    ),
  },

  {
    accessorKey: "role",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Role" />
    ),
    cell: ({ row }) => (
      <span className="capitalize">{row.getValue("role")}</span>
    ),
  },

  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as Admin["status"];

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
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created" />
    ),
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as Date;

      return new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
      }).format(new Date(date));
    },
  },

  {
    id: "actions",
    cell: ({ row }) => {
      return <RowActions id={row.original.id} />;
    },
  },
];
