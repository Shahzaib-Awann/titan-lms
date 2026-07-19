"use client";

import { Toggle as TogglePrimitive } from "@base-ui/react/toggle";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const toggleVariants = cva(
  [
    "group/toggle inline-flex items-center justify-center gap-2",
    "rounded-lg text-sm font-medium whitespace-nowrap",
    "transition-all duration-250 ease-[cubic-bezier(.4,0,.2,1)]",
    "outline-none",
    "disabled:pointer-events-none disabled:opacity-50",
    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
    "[&_svg:not([class*='size-'])]:size-4",
  ].join(" "),
  {
    variants: {
      variant: {
        default: [
          "bg-transparent",
          "text-muted-foreground",
          "hover:bg-accent",
          "hover:text-accent-foreground",
          "data-[state=on]:bg-primary",
          "data-[state=on]:text-primary-foreground",
          "data-[state=on]:shadow-card",
        ].join(" "),

        outline: [
          "border border-border",
          "bg-card",
          "text-card-foreground",
          "hover:bg-accent",
          "hover:text-accent-foreground",
          "hover:border-primary/50",
          "data-[state=on]:border-primary",
          "data-[state=on]:bg-primary",
          "data-[state=on]:text-primary-foreground",
        ].join(" "),
      },

      size: {
        default: ["h-9 min-w-9", "px-3", "rounded-lg"].join(" "),

        sm: [
          "h-8 min-w-8",
          "px-2.5",
          "rounded-md",
          "text-xs",
          "[&_svg:not([class*='size-'])]:size-3.5",
        ].join(" "),

        lg: ["h-11 min-w-11", "px-4", "rounded-xl", "text-base"].join(" "),
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
          className,
        }),
      )}
      {...props}
    />
  );
}

export { Toggle, toggleVariants };
