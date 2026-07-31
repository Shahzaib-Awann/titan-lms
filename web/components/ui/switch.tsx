"use client";

import { Switch as SwitchPrimitive } from "@base-ui/react/switch";

import { cn } from "@/lib/utils";

function Switch({
  className,
  size = "default",
  ...props
}: SwitchPrimitive.Root.Props & {
  size?: "sm" | "default";
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        [
          "peer group/switch relative inline-flex shrink-0 items-center",
          "rounded-full border border-transparent",
          "transition-all duration-250 ease-in-out",
          "outline-none",

          // Accessibility
          "after:absolute after:-inset-x-3 after:-inset-y-2",
          "focus-visible:ring-2 focus-visible:ring-[#7658FF]/50",
          "focus-visible:ring-offset-2 focus-visible:ring-offset-background",

          // Sizes
          "data-[size=default]:h-6 data-[size=default]:w-11",
          "data-[size=sm]:h-5 data-[size=sm]:w-9",

          // States
          "data-unchecked:dark:bg-[#262D45]",
          "data-unchecked:bg-[#dbe1f5]",
          "data-checked:bg-[#7658FF]",

          // Premium glow
          "data-checked:shadow-[0_0_18px_rgba(118,88,255,0.35)]",

          // Disabled
          "data-disabled:cursor-not-allowed",
          "data-disabled:opacity-50",
        ].join(" "),
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          [
            "pointer-events-none block rounded-full",
            "shadow-[0_2px_6px_rgba(0,0,0,0.25)]",
            "transition-transform duration-250 ease-in-out",

            // Sizes
            "group-data-[size=default]/switch:size-5",
            "group-data-[size=sm]/switch:size-4",

            // Thumb colors
            "bg-[#F5F7FF]",
            "group-data-[size=default]/switch:data-checked:translate-x-5",
            "group-data-[size=sm]/switch:data-checked:translate-x-4",

            "group-data-[size=default]/switch:data-unchecked:translate-x-0.5",
            "group-data-[size=sm]/switch:data-unchecked:translate-x-0.5",
          ].join(" "),
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
