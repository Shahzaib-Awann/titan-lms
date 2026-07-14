"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pin, Pencil, Trash2 } from "lucide-react";

export interface Announcement {
  id: string;
  title: string;
  description: string;
  status: "public" | "private";
  audience: string;
  pinned: boolean;
}

export const columns: ColumnDef<Announcement>[] = [
  {
    accessorKey: "title",
    header: "ANNOUNCEMENT",
    cell: ({ row }) => {
      const announcement = row.original;
      return (
        <div className="flex items-start gap-3">
          <div className="mt-1">
            <Pin
              className={`w-4 h-4 ${announcement.pinned ? "text-primary/70" : "text-muted-foreground/30"}`}
            />
          </div>
          <div>
            <p className="font-bold text-foreground">{announcement.title}</p>
            <p className="text-sm text-muted-foreground truncate max-w-37.5 sm:max-w-50">
              {announcement.description}
            </p>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "STATUS",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;

      let variant: "success" | "warning" | "difficulty" | "destructive" =
        "difficulty";

      if (status === "public") variant = "success";
      if (status === "private") variant = "warning";

      return (
        <Badge variant={variant} className="capitalize rounded-full">
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "audience",
    header: "AUDIENCE",
    cell: ({ row }) => (
      <span className="text-sm text-foreground">
        {row.getValue("audience")}
      </span>
    ),
  },
  {
    id: "actions",
    header: "ACTIONS",
    cell: () => {
      return (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];
