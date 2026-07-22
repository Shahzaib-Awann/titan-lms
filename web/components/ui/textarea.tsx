import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

function Textarea({ className, error, ...props }: TextareaProps) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        // Layout
        "flex min-h-28 w-full resize-y rounded-xl",

        // Surface
        "border border-input bg-card",
        "shadow-sm shadow-black/5",

        // Spacing
        "px-4 py-3",

        // Typography
        "text-sm text-foreground",
        "placeholder:text-muted-foreground",

        // Motion
        "transition-all duration-200",

        // Hover
        "hover:border-primary/40",

        // Focus
        "focus-visible:outline-none",
        "focus-visible:border-primary",
        "focus-visible:ring-2",
        "focus-visible:ring-primary/20",

        // Disabled
        "disabled:cursor-not-allowed",
        "disabled:opacity-50",

        // Error
        error &&
          "border-destructive hover:border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20",

        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
