import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  [
    "group/badge",
    "inline-flex",
    "h-6",
    "w-fit",
    "shrink-0",
    "items-center",
    "justify-center",
    "gap-1.5",
    "rounded-pill",
    "px-3",
    "text-xs",
    "font-medium",
    "whitespace-nowrap",

    "transition-all duration-250",
    "focus-visible:outline-none",
    "focus-visible:ring-2",
    "focus-visible:ring-primary",
    "focus-visible:ring-offset-2",

    "[&>svg]:size-3.5",
    "[&>svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        default: [
          "bg-primary",
          "text-primary-foreground",
          "shadow-sm",
          "hover:bg-primary/90",
        ].join(" "),

        secondary: [
          "bg-secondary",
          "text-secondary-foreground",
          "hover:bg-secondary/80",
        ].join(" "),

        outline: [
          "border",
          "border-border",
          "bg-transparent",
          "text-foreground",
          "hover:bg-muted",
        ].join(" "),

        ghost: [
          "bg-transparent",
          "text-muted-foreground",
          "hover:bg-muted",
          "hover:text-foreground",
        ].join(" "),

        success: ["bg-green/15", "text-green"].join(" "),

        warning: ["bg-yellow/15", "text-yellow"].join(" "),

        destructive: ["bg-red/15", "text-red"].join(" "),

        info: ["bg-primary/15", "text-primary"].join(" "),

        difficulty: [
          "bg-surface-3",
          "text-muted-foreground",
          "border",
          "border-border",
        ].join(" "),

        link: [
          "bg-transparent",
          "px-0",
          "text-primary",
          "hover:underline",
          "hover:underline-offset-4",
        ].join(" "),
      },
    },

    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props,
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  });
}

export { Badge, badgeVariants };
