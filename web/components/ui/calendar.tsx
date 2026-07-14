"use client";

import * as React from "react";
import {
  DayPicker,
  getDefaultClassNames,
  type DayButton,
  type Locale,
} from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
} from "lucide-react";

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  locale,
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"];
}) {
  const defaultClassNames = getDefaultClassNames();

  return (
    <div
      className={cn(
        "rounded-2xl border border-input bg-card p-5",
        "shadow-sm",
        className,
      )}
    >
      <DayPicker
        showOutsideDays={showOutsideDays}
        captionLayout={captionLayout}
        locale={locale}
        formatters={{
          formatMonthDropdown: (date) =>
            date.toLocaleString(locale?.code, {
              month: "short",
            }),
          ...formatters,
        }}
        classNames={{
          root: cn("w-full", defaultClassNames.root),

          months: cn("flex flex-col gap-8", defaultClassNames.months),

          month: cn("space-y-6", defaultClassNames.month),

          nav: cn(
            "flex items-center justify-between",
            "absolute inset-x-0 top-0",
            "px-1",
            defaultClassNames.nav,
          ),

          button_previous: cn(
            buttonVariants({
              variant: buttonVariant,
            }),
            [
              "size-9",
              "rounded-xl",
              "text-muted-foreground",
              "hover:text-foreground",
              "hover:bg-accent",
            ],
            defaultClassNames.button_previous,
          ),

          button_next: cn(
            buttonVariants({
              variant: buttonVariant,
            }),
            [
              "size-9",
              "rounded-xl",
              "text-muted-foreground",
              "hover:text-foreground",
              "hover:bg-accent",
            ],
            defaultClassNames.button_next,
          ),

          month_caption: cn(
            [
              "flex h-10",
              "items-center justify-center",
              "text-base",
              "font-semibold",
              "text-foreground",
            ],
            defaultClassNames.month_caption,
          ),

          caption_label: cn(
            "select-none text-sm font-semibold",
            defaultClassNames.caption_label,
          ),

          dropdowns: cn(
            ["flex items-center justify-center gap-2", "text-sm font-medium"],
            defaultClassNames.dropdowns,
          ),

          dropdown_root: cn(
            "relative rounded-xl",
            defaultClassNames.dropdown_root,
          ),

          dropdown: cn(
            "absolute inset-0 opacity-0",
            "bg-popover",
            defaultClassNames.dropdown,
          ),

          month_grid: cn(
            "w-full border-collapse",
            defaultClassNames.month_grid,
          ),

          weekdays: cn("mb-3 flex", defaultClassNames.weekdays),

          weekday: cn(
            [
              "flex-1",
              "text-xs font-medium",
              "uppercase tracking-wide",
              "text-muted-foreground",
            ],
            defaultClassNames.weekday,
          ),

          week: cn("mt-2 flex w-full", defaultClassNames.week),

          day: cn(
            [
              "relative",
              "flex-1",
              "aspect-square",
              "rounded-xl",
              "p-1",
              "text-center",
            ],
            defaultClassNames.day,
          ),

          today: cn(
            ["rounded-xl", "bg-primary/10", "text-primary", "font-semibold"],
            defaultClassNames.today,
          ),

          outside: cn(["text-muted-foreground/40"], defaultClassNames.outside),

          disabled: cn(
            ["opacity-40", "cursor-not-allowed"],
            defaultClassNames.disabled,
          ),

          hidden: cn("invisible", defaultClassNames.hidden),

          ...classNames,
        }}
        components={{
          Root: ({ className, rootRef, ...props }) => (
            <div
              data-slot="calendar"
              ref={rootRef}
              className={cn("relative", className)}
              {...props}
            />
          ),

          Chevron: ({ className, orientation, ...props }) => {
            if (orientation === "left") {
              return (
                <ChevronLeftIcon
                  className={cn("size-4", className)}
                  {...props}
                />
              );
            }

            if (orientation === "right") {
              return (
                <ChevronRightIcon
                  className={cn("size-4", className)}
                  {...props}
                />
              );
            }

            return (
              <ChevronDownIcon className={cn("size-4", className)} {...props} />
            );
          },

          DayButton: (props) => (
            <CalendarDayButton locale={locale} {...props} />
          ),

          WeekNumber: ({ children, ...props }) => (
            <td {...props}>
              <div className="flex size-9 items-center justify-center text-xs text-muted-foreground">
                {children}
              </div>
            </td>
          ),

          ...components,
        }}
        {...props}
      />
    </div>
  );
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  locale,
  ...props
}: React.ComponentProps<typeof DayButton> & {
  locale?: Partial<Locale>;
}) {
  const defaultClassNames = getDefaultClassNames();

  const ref = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (modifiers.focused) {
      ref.current?.focus();
    }
  }, [modifiers.focused]);

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString(locale?.code)}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        [
          "relative z-10",
          "size-7.5",
          "rounded-xl",

          "text-sm font-medium",
          "text-foreground",

          "transition-all duration-200",

          "hover:bg-accent",
          "hover:text-accent-foreground",

          "focus-visible:ring-2",
          "focus-visible:ring-primary/30",

          // Selected
          "data-[selected-single=true]:bg-primary",
          "data-[selected-single=true]:text-primary-foreground",

          // Range
          "data-[range-start=true]:bg-primary",
          "data-[range-start=true]:text-primary-foreground",

          "data-[range-end=true]:bg-primary",
          "data-[range-end=true]:text-primary-foreground",

          "data-[range-middle=true]:bg-primary/10",
          "data-[range-middle=true]:text-foreground",

          "[&>span]:text-xs",
          "[&>span]:opacity-70",
        ].join(" "),

        defaultClassNames.day,
        className,
      )}
      {...props}
    />
  );
}

export { Calendar, CalendarDayButton };
