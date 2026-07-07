"use client";

import * as React from "react";
import { Dialog as SheetPrimitive } from "@base-ui/react/dialog";

import { cn } from "@/lib/utils";
import { XIcon } from "lucide-react";
import { Button } from "./button";

function Sheet({ ...props }: SheetPrimitive.Root.Props) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />;
}

function SheetTrigger({ ...props }: SheetPrimitive.Trigger.Props) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

function SheetClose({ ...props }: SheetPrimitive.Close.Props) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />;
}

function SheetPortal({ ...props }: SheetPrimitive.Portal.Props) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />;
}

function SheetOverlay({ className, ...props }: SheetPrimitive.Backdrop.Props) {
  return (
    <SheetPrimitive.Backdrop
      data-slot="sheet-overlay"
      className={cn(
        "fixed inset-0 z-50",
        "bg-black/40",
        "backdrop-blur-md",
        "transition-all duration-300",
        "data-starting-style:opacity-0",
        "data-ending-style:opacity-0",
        className,
      )}
      {...props}
    />
  );
}

function SheetContent({
  className,
  children,
  side = "right",
  showCloseButton = true,
  ...props
}: SheetPrimitive.Popup.Props & {
  side?: "top" | "right" | "bottom" | "left";
  showCloseButton?: boolean;
}) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Popup
        data-slot="sheet-content"
        data-side={side}
        className={cn(
          "fixed z-50",
          "flex flex-col",
          "overflow-hidden",

          "bg-card",
          "text-card-foreground",

          "border border-border",

          "shadow-2xl shadow-black/30",

          "transition-all duration-300 ease-out",

          "data-starting-style:opacity-0",
          "data-ending-style:opacity-0",

          // Right
          "data-[side=right]:inset-y-3",
          "data-[side=right]:right-3",
          "data-[side=right]:w-100",
          "data-[side=right]:rounded-3xl",
          "data-[side=right]:data-starting-style:translate-x-12",
          "data-[side=right]:data-ending-style:translate-x-12",

          // Left
          "data-[side=left]:inset-y-3",
          "data-[side=left]:left-3",
          "data-[side=left]:w-100",
          "data-[side=left]:rounded-3xl",
          "data-[side=left]:data-starting-style:-translate-x-12",
          "data-[side=left]:data-ending-style:-translate-x-12",

          // Bottom
          "data-[side=bottom]:bottom-3",
          "data-[side=bottom]:left-3",
          "data-[side=bottom]:right-3",
          "data-[side=bottom]:rounded-3xl",
          "data-[side=bottom]:data-starting-style:translate-y-12",

          // Top
          "data-[side=top]:top-3",
          "data-[side=top]:left-3",
          "data-[side=top]:right-3",
          "data-[side=top]:rounded-3xl",
          "data-[side=top]:data-starting-style:-translate-y-12",

          className,
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <SheetPrimitive.Close
            data-slot="sheet-close"
            render={
              <Button
                variant="ghost"
                className="absolute
right-5
top-5
rounded-xl"
                size="sm"
              />
            }
          >
            <XIcon className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </SheetPrimitive.Close>
        )}
      </SheetPrimitive.Popup>
    </SheetPortal>
  );
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn(
        "flex flex-col",
        "gap-2",
        "border-b border-border",
        "px-6 py-5",
        className,
      )}
      {...props}
    />
  );
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn(
        "mt-auto",
        "border-t border-border",
        "bg-muted/30",
        "px-6 py-5",
        "flex flex-col gap-3",
        "sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    />
  );
}

function SheetTitle({ className, ...props }: SheetPrimitive.Title.Props) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn(
        "text-xl",
        "font-semibold",
        "tracking-tight",
        "text-foreground",
        className,
      )}
      {...props}
    />
  );
}

function SheetDescription({
  className,
  ...props
}: SheetPrimitive.Description.Props) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-sm", "leading-6", "text-muted-foreground", className)}
      {...props}
    />
  );
}

function SheetBody({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex-1 overflow-y-auto px-6 py-5", className)}
      {...props}
    />
  );
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetBody,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};
