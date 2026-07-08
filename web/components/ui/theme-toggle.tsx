"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="
          relative inline-flex h-11 w-11
          items-center justify-center rounded-xl border
          border-border bg-card text-muted-foreground shadow-sm
          transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30
          hover:bg-accent hover:text-primary hover:shadow-md focus-visible:outline-none
          focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background
        "
      >
        <Sun className="size-5 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0" />

        <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100" />

        <span className="sr-only">
          Toggle theme
        </span>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="min-w-45"
      >
        <DropdownMenuItem
          onClick={() => setTheme("light")}
        >
          <Sun className="mr-2 h-4 w-4" />
          Light
          {theme === "light" && (
            <span className="ml-auto text-primary">
              ✓
            </span>
          )}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => setTheme("dark")}
        >
          <Moon className="mr-2 h-4 w-4" />
          Dark
          {theme === "dark" && (
            <span className="ml-auto text-primary">
              ✓
            </span>
          )}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => setTheme("system")}
        >
          <Monitor className="mr-2 h-4 w-4" />
          System
          {theme === "system" && (
            <span className="ml-auto text-primary">
              ✓
            </span>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}