"use client";

import { Progress as ProgressPrimitive } from "@base-ui/react/progress";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const indicatorVariants = cva(
  [
    "h-full rounded-full",
    "transition-[width] duration-300 ease-out",
    "motion-reduce:transition-none",
  ],
  {
    variants: {
      variant: {
        purple:
          "bg-[var(--color-chart-1)] shadow-[0_0_14px_rgba(118,88,255,.45)]",

        green:
          "bg-[var(--color-chart-2)] shadow-[0_0_14px_rgba(74,222,128,.35)]",

        amber:
          "bg-[var(--color-chart-3)] shadow-[0_0_14px_rgba(251,191,36,.35)]",

        lavender:
          "bg-[var(--color-chart-4)] shadow-[0_0_14px_rgba(155,135,255,.35)]",

        blue: "bg-[var(--color-chart-5)] shadow-[0_0_14px_rgba(96,165,250,.35)]",

        rose: "bg-[var(--color-chart-6)] shadow-[0_0_14px_rgba(251,113,133,.35)]",
      },
    },
    defaultVariants: {
      variant: "purple",
    },
  },
);

interface ProgressProps
  extends
    ProgressPrimitive.Root.Props,
    VariantProps<typeof indicatorVariants> {}

function Progress({
  className,
  children,
  value,
  variant,
  ...props
}: ProgressProps) {
  return (
    <ProgressPrimitive.Root
      value={value}
      data-slot="progress"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    >
      {children}

      <ProgressTrack>
        <ProgressIndicator variant={variant} />
      </ProgressTrack>
    </ProgressPrimitive.Root>
  );
}

function ProgressTrack({ className, ...props }: ProgressPrimitive.Track.Props) {
  return (
    <ProgressPrimitive.Track
      data-slot="progress-track"
      className={cn(
        "relative h-2.5 w-full overflow-hidden rounded-full bg-input",
        className,
      )}
      {...props}
    />
  );
}

interface ProgressIndicatorProps
  extends
    ProgressPrimitive.Indicator.Props,
    VariantProps<typeof indicatorVariants> {}

function ProgressIndicator({
  className,
  variant,
  ...props
}: ProgressIndicatorProps) {
  return (
    <ProgressPrimitive.Indicator
      data-slot="progress-indicator"
      className={cn(indicatorVariants({ variant }), className)}
      {...props}
    />
  );
}

function ProgressLabel({ className, ...props }: ProgressPrimitive.Label.Props) {
  return (
    <ProgressPrimitive.Label
      data-slot="progress-label"
      className={cn("text-sm font-medium text-foreground", className)}
      {...props}
    />
  );
}

function ProgressValue({ className, ...props }: ProgressPrimitive.Value.Props) {
  return (
    <ProgressPrimitive.Value
      data-slot="progress-value"
      className={cn(
        "ml-auto text-sm font-medium tabular-nums text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

export {
  Progress,
  ProgressTrack,
  ProgressIndicator,
  ProgressLabel,
  ProgressValue,
};
