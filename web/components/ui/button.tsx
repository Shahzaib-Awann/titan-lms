import React, { ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  isLoading,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = cn(
    "inline-flex items-center justify-center",
    "font-medium",
    "rounded-xl",
    "transition-all duration-200 ease-out",
    "focus-visible:outline-none",
    "focus-visible:ring-2",
    "focus-visible:ring-primary",
    "focus-visible:ring-offset-2",
    "focus-visible:ring-offset-background",
    "disabled:pointer-events-none",
    "disabled:opacity-50",
    "active:scale-[0.98]"
  );

  const variants = {
    primary: cn(
      "bg-primary",
      "text-primary-foreground",
      "shadow-lg shadow-primary/20",
      "hover:bg-[#6848F8]",
      "hover:shadow-xl",
      "hover:shadow-primary/30",
      "hover:-translate-y-0.5"
    ),

    secondary: cn(
      "bg-card",
      "text-foreground",
      "border border-border",
      "shadow-sm",
      "hover:bg-secondary",
      "hover:border-primary/20",
      "hover:-translate-y-0.5"
    ),

    outline: cn(
      "border border-border",
      "bg-transparent",
      "text-foreground",
      "hover:bg-accent",
      "hover:border-primary/30",
      "hover:text-primary"
    ),

    ghost: cn(
      "bg-transparent",
      "text-muted-foreground",
      "hover:bg-accent",
      "hover:text-foreground"
    ),
  };

  const sizes = {
    sm: "h-9 px-4 text-sm",
    md: "h-11 px-5 text-sm",
    lg: "h-13 px-7 text-base",
  };

  return (
    <button
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      )}
      {children}
    </button>
  );
}