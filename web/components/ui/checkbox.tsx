import React, { InputHTMLAttributes, forwardRef } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, ...props }, ref) => {
    return (
      <label
        className={cn(
          "group inline-flex w-fit cursor-pointer items-center gap-3",
          className,
        )}
      >
        <div className="relative">
          <input
            ref={ref}
            type="checkbox"
            className={cn(
              "peer h-5 w-5 appearance-none rounded-md",
              "border border-border",
              "bg-card",
              "transition-all duration-200 ease-out",
              "hover:border-primary/50",
              "checked:border-primary checked:bg-primary",
              "focus-visible:outline-none",
              "focus-visible:ring-2",
              "focus-visible:ring-primary",
              "focus-visible:ring-offset-2",
              "focus-visible:ring-offset-background",
              "disabled:cursor-not-allowed",
              "disabled:opacity-50",
            )}
            {...props}
          />

          <Check
            className={cn(
              "pointer-events-none absolute inset-0 mx-auto my-1 h-3.5 w-3.5",
              "text-primary-foreground",
              "opacity-0 scale-75",
              "transition-all duration-200",
              "peer-checked:scale-100",
              "peer-checked:opacity-100",
            )}
            strokeWidth={3}
          />
        </div>

        {label && (
          <span
            className={cn(
              "text-sm font-medium",
              "text-muted-foreground",
              "transition-colors duration-200",
              "group-hover:text-foreground",
              "peer-disabled:opacity-50",
            )}
          >
            {label}
          </span>
        )}
      </label>
    );
  },
);

Checkbox.displayName = "Checkbox";
