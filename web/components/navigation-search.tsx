"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Command as CommandIcon, ArrowRight } from "lucide-react";

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

import { NavItem } from "@/lib/navigation/types";
import { getNavByRole } from "@/lib/navigation/links";
import { Button } from "./ui/button";

function flattenNav(items: NavItem[]): NavItem[] {
  return items.flatMap((item) => {
    const currentItem =
      item.url !== "#" ? [{ ...item, icon: item.icon ?? ArrowRight }] : [];

    const children = item.children
      ? flattenNav(
          item.children.map((child) => ({
            ...child,
            icon: child.icon ?? ArrowRight,
            children: child.children,
          })),
        )
      : [];

    return [...currentItem, ...children];
  });
}

interface NavigationSearchProps {
  role: string;
}

export default function NavigationCommand({ role }: NavigationSearchProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const navItems = useMemo(() => flattenNav(getNavByRole(role)), [role]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const navigate = useCallback(
    (url: string) => {
      setOpen(false);
      router.push(url);
    },
    [router],
  );

  return (
    <>
      <Button
        type="button"
        onClick={() => setOpen(true)}
        variant="ghost"
        className="group flex max-w-lg h-11 w-full items-center rounded-xl gap-3  border border-border bg-surface-1 px-4 text-sm text-muted-foreground transition-all duration-200 hover:border-primary/40 hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      >
        <Search className="size-4 group-hover:text-primary" />

        <span className="flex-1 text-left">Search navigation...</span>

        <kbd className="hidden items-center gap-1 rounded-md border border-border bg-secondary px-2 py-1 text-[11px] sm:flex">
          <CommandIcon className="size-3" />K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command className="border-none shadow-none outline-none">
          <CommandInput placeholder="Search pages, courses, settings..." />

          <CommandList>
            <CommandEmpty>
              <div className="flex flex-col items-center gap-2">
                <div className="flex p-4 shrink-0 items-center justify-center rounded-md border border-primary/50 bg-primary/10 text-primary">
                  <Search className="size-5" />
                </div>
                <p className="text-sm capitalize text-muted-foreground">
                  No navigation found
                </p>
              </div>
            </CommandEmpty>

            <CommandGroup heading="Navigation">
              {navItems.map((item) => {
                const Icon = item.icon;

                return (
                  <CommandItem
                    key={item.url}
                    value={`${item.title} ${item.url}`}
                    onSelect={() => navigate(item.url)}
                    className="gap-3"
                  >
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-md border border/50-border bg-surface-2/50 text-muted-foreground">
                      {Icon && <Icon className="size-4" />}
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-sm font-medium">
                        {item.title}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {item.url}
                      </span>
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
