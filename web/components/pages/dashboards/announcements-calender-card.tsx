"use client";

import React, { useCallback, useEffect, useState, useTransition } from "react";
import { format } from "date-fns";
import { Pin, Megaphone, Calendar as CalendarIcon, EyeOff } from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { getDashboardAnnouncements } from "@/lib/actions/announcements.action";
import { AnnouncementStatus } from "@/types/common";
import { formatDate } from "@/lib/helpers/date-fns";

const statusConfig: Record<
  AnnouncementStatus,
  { label: string; badgeClass: string; dotClass: string }
> = {
  live: {
    label: "Live",
    badgeClass:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    dotClass: "bg-emerald-500 ring-emerald-500/20",
  },
  scheduled: {
    label: "Scheduled",
    badgeClass:
      "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    dotClass: "bg-blue-500 ring-blue-500/20",
  },
  expired: {
    label: "Expired",
    badgeClass: "bg-muted text-muted-foreground border-border",
    dotClass: "bg-muted-foreground ring-muted/20",
  },
};

export interface DashboardAnnouncement {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date | null;
  isPinned: boolean;
  status: AnnouncementStatus;
  isPublic?: boolean;
}

export default function AnnouncementsCalendarCard() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [announcements, setAnnouncements] = useState<DashboardAnnouncement[]>(
    [],
  );
  const [isPending, startTransition] = useTransition();

  const loadAnnouncements = useCallback((date: Date) => {
    startTransition(async () => {
      try {
        const data = await getDashboardAnnouncements(date);
        setAnnouncements(data);
      } catch (error) {
        console.error("Failed to load announcements:", error);
      }
    });
  }, []);

  useEffect(() => {
    loadAnnouncements(selectedDate);
  }, [loadAnnouncements, selectedDate]);

  const handleDateSelect = (date?: Date) => {
    if (!date) return;
    setSelectedDate(date);
  };

  return (
    <div className="flex flex-col gap-8 items-start">
      {/* Calendar Card */}
      <Card className="shadow-sm hover:shadow-md">
        <CardHeader className="sr-only">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <CalendarIcon className="size-4 text-muted-foreground" />
            Calendar
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0 flex justify-center">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            className="border-none shadow-none"
          />
        </CardContent>
      </Card>

      {/* Announcements Timeline Card */}
      <Card className="w-full shadow-sm hover:shadow-md">
        <CardHeader className="space-y-1 border-b border-border/50 pb-6">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {format(selectedDate, "EEEE, MMMM d, yyyy")}
          </p>

          <CardTitle className="text-xl font-semibold">Announcements</CardTitle>

          <Badge variant="info" className="text-xs font-normal rounded-full">
            {announcements.length}{" "}
            {announcements.length === 1 ? "Item" : "Items"}
          </Badge>
        </CardHeader>

        <CardContent className="p-5">
          <div
            className={cn(
              "transition-opacity duration-200",
              isPending && "opacity-50",
            )}
          >
            {announcements.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="relative -mt-4 mb-4">
                  <div className="relative flex size-12 items-center justify-center rounded-full border border-border bg-muted/50 text-muted-foreground">
                    <Megaphone className="size-5" />
                  </div>
                </div>
                <p className="text-sm font-medium text-foreground">
                  No announcements
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  There are no active updates scheduled for this date.
                </p>
              </div>
            ) : (
              <div className="relative space-y-6 before:absolute before:left-1 before:top-2 before:bottom-2 before:w-px before:bg-border/60">
                {announcements.map((item) => {
                  const status = statusConfig[item.status];

                  return (
                    <div key={item.id} className="relative flex gap-4 group">
                      {/* Status Indicator Dot */}
                      <div className="relative z-10 mt-1">
                        <div
                          className={cn(
                            "size-2.5 rounded-full ring-4 ring-background transition-transform group-hover:scale-125",
                            status.dotClass,
                          )}
                        />
                      </div>

                      {/* Content Box */}
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-medium leading-none text-foreground">
                              {item.title}
                            </h4>
                            {item.isPinned && (
                              <Pin className="size-3.5 text-amber-500 fill-amber-500/20 rotate-45" />
                            )}
                            {item.isPublic === false && (
                              <span title="Private Announcement">
                                <EyeOff className="size-3 text-muted-foreground" />
                              </span>
                            )}
                          </div>

                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px] px-2 py-0.5 border font-medium",
                              status.badgeClass,
                            )}
                          >
                            {status.label}
                          </Badge>
                        </div>

                        <p
                          title={item.description}
                          className="text-xs text-muted-foreground line-clamp-2 leading-relaxed"
                        >
                          {item.description}
                        </p>

                        <div className="flex items-center gap-2 text-xs text-muted-foreground/80 pt-1">
                          <span>{formatDate(item.startDate)}</span>
                          {item.endDate && (
                            <>
                              <span>•</span>
                              <span>{formatDate(item.endDate)}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
