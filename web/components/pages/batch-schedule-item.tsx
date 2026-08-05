import { MapPin } from "lucide-react";

import { formatDay, formatTime } from "@/lib/helpers/date-fns";
import { cn } from "@/lib/utils";

interface ScheduleItemProps {
  schedule: {
    id: string;
    weekday: string;
    startTime: string;
    endTime: string;
    room?: string | null;
  };

  textVariant?: "sm" | "xs";
}

export function BatchScheduleItem({
  schedule: sch,
  textVariant = "sm",
}: ScheduleItemProps) {
  return (
    <div className="p-2.5 rounded-lg border border-border/60 bg-muted/20 flex items-center justify-between text-xs">
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "text-xs font-semibold text-primary uppercase w-8",
            textVariant === "sm" ? "text-sm" : "text-xs",
          )}
        >
          {formatDay(sch.weekday)}
        </span>
        <span
          className={cn(
            "text-xs text-muted-foreground font-medium",
            textVariant === "sm" ? "text-sm" : "text-xs",
          )}
        >
          {formatTime(sch.startTime)} - {formatTime(sch.endTime)}
        </span>
      </div>
      {sch.room && (
        <span className="text-xs px-2 py-0.5 rounded bg-background font-mono border border-border/60 text-muted-foreground flex items-center gap-1">
          <MapPin className="size-2.5" />
          {sch.room}
        </span>
      )}
    </div>
  );
}
