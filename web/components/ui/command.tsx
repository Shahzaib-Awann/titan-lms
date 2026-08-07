"use client";

import * as React from "react";

import { Command as CommandPrimitive } from "cmdk";
import { SearchIcon, CheckIcon } from "lucide-react";

import { cn } from "@/lib/utils";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { InputGroup, InputGroupAddon } from "@/components/ui/input-group";

function Command({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive>) {
  return (
    <CommandPrimitive
      data-slot="command"
      className={cn(
        [
          "flex size-full flex-col overflow-hidden",
          "rounded-xl",
          "bg-surface-1",
          "border border-border",
          "text-foreground",
          "shadow-card",
          "p-2",
        ],
        className,
      )}
      {...props}
    />
  );
}

function CommandDialog({
  title = "Command Palette",
  description = "Search for a command to run...",
  children,
  className,
  showCloseButton = false,
  ...props
}: Omit<React.ComponentProps<typeof Dialog>, "children"> & {
  title?: string;
  description?: string;
  className?: string;
  showCloseButton?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Dialog {...props}>
      <DialogHeader className="sr-only">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>

      <DialogContent
        className={cn(
          [
            "overflow-hidden",
            "rounded-2xl",
            "border-border",
            "bg-surface-1",
            "p-0",
            "shadow-elevated",
          ],
          className,
        )}
        showCloseButton={showCloseButton}
      >
        {children}
      </DialogContent>
    </Dialog>
  );
}

function CommandInput({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Input>) {
  return (
    <div data-slot="command-input-wrapper" className="p-3 pb-2">
      <InputGroup
        className={cn(
          [
            "h-11",
            "rounded-xl",
            "border border-input bg-card shadow-sm shadow-black/5",
            "transition-colors",
            "focus-within:border-primary",
            "focus-within:ring-2",
            "focus-within:ring-primary/20 pl-7",
          ],
          className,
        )}
      >
        <CommandPrimitive.Input
          data-slot="command-input"
          className={cn([
            "w-full",
            "bg-transparent",
            "text-sm",
            "text-foreground",
            "placeholder:text-muted-foreground",
            "outline-none",
            "pr-4 pl-10",
            "disabled:cursor-not-allowed",
            "disabled:opacity-50",
          ])}
          {...props}
        />

        <InputGroupAddon>
          <SearchIcon
            className="
              pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground
            "
          />
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
}

function CommandList({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.List>) {
  return (
    <CommandPrimitive.List
      data-slot="command-list"
      className={cn(
        [
          "max-h-80",
          "overflow-y-auto",
          "overflow-x-hidden",
          "scroll-py-2",
          "outline-none",
          "px-2",
        ],
        className,
      )}
      {...props}
    />
  );
}

function CommandEmpty({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Empty>) {
  return (
    <CommandPrimitive.Empty
      data-slot="command-empty"
      className={cn(
        ["py-10", "text-center", "text-sm", "text-muted-foreground"],
        className,
      )}
      {...props}
    />
  );
}

function CommandGroup({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Group>) {
  return (
    <CommandPrimitive.Group
      data-slot="command-group"
      className={cn(
        [
          "overflow-hidden",
          "p-1",

          "[&_[cmdk-group-heading]]:px-3",
          "[&_[cmdk-group-heading]]:py-2",

          "[&_[cmdk-group-heading]]:text-xs",
          "[&_[cmdk-group-heading]]:font-medium",
          "[&_[cmdk-group-heading]]:uppercase",
          "[&_[cmdk-group-heading]]:tracking-wide",
          "[&_[cmdk-group-heading]]:text-muted-foreground",
        ],
        className,
      )}
      {...props}
    />
  );
}

function CommandSeparator({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Separator>) {
  return (
    <CommandPrimitive.Separator
      data-slot="command-separator"
      className={cn(["mx-2", "my-2", "h-px", "bg-border"], className)}
      {...props}
    />
  );
}

function CommandItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Item>) {
  return (
    <CommandPrimitive.Item
      data-slot="command-item"
      className={cn(
        [
          "group/command-item",

          "relative",
          "flex",
          "cursor-default",
          "items-center",
          "gap-3",

          "rounded-lg",
          "px-3",
          "py-2.5",

          "text-sm",
          "text-foreground",

          "outline-none",
          "select-none",

          "transition-all",
          "duration-200",

          "data-[disabled=true]:pointer-events-none",
          "data-[disabled=true]:opacity-50",

          // Selected state
          "data-selected:bg-primary/15",
          "data-selected:text-primary",

          // hover
          "hover:bg-secondary",

          "[&_svg]:size-4",
          "[&_svg]:shrink-0",
          "[&_svg]:text-muted-foreground",

          "data-selected:[&_svg]:text-primary",
        ],
        className,
      )}
      {...props}
    >
      {children}

      <CheckIcon
        className="
          ml-auto
          size-4
          opacity-0

          group-data-[checked=true]/command-item:opacity-100
          group-data-[checked=true]/command-item:text-primary
        "
      />
    </CommandPrimitive.Item>
  );
}

function CommandShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="command-shortcut"
      className={cn(
        [
          "ml-auto",
          "rounded-md",
          "bg-surface-3",
          "px-2",
          "py-0.5",

          "text-xs",
          "font-medium",
          "tracking-wide",

          "text-muted-foreground",

          "group-data-selected/command-item:text-primary",
        ],
        className,
      )}
      {...props}
    />
  );
}

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
};
