import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
  "group/button inline-flex shrink-0 items-center justify-center",
  "font-medium whitespace-nowrap",
  "rounded-xl",
  "transition-all duration-200 ease-out",
  "outline-none select-none",
  "focus-visible:outline-none",
  "focus-visible:ring-2",
  "focus-visible:ring-primary",
  "focus-visible:ring-offset-2",
  "focus-visible:ring-offset-background",
  "disabled:pointer-events-none",
  "disabled:opacity-50",
  "active:scale-[0.98]",
  "[&_svg]:pointer-events-none",
  "[&_svg]:shrink-0",
  "[&_svg]:size-4",
],
  {
    variants: {
      variant: {
        primary: [
          "bg-primary",
          "text-primary-foreground",
          "shadow-lg shadow-primary/20",
          "hover:bg-[#6848F8]",
          "hover:shadow-xl",
          "hover:shadow-primary/30",
          "hover:-translate-y-0.5",
        ],

        secondary: [
          "bg-card",
          "text-foreground",
          "border border-border",
          "shadow-sm",
          "hover:bg-secondary",
          "hover:border-primary/20",
          "hover:-translate-y-0.5",
        ],

        outline: [
          "border border-border",
          "bg-transparent",
          "text-foreground",
          "hover:bg-accent",
          "hover:border-primary/30",
          "hover:text-primary",
        ],

        ghost: [
          "bg-transparent",
          "text-muted-foreground",
          "hover:bg-accent",
          "hover:text-foreground",
        ],

        glass: [
          "relative",
          "border border-border",
          "bg-card",
          "text-muted-foreground!",
          "shadow-sm",
          "hover:-translate-y-0.5",
          "hover:border-primary/30",
          "hover:bg-accent",
          "hover:text-primary",
          "hover:shadow-md",
        ],
      },

      size: {
        sm: "h-9 px-4 text-sm gap-1.5",
        md: "h-11 px-5 text-sm gap-1.5",
        lg: "h-13 px-7 text-base gap-2",

        // for your glass icon/action button
        icon: "h-11 w-11 p-0",
      },
    },

    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

interface ButtonProps
  extends ButtonPrimitive.Props,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

function Button({
  children,
  className,
  variant,
  size,
  isLoading,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(
        buttonVariants({
          variant,
          size,
          className,
        })
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <Loader2 className="mr-2 size-4 animate-spin" />
      )}

      {children}
    </ButtonPrimitive>
  );
}

export { Button, buttonVariants };