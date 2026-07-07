import React, { InputHTMLAttributes, forwardRef, useId } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, required, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;

    return (
      <div className="flex w-full flex-col gap-2">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-foreground"
          >
            {label}
            {required && <span className="ml-1 text-destructive">*</span>}
          </label>
        )}

        <input
          ref={ref}
          className={cn(
            "flex h-11 w-full rounded-xl",
            "border border-border",
            "bg-card",
            "px-4",
            "text-sm text-foreground",
            "placeholder:text-muted-foreground",
            "transition-all duration-200",

            "hover:border-primary/40",

            "focus-visible:outline-none",
            "focus-visible:border-primary",
            "focus-visible:ring-2",
            "focus-visible:ring-primary/20",

            "disabled:cursor-not-allowed",
            "disabled:opacity-50",

            error &&
              "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20",

            className
          )}
          id={inputId}
          required={required}
          {...props}
        />

        {error && (
          <p className="text-sm font-medium text-destructive">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";