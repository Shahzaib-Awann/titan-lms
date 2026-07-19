"use client";

import * as React from "react";
import { Select as SelectPrimitive } from "@base-ui/react/select";

import { cn } from "@/lib/utils";
import { ChevronDownIcon, CheckIcon, ChevronUpIcon } from "lucide-react";

const Select = SelectPrimitive.Root;

function SelectGroup({ className, ...props }: SelectPrimitive.Group.Props) {
  return (
    <SelectPrimitive.Group
      data-slot="select-group"
      className={cn("scroll-my-1 p-1", className)}
      {...props}
    />
  );
}

function SelectValue({ className, ...props }: SelectPrimitive.Value.Props) {
  return (
    <SelectPrimitive.Value
      data-slot="select-value"
      className={cn("flex flex-1 text-left", className)}
      {...props}
    />
  );
}

function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}: SelectPrimitive.Trigger.Props & {
  size?: "sm" | "default";
}) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        "group flex items-center justify-between gap-2",
        "rounded-xl border border-border/70",
        "bg-card/95 backdrop-blur-xl",
        "px-3 text-sm font-medium",
        "text-muted-foreground",
        "shadow-sm transition-all duration-200",
        "outline-none select-none",
        "hover:bg-primary/5 hover:text-primary",
        "focus:bg-primary/10 focus:text-primary",
        "focus-visible:ring-2 focus-visible:ring-primary/30",
        "disabled:pointer-events-none disabled:opacity-40",
        "data-placeholder:text-muted-foreground",
        "data-[size=default]:h-10",
        "data-[size=sm]:h-8",
        "[&_svg]:size-4",
        "[&_svg]:shrink-0",
        "data-[state=open]:bg-primary/10",
        "data-[state=open]:text-primary",
        className,
      )}
      {...props}
    >
      {children}

      <SelectPrimitive.Icon
        render={
          <ChevronDownIcon className="text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
        }
      />
    </SelectPrimitive.Trigger>
  );
}

function SelectContent({
  className,
  children,
  side = "bottom",
  sideOffset = 4,
  align = "center",
  alignOffset = 0,
  alignItemWithTrigger = true,
  ...props
}: SelectPrimitive.Popup.Props &
  Pick<
    SelectPrimitive.Positioner.Props,
    "align" | "alignOffset" | "side" | "sideOffset" | "alignItemWithTrigger"
  >) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        alignItemWithTrigger={alignItemWithTrigger}
        className="isolate z-50 outline-none"
      >
        <SelectPrimitive.Popup
          data-slot="select-content"
          className={cn(
            "z-50",
            "max-h-(--available-height)",
            "w-(--anchor-width)",
            "min-w-55",
            "origin-(--transform-origin)",
            "overflow-hidden overflow-y-auto",
            "rounded-2xl",
            "border border-border/70",
            "bg-card/95",
            "backdrop-blur-xl",
            "p-2",
            "text-card-foreground",
            "shadow-2xl shadow-black/25",
            "outline-none",
            "transition-all duration-200",
            "data-open:animate-in",
            "data-open:fade-in-0",
            "data-open:zoom-in-95",
            "data-closed:animate-out",
            "data-closed:fade-out-0",
            "data-closed:zoom-out-95",
            className,
          )}
          {...props}
        >
          <SelectScrollUpButton />

          <SelectPrimitive.List>{children}</SelectPrimitive.List>

          <SelectScrollDownButton />
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  );
}

function SelectLabel({
  className,
  ...props
}: SelectPrimitive.GroupLabel.Props) {
  return (
    <SelectPrimitive.GroupLabel
      data-slot="select-label"
      className={cn(
        "px-1.5 py-1",
        "text-xs font-semibold uppercase tracking-wider",
        "text-muted-foreground/80",
        className,
      )}
      {...props}
    />
  );
}

function SelectItem({
  className,
  children,
  ...props
}: SelectPrimitive.Item.Props) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "group relative flex w-full items-center gap-3",
        "cursor-pointer rounded-xl",
        "px-3 py-2.5 pr-9",
        "text-sm font-medium",
        "text-muted-foreground",
        "transition-all duration-200",
        "outline-none select-none",
        "hover:bg-primary/10 hover:text-primary",
        "focus:bg-primary/10 focus:text-primary",
        "data-highlighted:bg-primary/10",
        "data-highlighted:text-primary",
        "data-disabled:pointer-events-none",
        "data-disabled:opacity-40",
        "[&_svg]:size-4",
        className,
      )}
      {...props}
    >
      <SelectPrimitive.ItemText className="flex flex-1 shrink-0 whitespace-nowrap">
        {children}
      </SelectPrimitive.ItemText>

      <SelectPrimitive.ItemIndicator
        render={
          <span className="pointer-events-none absolute right-3 flex items-center justify-center" />
        }
      >
        <CheckIcon className="size-4 text-primary" />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  );
}

function SelectSeparator({
  className,
  ...props
}: SelectPrimitive.Separator.Props) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("mx-2 my-2 h-px bg-border/60", className)}
      {...props}
    />
  );
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpArrow>) {
  return (
    <SelectPrimitive.ScrollUpArrow
      data-slot="select-scroll-up-button"
      className={cn(
        "flex w-full items-center justify-center",
        "cursor-default py-1",
        "text-muted-foreground",
        className,
      )}
      {...props}
    >
      <ChevronUpIcon className="size-4" />
    </SelectPrimitive.ScrollUpArrow>
  );
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownArrow>) {
  return (
    <SelectPrimitive.ScrollDownArrow
      data-slot="select-scroll-down-button"
      className={cn(
        "flex w-full items-center justify-center",
        "cursor-default py-1",
        "text-muted-foreground",
        className,
      )}
      {...props}
    >
      <ChevronDownIcon className="size-4" />
    </SelectPrimitive.ScrollDownArrow>
  );
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
