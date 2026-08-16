"use client";

import { cn } from "@/lib/utils";
import { useSidebar } from "./ui/sidebar";
import Image from "next/image";

export function SideBarHeader() {
  const { open } = useSidebar();

  return (
    <div
      className={cn(
        "flex m-0 items-center overflow-hidden transition-all duration-300",
        open ? "gap-2 p-2" : "gap-0 p-1",
      )}
    >
      <div
        className={cn(
          "relative size-10 shrink-0 overflow-hidden rounded-full bg-primary text-primary-foreground font-bold transition-transform duration-300",
          open ? "scale-100" : "scale-75",
        )}
      >
        <Image
          src="/titan-logo.jpeg"
          alt="Titan LMS"
          fill
          sizes="36px"
          className="object-cover"
        />
      </div>

      <div
        className={cn(
          "overflow-hidden transition-[max-width,opacity] duration-300 ease-in-out",
          open ? "max-w-56 opacity-100" : "max-w-0 opacity-0",
        )}
      >
        <h4 className="whitespace-nowrap font-bold">Titan LMS</h4>
        <p className="whitespace-nowrap text-xs text-gray-400">
          Learn Smart, Learn Fast
        </p>
      </div>
    </div>
  );
}
