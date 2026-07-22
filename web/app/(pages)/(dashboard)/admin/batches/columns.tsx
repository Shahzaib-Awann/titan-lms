"use client";

import { ColumnDef } from "@tanstack/react-table";

import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header";
import { RowActions } from "./row-actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BatchStatus, WeekDays } from "@/types/common";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format, parse } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

export interface CourseBatchSchedule {
  id: string;

  batchName: string;
  courseName: string;
  trainer: {
    name: string;
    avatar: string;
  };

  dateRange: {
    startDate: Date;
    endDate: Date | null;
  };

  schedules: {
    weekday: WeekDays;

    startTime: string;
    endTime: string;
    room: string;
  }[];

  status: BatchStatus;
}

export const columns: ColumnDef<CourseBatchSchedule>[] = [
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
    accessorKey: "batchName",

    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Batch" />
    ),

    cell: ({ row }) => (
      <div className="font-medium">{row.original.batchName}</div>
    ),
  },

  {
    accessorKey: "courseName",

    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Course" />
    ),

    cell: ({ row }) => <div>{row.original.courseName}</div>,
  },

  {
    accessorKey: "trainerName",

    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Trainer" />
    ),

    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <Avatar className="h-9 w-9">
          <AvatarImage
            src={row.original.trainer.avatar ?? undefined}
            alt={row.original.trainer.name}
          />
          <AvatarFallback initial={row.original.trainer.name} />
        </Avatar>

        <div className="font-medium">{row.original.trainer.name}</div>
      </div>
    ),
  },

  {
    id: "dateRange",

    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Duration" />
    ),

    cell: ({ row }) => {
      const { startDate, endDate } = row.original.dateRange;

      return (
        <div className="text-sm">
          <div>{startDate.toDateString()}</div>

          <div className="text-muted-foreground">
            {endDate?.toDateString() || "Ongoing"}
          </div>
        </div>
      );
    },
  },

  {
    id: "schedules",

    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Schedule" />
    ),

    cell: ({ row }) => {
      const schedules = row.original.schedules;

      const formatTime = (time: string) =>
        format(parse(time, "HH:mm:ss", new Date()), "h:mm a");

      if (!schedules.length) {
        return (
          <span className="text-muted-foreground text-sm">No schedule</span>
        );
      }

      return (
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                type="button"
                variant="ghost"
                className="h-8 px-2 text-sm font-normal hover:underline"
              />
            }
          >
            {schedules.length}{" "}
            {schedules.length === 1 ? "schedule" : "schedules"}
          </TooltipTrigger>

          <TooltipContent className="p-0">
            <div className="min-w-55 overflow-hidden rounded-md bg-background text-foreground shadow-md">
              <div className="border-b bg-muted px-3 py-2 font-medium">
                Class Schedule
              </div>

              <div className="divide-y">
                {schedules.map((schedule, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-2 gap-4 px-3 py-2 text-sm"
                  >
                    <div className="font-medium capitalize">
                      {schedule.weekday}
                    </div>

                    <div className="text-muted-foreground">
                      {formatTime(schedule.startTime)} -{" "}
                      {formatTime(schedule.endTime)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      );
    },
  },

  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as BatchStatus;

      return (
        <Badge
          variant="secondary"
          className={cn(
            status === "upcoming"
              ? "text-blue-600"
              : status === "running"
                ? "text-green-600"
                : "text-muted-foreground",
            "rounded-lg capitalize",
          )}
        >
          {status}
        </Badge>
      );
    },
  },

  {
    id: "actions",

    cell: ({ row }) => <RowActions id={row.original.id} />,
  },
];
