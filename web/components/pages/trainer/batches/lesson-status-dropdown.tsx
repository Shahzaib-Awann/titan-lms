"use client";

import { Check, ChevronDown, Circle, Clock3, SkipForward } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LessonStatus } from "@/types/common";

interface LessonStatusDropdownProps {
  moduleId: string;
  lessonId: string;
  status: string;
  onChange: (moduleId: string, lessonId: string, status: LessonStatus) => void;
}

const actions: {
  label: string;
  value: LessonStatus;
  icon: React.ElementType;
  iconClass: string;
}[] = [
  {
    label: "Mark as Completed",
    value: "completed",
    icon: Check,
    iconClass: "text-emerald-500",
  },
  {
    label: "In Progress",
    value: "in_progress",
    icon: Clock3,
    iconClass: "text-blue-500",
  },
  {
    label: "Not Started",
    value: "not_started",
    icon: Circle,
    iconClass: "text-slate-500",
  },
  {
    label: "Skipped",
    value: "skipped",
    icon: SkipForward,
    iconClass: "text-amber-500",
  },
];

export function LessonStatusDropdown({
  moduleId,
  lessonId,
  status,
  onChange,
}: LessonStatusDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            className="min-w-42 rounded-md justify-between capitalize"
          >
            {status?.split("_")?.join(" ")}
            <ChevronDown className="h-4 w-4 opacity-60" />
          </Button>
        }
      />

      <DropdownMenuContent align="end" className="w-56">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <DropdownMenuItem
              key={action.value}
              onClick={() => onChange(moduleId, lessonId, action.value)}
            >
              <Icon className={`mr-2 h-4 w-4 ${action.iconClass}`} />
              {action.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
