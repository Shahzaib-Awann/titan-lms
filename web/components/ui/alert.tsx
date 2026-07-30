import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const alertVariants = cva(
  [
    "group/alert",
    "relative",
    "grid",
    "w-full",
    "grid-cols-[auto_1fr]",
    "gap-x-4",
    "gap-y-1",
    "rounded-lg",
    "border",
    "bg-card",
    "p-5",
    "shadow-card",
    "transition-all",
    "duration-200",
    "has-data-[slot=alert-action]:pr-20",
    "[&>svg]:mt-0.5",
    "[&>svg]:size-5",
    "[&>svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        default: [
          "border-border",
          "bg-card",
          "text-card-foreground",
          "[&>svg]:text-primary",
        ].join(" "),

        info: [
          "border-primary/30",
          "bg-primary/8",
          "[&>svg]:text-primary",
        ].join(" "),

        success: ["border-green/30", "bg-green/10", "[&>svg]:text-green"].join(
          " ",
        ),

        warning: [
          "border-yellow/30",
          "bg-yellow/10",
          "[&>svg]:text-yellow",
        ].join(" "),

        destructive: [
          "border-destructive/30",
          "bg-destructive/10",
          "[&>svg]:text-destructive",
        ].join(" "),
      },
    },

    defaultVariants: {
      variant: "default",
    },
  },
);

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      role="alert"
      data-slot="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        [
          "col-start-2",
          "text-[15px]",
          "font-semibold",
          "leading-none",
          "tracking-tight",
          "text-foreground",
          "[&_a]:underline",
          "[&_a]:underline-offset-4",
          "[&_a]:hover:text-primary",
        ].join(" "),
        className,
      )}
      {...props}
    />
  );
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        [
          "col-start-2",
          "mt-1",
          "text-sm",
          "leading-6",
          "text-muted-foreground",
          "[&_a]:underline",
          "[&_a]:underline-offset-4",
          "[&_a]:hover:text-primary",
          "[&_p:not(:last-child)]:mb-2",
        ].join(" "),
        className,
      )}
      {...props}
    />
  );
}

function AlertAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-action"
      className={cn("absolute right-5 top-5 flex items-center", className)}
      {...props}
    />
  );
}

export { Alert, AlertTitle, AlertDescription, AlertAction };
