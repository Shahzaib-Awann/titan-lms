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

function ToggleGroup({
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
      style={{ "--gap": spacing } as React.CSSProperties}
      className={cn(
        `
        group/toggle-group
        flex w-fit
        items-center
        rounded-xl
        border border-border
        bg-surface-1
        p-1
        shadow-card
        transition-all
        duration-250
        ease-in-out

        data-vertical:flex-col
        data-vertical:items-stretch

        hover:shadow-elevated

        data-[size=sm]:rounded-lg
        `,
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

function ToggleGroupItem({
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
        `
        relative
        shrink-0
        rounded-lg

        px-4
        py-2

        text-sm
        font-medium

        text-muted-foreground

        transition-all
        duration-250
        ease-in-out

        hover:bg-surface-3
        hover:text-foreground

        focus-visible:z-10
        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-ring
        focus-visible:ring-offset-2
        focus-visible:ring-offset-background

        data-[state=on]:
          bg-blurple
          text-white
          shadow-card

        data-[state=on]:hover:bg-blurple-hover

        group-data-[spacing=0]/toggle-group:
          rounded-none

        group-data-horizontal/toggle-group:
          first:rounded-l-lg

        group-data-horizontal/toggle-group:
          last:rounded-r-lg

        group-data-vertical/toggle-group:
          first:rounded-t-lg

        group-data-vertical/toggle-group:
          last:rounded-b-lg
        `,
        toggleVariants({
          variant: context.variant || variant,
          size: context.size || size,
        }),
        className,
      )}
      {...props}
    >
      {children}
    </TogglePrimitive>
  );
}

export { ToggleGroup, ToggleGroupItem };
