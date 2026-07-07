"use client";

import * as React from "react";
import { Menu as MenuPrimitive } from "@base-ui/react/menu";

import { cn } from "@/lib/utils";
import { ChevronRightIcon, CheckIcon } from "lucide-react";

function DropdownMenu({ ...props }: MenuPrimitive.Root.Props) {
  return <MenuPrimitive.Root data-slot="dropdown-menu" {...props} />;
}

function DropdownMenuPortal({ ...props }: MenuPrimitive.Portal.Props) {
  return <MenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />;
}

function DropdownMenuTrigger({ ...props }: MenuPrimitive.Trigger.Props) {
  return <MenuPrimitive.Trigger data-slot="dropdown-menu-trigger" {...props} />;
}

function DropdownMenuContent({
  align = "start",
  alignOffset = 0,
  side = "bottom",
  sideOffset = 4,
  className,
  ...props
}: MenuPrimitive.Popup.Props &
  Pick<
    MenuPrimitive.Positioner.Props,
    "align" | "alignOffset" | "side" | "sideOffset"
  >) {
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Positioner
        className="isolate z-50 outline-none"
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
      >
        <MenuPrimitive.Popup
          data-slot="dropdown-menu-content"
          className={cn(
            "z-50",
            "max-h-(--available-height)",
            "w-(--anchor-width)",
            "min-w-55",
            "origin-(--transform-origin)",
            "overflow-hidden",
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
        />
      </MenuPrimitive.Positioner>
    </MenuPrimitive.Portal>
  );
}

function DropdownMenuGroup({ ...props }: MenuPrimitive.Group.Props) {
  return <MenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />;
}

function DropdownMenuLabel({
  className,
  inset,
  ...props
}: MenuPrimitive.GroupLabel.Props & {
  inset?: boolean;
}) {
  return (
    <MenuPrimitive.GroupLabel
      data-slot="dropdown-menu-label"
      data-inset={inset}
      className={cn(
        "px-1.5 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground/80 data-inset:pl-7",
        className,
      )}
      {...props}
    />
  );
}

function DropdownMenuItem({
  className,
  inset,
  variant = "default",
  ...props
}: MenuPrimitive.Item.Props & {
  inset?: boolean;
  variant?: "default" | "destructive";
}) {
  return (
    <MenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "group relative flex items-center gap-3",
        "cursor-pointer",
        "rounded-xl",
        "px-3 py-2.5",
        "text-sm font-medium",
        "text-muted-foreground",
        "transition-all duration-200",
        "hover:bg-primary/10",
        "hover:text-primary",
        "focus:bg-primary/10",
        "focus:text-primary",
        "data-inset:pl-8",
        "data-disabled:pointer-events-none",
        "data-disabled:opacity-40",
        "[&_svg]:size-4",
        "[&_svg]:shrink-0",
        "[&_svg]:text-muted-foreground",
        "hover:[&_svg]:text-primary",
        className,
      )}
      {...props}
    />
  );
}

function DropdownMenuSub({ ...props }: MenuPrimitive.SubmenuRoot.Props) {
  return <MenuPrimitive.SubmenuRoot data-slot="dropdown-menu-sub" {...props} />;
}

function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: MenuPrimitive.SubmenuTrigger.Props & {
  inset?: boolean;
}) {
  return (
    <MenuPrimitive.SubmenuTrigger
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset}
      className={cn(
        "group flex items-center gap-3",
        "rounded-xl",
        "px-3 py-2.5",
        "text-sm font-medium",
        "text-muted-foreground",
        "transition-all duration-200",
        "hover:bg-primary/10",
        "hover:text-primary",
        "focus:bg-primary/10",
        "focus:text-primary",
        "data-popup-open:bg-primary/10",
        "data-popup-open:text-primary",
        "data-open:bg-primary/10",
        "data-open:text-primary",
        "data-inset:pl-8",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto h-4 w-4 text-muted-foreground transition-transform duration-200 group-data-popup-open:translate-x-0.5" />
    </MenuPrimitive.SubmenuTrigger>
  );
}

function DropdownMenuSubContent({
  align = "start",
  alignOffset = -3,
  side = "right",
  sideOffset = 0,
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuContent>) {
  return (
    <DropdownMenuContent
      data-slot="dropdown-menu-sub-content"
      className={cn(
        "min-w-55",
        "rounded-2xl",
        "border border-border/70",
        "bg-card/95",
        "backdrop-blur-xl",
        "p-2",
        "shadow-2xl shadow-black/25",
        "transition-all duration-200",
        className,
      )}
      align={align}
      alignOffset={alignOffset}
      side={side}
      sideOffset={sideOffset}
      {...props}
    />
  );
}

function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  inset,
  ...props
}: MenuPrimitive.CheckboxItem.Props & {
  inset?: boolean;
}) {
  return (
    <MenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      data-inset={inset}
      className={cn(
        "relative flex items-center gap-3",
        "rounded-xl",
        "px-3 py-2.5",
        "text-sm font-medium",
        "text-muted-foreground",
        "transition-all duration-200",
        "hover:bg-primary/10",
        "hover:text-primary",
        "focus:bg-primary/10",
        "focus:text-primary",
        "data-disabled:pointer-events-none",
        "data-disabled:opacity-40",
        className,
      )}
      checked={checked}
      {...props}
    >
      <span
        className="pointer-events-none absolute right-2 flex items-center justify-center"
        data-slot="dropdown-menu-checkbox-item-indicator"
      >
        <MenuPrimitive.CheckboxItemIndicator>
          <CheckIcon className="h-4 w-4 text-primary" />
        </MenuPrimitive.CheckboxItemIndicator>
      </span>
      {children}
    </MenuPrimitive.CheckboxItem>
  );
}

function DropdownMenuRadioGroup({ ...props }: MenuPrimitive.RadioGroup.Props) {
  return (
    <MenuPrimitive.RadioGroup
      data-slot="dropdown-menu-radio-group"
      {...props}
    />
  );
}

function DropdownMenuRadioItem({
  className,
  children,
  inset,
  ...props
}: MenuPrimitive.RadioItem.Props & {
  inset?: boolean;
}) {
  return (
    <MenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      data-inset={inset}
      className={cn(
        "relative flex items-center gap-3",
        "rounded-xl",
        "px-3 py-2.5",
        "text-sm font-medium",
        "text-muted-foreground",
        "transition-all duration-200",
        "hover:bg-primary/10",
        "hover:text-primary",
        "focus:bg-primary/10",
        "focus:text-primary",
        "data-disabled:pointer-events-none",
        "data-disabled:opacity-40",
        className,
      )}
      {...props}
    >
      <span
        className="pointer-events-none absolute right-2 flex items-center justify-center"
        data-slot="dropdown-menu-radio-item-indicator"
      >
        <MenuPrimitive.RadioItemIndicator>
          <CheckIcon className="h-4 w-4 text-primary" />
        </MenuPrimitive.RadioItemIndicator>
      </span>
      {children}
    </MenuPrimitive.RadioItem>
  );
}

function DropdownMenuSeparator({
  className,
  ...props
}: MenuPrimitive.Separator.Props) {
  return (
    <MenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn("mx-2 my-2 h-px bg-border/60", className)}
      {...props}
    />
  );
}

function DropdownMenuShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={cn(
        "ml-auto text-xs font-medium tracking-wide text-muted-foreground group-focus/dropdown-menu-item:text-accent-foreground",
        className,
      )}
      {...props}
    />
  );
}

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
};
