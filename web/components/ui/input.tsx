import React, { InputHTMLAttributes, forwardRef, useId } from "react";
import { cn } from "@/lib/utils";
import { LucideIcon, X } from "lucide-react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: LucideIcon;
  wrapperClassName?: string;
  clearable?: boolean;
  onClear?: () => void;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      wrapperClassName,
      icon: Icon,
      label,
      error,
      required,
      id,
      clearable,
      onClear,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const inputId = id || generatedId;

    const showClear = clearable && props.value;

    return (
      <div className={cn("flex flex-col gap-2", wrapperClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-foreground"
          >
            {label}
            {required && <span className="ml-1 text-destructive">*</span>}
          </label>
        )}

        <div className="relative">
          {Icon && (
            <Icon className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
          )}

          <input
            ref={ref}
            className={cn(
              "flex h-11 w-full rounded-xl",
              "border border-input bg-card shadow-sm shadow-black/5",
              "pr-4",
              Icon ? "pl-10" : "pl-4",
              showClear && "pr-10",
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

              className,
            )}
            id={inputId}
            required={required}
            {...props}
          />

          {showClear && (
            <button
              type="button"
              onClick={onClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        {error && (
          <p className="text-sm font-medium text-destructive">{error}</p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
