"use client";

import { useTransition } from "react";
import { Clock3, MapPin } from "lucide-react";
import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  setMonth,
  setYear,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { useRouter } from "next/navigation";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { cn } from "@/lib/utils";
import { BatchScheduleCalendar } from "@/lib/actions/schedule.action";
import { formatTime } from "@/lib/helpers/date-fns";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEK_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const TODAY = new Date();

const YEARS = Array.from(
  { length: 13 },
  (_, index) => TODAY.getFullYear() - 10 + index,
);

type ScheduleCalendarProps = {
  schedules: BatchScheduleCalendar[];
  month: number;
  year: number;
};

export function ScheduleCalendar({
  schedules,
  month,
  year,
}: ScheduleCalendarProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const currentDate = new Date(year, month - 1, 1);

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentDate), {
      weekStartsOn: 1,
    }),
    end: endOfWeek(endOfMonth(currentDate), {
      weekStartsOn: 1,
    }),
  });

  const eventsByDate = schedules.reduce<Map<string, BatchScheduleCalendar[]>>(
    (map, event) => {
      const events = map.get(event.scheduleDate) ?? [];

      events.push(event);
      map.set(event.scheduleDate, events);

      return map;
    },
    new Map(),
  );

  function updateDate(type: "month" | "year", value: string | null) {
    if (!value) return;

    const nextDate =
      type === "month"
        ? setMonth(currentDate, Number(value))
        : setYear(currentDate, Number(value));

    const nextMonth = String(nextDate.getMonth() + 1).padStart(2, "0");

    const nextYear = nextDate.getFullYear();

    startTransition(() => {
      router.push(`?month=${nextMonth}&year=${nextYear}`);
    });
  }

  return (
    <section className="min-h-screen space-y-5 bg-background p-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Schedule</h1>

          <p className="text-muted-foreground">
            Check your scheduled classes, batch timings, and locations
          </p>
        </div>

        <div className="flex gap-3">
          <Select
            value={String(currentDate.getMonth())}
            onValueChange={(value) => updateDate("month", value)}
          >
            <SelectTrigger className="w-40">
              <SelectValue>{MONTHS[currentDate.getMonth()]}</SelectValue>
            </SelectTrigger>

            <SelectContent>
              {MONTHS.map((monthName, index) => (
                <SelectItem key={monthName} value={String(index)}>
                  {monthName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={String(currentDate.getFullYear())}
            onValueChange={(value) => updateDate("year", value)}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              {YEARS.map((yearValue) => (
                <SelectItem key={yearValue} value={String(yearValue)}>
                  {yearValue}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </header>

      <div
        className={cn(
          "overflow-hidden rounded-xl border",
          isPending && "pointer-events-none opacity-50",
        )}
      >
        <div className="grid grid-cols-7 bg-secondary">
          {WEEK_DAYS.map((day) => (
            <div
              key={day}
              className="border-b border-r p-4 text-center font-semibold"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {days.map((day) => {
            const dateKey = format(day, "yyyy-MM-dd");

            const events = eventsByDate.get(dateKey) ?? [];

            return (
              <div
                key={dateKey}
                className={cn(
                  "min-h-40 border-b border-r p-3",
                  !isSameMonth(day, currentDate) &&
                    "bg-muted/50 text-muted-foreground",
                )}
              >
                <div
                  className={cn(
                    "flex size-11 items-center justify-center rounded-md",
                    isToday(day) && "bg-primary text-primary-foreground",
                  )}
                >
                  {format(day, "d")}
                </div>

                <div className="mt-3 space-y-2">
                  {events.map((event) => (
                    <Tooltip key={event.id}>
                      <TooltipTrigger className="w-full">
                        <article className="w-full cursor-pointer rounded-md border border-l-2 border-l-primary bg-card px-2 py-1.5 text-left shadow-sm transition-colors hover:bg-muted">
                          <p className="truncate text-sm font-semibold">
                            {event.batchName}
                          </p>

                          <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock3 className="size-2.5 shrink-0" />
                            {formatTime(event.startTime)} -{" "}
                            {formatTime(event.endTime)}
                          </div>
                        </article>
                      </TooltipTrigger>

                      <TooltipContent
                        side="bottom"
                        align="start"
                        className="w-64 p-3"
                      >
                        <div className="space-y-2">
                          <div>
                            <p className="text-sm font-semibold">
                              {event.batchName}
                            </p>

                            <p className="text-xs text-muted-foreground">
                              {event.courseName}
                            </p>
                          </div>

                          <div className="space-y-1.5 text-xs">
                            <div className="flex items-center gap-2">
                              <Clock3 className="size-3.5 text-muted-foreground" />

                              <span>
                                {formatTime(event.startTime)} -{" "}
                                {formatTime(event.endTime)}
                              </span>
                            </div>

                            {event.room && (
                              <div className="flex items-center gap-2">
                                <MapPin className="size-3.5 text-muted-foreground" />

                                <span>{event.room}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
