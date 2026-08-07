"use client";

import { useEffect, useMemo, useState } from "react";
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
import { Clock3, MapPin } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { cn } from "@/lib/utils";
import {
  BatchScheduleCalendar,
  fetchTrainerCalendar,
} from "@/lib/actions/schedule.action";
import { formatTime } from "@/lib/helpers/date-fns";

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

export default function SchedulePage() {
  const [currentDate, setCurrentDate] = useState(TODAY);
  const [schedules, setSchedules] = useState<BatchScheduleCalendar[]>([]);
  const [loading, setLoading] = useState(false);

  const monthKey = useMemo(() => format(currentDate, "MM-yyyy"), [currentDate]);

  const days = useMemo(() => {
    return eachDayOfInterval({
      start: startOfWeek(startOfMonth(currentDate), {
        weekStartsOn: 1,
      }),
      end: endOfWeek(endOfMonth(currentDate), {
        weekStartsOn: 1,
      }),
    });
  }, [currentDate]);

  const eventsByDate = useMemo(() => {
    return schedules.reduce<Map<string, BatchScheduleCalendar[]>>(
      (map, event) => {
        const events = map.get(event.scheduleDate) ?? [];

        events.push(event);

        map.set(event.scheduleDate, events);

        return map;
      },
      new Map(),
    );
  }, [schedules]);

  useEffect(() => {
    let mounted = true;

    async function loadCalendar() {
      try {
        setLoading(true);

        const data = await fetchTrainerCalendar(monthKey);

        if (mounted) {
          setSchedules(data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadCalendar();

    return () => {
      mounted = false;
    };
  }, [monthKey]);

  function changeDate(type: "month" | "year", value: string | null) {
    if (!value) return;

    setCurrentDate((date) =>
      type === "month"
        ? setMonth(date, Number(value))
        : setYear(date, Number(value)),
    );
  }

  return (
    <section className="min-h-screen space-y-5 bg-background p-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Teaching Schedule</h1>
          <p className="text-muted-foreground">
            Check your scheduled training sessions and batch timings
          </p>
        </div>

        <div className="flex gap-3">
          <Select
            value={String(currentDate.getMonth())}
            onValueChange={(value) => changeDate("month", value)}
          >
            <SelectTrigger className="w-40">
              {" "}
              <SelectValue>{MONTHS[currentDate.getMonth()]}</SelectValue>{" "}
            </SelectTrigger>

            <SelectContent>
              {MONTHS.map((month, index) => (
                <SelectItem key={month} value={String(index)}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={String(currentDate.getFullYear())}
            onValueChange={(value) => changeDate("year", value)}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              {YEARS.map((year) => (
                <SelectItem key={year} value={String(year)}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </header>

      <div
        className={cn(
          "overflow-hidden rounded-xl border",
          loading && "pointer-events-none opacity-50",
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
                    <article
                      key={event.id}
                      className="rounded-lg border border-l-4 border-l-primary bg-card p-3 shadow-sm"
                    >
                      <p className="text-xs text-muted-foreground">
                        {event.courseName}
                      </p>

                      <p className="text-sm font-semibold">{event.batchName}</p>

                      <div className="mt-3 flex items-center gap-1 text-xs">
                        <Clock3 className="size-3" />
                        {formatTime(event.startTime)} -{" "}
                        {formatTime(event.endTime)}
                      </div>

                      {event.room && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="size-3" />
                          {event.room}
                        </div>
                      )}
                    </article>
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
