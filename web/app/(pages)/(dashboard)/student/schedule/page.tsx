import { ScheduleCalendar } from "@/components/pages/schedule/schedule-calendar";
import { fetchCalendarEvents } from "@/lib/actions/schedule.action";

const MIN_YEAR = 2015;

type SearchParams = Promise<{
  month?: string;
  year?: string;
}>;

export default async function SchedulePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;

  const now = new Date();

  const currentYear = now.getFullYear();
  const maxYear = currentYear + 2;

  const month = Math.min(
    12,
    Math.max(1, Number(params.month) || now.getMonth() + 1),
  );

  const requestedYear = Number(params.year) || currentYear;

  const year = Math.min(maxYear, Math.max(MIN_YEAR, requestedYear));

  const monthYear = `${String(month).padStart(2, "0")}-${year}`;

  const schedules = await fetchCalendarEvents(monthYear);

  return <ScheduleCalendar schedules={schedules} month={month} year={year} />;
}
