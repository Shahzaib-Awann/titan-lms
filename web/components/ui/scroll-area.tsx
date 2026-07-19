"use client";

import * as React from "react";
import { ScrollArea as ScrollAreaPrimitive } from "@base-ui/react/scroll-area";

import { cn } from "@/lib/utils";

function ScrollArea({
  className,
  children,
  ...props
}: ScrollAreaPrimitive.Root.Props) {
  return (
    <ScrollAreaPrimitive.Root
      data-slot="scroll-area"
      className={cn("relative overflow-hidden", className)}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        data-slot="scroll-area-viewport"
        className={cn([
          "size-full",
          "rounded-[inherit]",

          "outline-none",

          "transition-colors",

          "focus-visible:ring-2",
          "focus-visible:ring-primary",
          "focus-visible:ring-offset-2",
          "focus-visible:ring-offset-background",
        ])}
      >
        {children}
      </ScrollAreaPrimitive.Viewport>

      <ScrollBar />

      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  );
}

function ScrollBar({
  className,
  orientation = "vertical",
  ...props
}: ScrollAreaPrimitive.Scrollbar.Props) {
  return (
    <ScrollAreaPrimitive.Scrollbar
      data-slot="scroll-area-scrollbar"
      data-orientation={orientation}
      orientation={orientation}
      className={cn(
        [
          "flex",
          "touch-none",
          "select-none",

          "transition-colors",
          "duration-250",

          "p-1",

          // vertical
          "data-vertical:h-full",
          "data-vertical:w-3",

          // horizontal
          "data-horizontal:h-3",
          "data-horizontal:flex-col",

          "opacity-60",
          "hover:opacity-100",
        ],
        className,
      )}
      {...props}
    >
      <ScrollAreaPrimitive.Thumb
        data-slot="scroll-area-thumb"
        className={cn([
          "relative",
          "flex-1",

          "rounded-pill",

          "bg-surface-3",

          "transition-colors",
          "duration-250",

          "hover:bg-primary/70",

          "data-[state=visible]:bg-border",
        ])}
      />
    </ScrollAreaPrimitive.Scrollbar>
  );
}

export { ScrollArea, ScrollBar };
