"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Pin } from "lucide-react";
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RowActions } from "./row-actions";

export interface Announcement {
  id: string;
  title: string;
  description: string | null;
  isPublic: boolean;
  audience: "all" | "trainers" | "students";
  isPinned: boolean;
  createdBy: {
    id: string;
    name: string;
    avatarURL: string | null;
  };
  createdAt: Date;
}

export const columns: ColumnDef<Announcement>[] = [
  {
    accessorKey: "isPinned",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Pin" className="max-w-14" />
    ),
    cell: ({ row }) => {
      const announcement = row.original;

      return (
        <div className="mt-1">
          <Pin
            className={`w-4 h-4 ${
              announcement.isPinned
                ? "text-primary/70"
                : "text-muted-foreground/30"
            }`}
          />
        </div>
      );
    },
  },

  {
    accessorKey: "title",
    header: "ANNOUNCEMENT",
    cell: ({ row }) => {
      const announcement = row.original;

      return (
        <div>
          <p className="font-bold text-foreground">{announcement.title}</p>

          <p className="text-sm text-muted-foreground truncate max-w-50">
            {announcement.description ?? "No description"}
          </p>
        </div>
      );
    },
  },

  {
    accessorKey: "isPublic",
    header: "STATUS",
    cell: ({ row }) => {
      const isPublic = row.original.isPublic;

      const status = isPublic ? "public" : "private";

      return (
        <Badge
          variant={isPublic ? "success" : "warning"}
          className="capitalize rounded-full"
        >
          {status}
        </Badge>
      );
    },
  },

  {
    accessorKey: "audience",
    header: "AUDIENCE",
    cell: ({ row }) => {
      const audience = row.original.audience;

      const labels = {
        all: "All Members",
        trainers: "Trainers Only",
        students: "Students Only",
      };

      return (
        <span className="text-sm text-foreground">{labels[audience]}</span>
      );
    },
  },

  {
    accessorKey: "createdBy",
    header: "CREATED BY",
    cell: ({ row }) => {
      const user = row.original.createdBy;

      return (
        <div className="flex items-center gap-2">
          <Avatar className="h-9 w-9">
            <AvatarImage
              src={user.avatarURL ?? undefined}
              alt={user.name ?? "Unknown"}
            />
            <AvatarFallback initial={user.name} />
          </Avatar>

          <span className="text-sm text-foreground">{user.name}</span>
        </div>
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
