"use client";

import {
  BookOpen,
  Settings2,
  ChevronRight,
  type LucideIcon,
  GraduationCap,
  BarChart3,
  ClipboardList,
  Users,
  LayoutDashboard,
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
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "User Management",
    url: "/users",
    icon: Users,
    children: [
      { title: "Students", url: "/users/students" },
      { title: "Teachers", url: "/users/teachers" },
      { title: "Administrators", url: "/users/admins" },
    ],
  },
  {
    title: "Courses",
    url: "/courses",
    icon: BookOpen,
    children: [
      { title: "All Courses", url: "/courses" },
      { title: "Categories", url: "/courses/categories" },
      { title: "Create Course", url: "/courses/create" },
    ],
  },
  {
    title: "Assignments",
    url: "/assignments",
    icon: ClipboardList,
    children: [
      { title: "Review Assignments", url: "/assignments/review" },
      { title: "Submissions", url: "/assignments/submissions" },
    ],
  },
  {
    title: "Grades",
    url: "/grades",
    icon: GraduationCap,
  },
  {
    title: "Reports",
    url: "/reports",
    icon: BarChart3,
    children: [
      { title: "Student Progress", url: "/reports/students" },
      { title: "Course Analytics", url: "/reports/courses" },
    ],
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings2,
  },
];

export function NavMain() {
  const pathname = usePathname();
  const { open } = useSidebar();

  const isActive = (url: string) => {
    if (url === "/") return pathname === "/";
    return pathname.startsWith(url);
  };

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
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
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
                        <span className="font-normal">{item.title}</span>
                      )}
                    </Link>
                  </SidebarMenuButton>

                  {open && (
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        className={cn(
                          "flex min-w-9 h-9 items-center justify-center rounded-full transition-colors",
                          "hover:bg-secondary",
                          active
                            ? "text-primary-foreground hover:text-primary dark:hover:text-primary-foreground"
                            : "text-muted-foreground",
                        )}
                      >
                        <ChevronRight className="size-4" />
                      </DropdownMenuTrigger>

                      <DropdownMenuContent side="right" align="start">
                        {item.children.map((child) => (
                          <DropdownMenuItem key={child.title}>
                            <Link
                              href={child.url}
                              className="flex items-center gap-2 w-full"
                            >
                              {child.icon && <child.icon />}
                              <span
                                className={cn(
                                  "flex w-full justify-between items-center",
                                  isActive(child.url) && "text-primary",
                                )}
                              >
                                {child.title}{" "}
                                <span
                                  hidden={!isActive(child.url)}
                                  className="shrink-0 size-1.5 bg-primary rounded-full"
                                />
                              </span>
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
                    "h-11 px-2 rounded-full w-full transition-all duration-300",
                    active
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
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
