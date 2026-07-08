"use client";

import {
  SquareTerminal,
  Bot,
  BookOpen,
  Settings2,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type NavItem = {
  title: string;
  url: string;
  icon: LucideIcon;
  children?: {
    title: string;
    url: string;
    icon?: LucideIcon;
  }[];
};

const navLinks: NavItem[] = [
  {
    title: "Playground",
    url: "#",
    icon: SquareTerminal,
    children: [
      { title: "History", url: "#" },
      { title: "Starred", url: "#" },
      { title: "Settings", url: "#" },
    ],
  },
  {
    title: "Models",
    url: "/go",
    icon: Bot,
    children: [
      { title: "Genesis", url: "#" },
      { title: "Explorer", url: "#" },
      { title: "Quantum", url: "#" },
    ],
  },
  {
    title: "Documentation",
    url: "/admin",
    icon: BookOpen,
    children: [
      { title: "Introduction", url: "#", icon: BookOpen },
      { title: "Get Started", url: "#" },
      { title: "Tutorials", url: "#" },
      { title: "Changelog", url: "#" },
    ],
  },
  {
    title: "Settings",
    url: "/#",
    icon: Settings2,
  },
];

const itemStyle = "h-11 px-2 rounded-full w-full transition-all duration-300";

export function NavMain() {
  const pathname = usePathname();
  const { open } = useSidebar();

  const isActive = (url: string) => url !== "#" && pathname.startsWith(url);

  return (
    <SidebarGroup className="p-1">
      <SidebarMenu className="space-y-2">
        {navLinks.map((item) => {
          const active = isActive(item.url);

          return (
            <SidebarMenuItem key={item.title}>
              {item.children ? (
                <div
                  className={cn(
                    "flex items-center rounded-full transition-all duration-300 group",
                    active
                      ? "bg-primary hover:bg-primary/90"
                      : "hover:bg-secondary",
                    open ? "px-2 h-11" : "px-0 justify-center",
                  )}
                >
                  <SidebarMenuButton
                    tooltip={item.title}
                    className={cn(
                      "h-11 rounded-full",
                      open ? "w-full" : "w-11 justify-center",
                    )}
                  >
                    <Link
                      href={item.url}
                      className={cn(
                        "flex items-center",
                        open ? "gap-2 w-full" : "justify-center",
                      )}
                    >
                      <item.icon className="size-5 shrink-0" />

                      {open && (
                        <span className="font-semibold">{item.title}</span>
                      )}
                    </Link>
                  </SidebarMenuButton>

                  {open && (
                    <DropdownMenu>
                      <DropdownMenuTrigger className="min-w-9 h-9 flex items-center justify-center rounded-full hover:bg-secondary">
                        <ChevronRight
                          className={cn(
                            "size-4",
                            active
                              ? "text-foreground"
                              : "text-muted-foreground",
                          )}
                        />
                      </DropdownMenuTrigger>

                      <DropdownMenuContent side="right" align="start">
                        {item.children.map((child) => (
                          <DropdownMenuItem key={child.title}>
                            <Link
                              href={child.url}
                              className="flex items-center gap-2 w-full"
                            >
                              {child.icon && <child.icon />}
                              <span>{child.title}</span>
                            </Link>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              ) : (
                <SidebarMenuButton
                  tooltip={item.title}
                  className={cn(
                    itemStyle,
                    active
                      ? "bg-primary hover:bg-primary/90"
                      : "hover:bg-secondary",
                  )}
                >
                  <Link
                    href={item.url}
                    className={cn(
                      "flex items-center gap-2 w-full",
                      open ? "px-2" : "px-0",
                    )}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              )}
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
