"use client";

import { Toggle as TogglePrimitive } from "@base-ui/react/toggle";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const toggleVariants = cva(
  [
    "group/toggle",
    "inline-flex",
    "items-center",
    "justify-center",
    "gap-2",

    "rounded-lg",

    "text-sm",
    "font-medium",
    "whitespace-nowrap",

    "transition-all",
    "duration-250",

    "outline-none",

    "disabled:pointer-events-none",
    "disabled:opacity-50",

    "focus-visible:ring-2",
    "focus-visible:ring-primary",
    "focus-visible:ring-offset-2",
    "focus-visible:ring-offset-background",

    "aria-invalid:ring-destructive/20",

    "[&_svg]:pointer-events-none",
    "[&_svg]:shrink-0",
    "[&_svg:not([class*='size-'])]:size-4",
  ],
  {
    variants: {
      variant: {
        default: [
          "bg-transparent",
          "text-muted-foreground",

          "hover:bg-surface-3",
          "hover:text-foreground",

          "data-[state=on]:bg-primary/15",
          "data-[state=on]:text-primary",
          "data-[state=on]:shadow-card",
        ].join(" "),

        outline: [
          "border",
          "border-border",

          "bg-surface-1",

          "text-muted-foreground",

          "hover:bg-surface-3",
          "hover:text-foreground",

          "data-[state=on]:border-primary/40",
          "data-[state=on]:bg-primary/15",
          "data-[state=on]:text-primary",
        ].join(" "),
      },

      size: {
        default: ["h-9", "min-w-9", "px-3"].join(" "),

        sm: [
          "h-8",
          "min-w-8",
          "rounded-md",
          "px-2.5",
          "text-xs",

          "[&_svg:not([class*='size-'])]:size-3.5",
        ].join(" "),

        lg: ["h-10", "min-w-10", "px-4"].join(" "),
      },
    },

    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Toggle({
  className,
  variant = "default",
  size = "default",
  ...props
}: TogglePrimitive.Props & VariantProps<typeof toggleVariants>) {
  return (
    <TogglePrimitive
      data-slot="toggle"
      className={cn(
        toggleVariants({
          variant,
          size,
        }),
        className,
      )}
      {...props}
    />
  );
}

export { Toggle, toggleVariants };
