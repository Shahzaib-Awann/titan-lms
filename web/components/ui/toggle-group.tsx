"use client";

import * as React from "react";
import { Toggle as TogglePrimitive } from "@base-ui/react/toggle";
import { ToggleGroup as ToggleGroupPrimitive } from "@base-ui/react/toggle-group";
import { type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { toggleVariants } from "@/components/ui/toggle";

const ToggleGroupContext = React.createContext<
  VariantProps<typeof toggleVariants> & {
    spacing?: number;
    orientation?: "horizontal" | "vertical";
  }
>({
  size: "default",
  variant: "default",
  spacing: 2,
  orientation: "horizontal",
});

export function ToggleGroup({
  className,
  variant,
  size,
  spacing = 2,
  orientation = "horizontal",
  children,
  ...props
}: ToggleGroupPrimitive.Props &
  VariantProps<typeof toggleVariants> & {
    spacing?: number;
    orientation?: "horizontal" | "vertical";
  }) {
  return (
    <ToggleGroupPrimitive
      data-slot="toggle-group"
      data-variant={variant}
      data-size={size}
      data-spacing={spacing}
      data-orientation={orientation}
      style={
        {
          "--gap": spacing,
        } as React.CSSProperties
      }
      className={cn(
        [
          "group/toggle-group flex w-fit items-center",

          // Surface
          "rounded-xl",
          "border border-input",
          "bg-card",

          // Spacing
          "p-1",
          "gap-[--spacing(var(--gap))]",

          // Shadow
          "shadow-sm shadow-black/5",

          // Orientation
          "data-[orientation=vertical]:flex-col",
          "data-[orientation=vertical]:items-stretch",
          "data-[orientation=vertical]:w-auto",
        ].join(" "),
        className,
      )}
      {...props}
    >
      <ToggleGroupContext.Provider
        value={{
          variant,
          size,
          spacing,
          orientation,
        }}
      >
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive>
  );
}

export function ToggleGroupItem({
  className,
  children,
  variant = "default",
  size = "default",
  ...props
}: TogglePrimitive.Props & VariantProps<typeof toggleVariants>) {
  const context = React.useContext(ToggleGroupContext);

  return (
    <TogglePrimitive
      data-slot="toggle-group-item"
      data-variant={context.variant || variant}
      data-size={context.size || size}
      data-spacing={context.spacing}
      className={cn(
        toggleVariants({
          variant: context.variant || variant,
          size: context.size || size,
        }),

        [
          "relative shrink-0",
          "rounded-lg",

          "transition-all duration-250",
          "ease-in-out",

          "focus-visible:z-10",

          // Active state
          "aria-pressed:bg-primary",
          "aria-pressed:text-primary-foreground",
          "aria-pressed:shadow-card",

          // Connected items
          "group-data-[spacing=0]/toggle-group:rounded-none",

          // Horizontal
          "group-data-[orientation=horizontal]/toggle-group:first:rounded-l-lg",
          "group-data-[orientation=horizontal]/toggle-group:last:rounded-r-lg",

          // Vertical
          "group-data-[orientation=vertical]/toggle-group:first:rounded-t-lg",
          "group-data-[orientation=vertical]/toggle-group:last:rounded-b-lg",
        ].join(" "),

        className,
      )}
      {...props}
    >
      {children}
    </TogglePrimitive>
  );
}
