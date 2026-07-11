"use client";

import {
  ChevronRight,
  type LucideIcon,
  Users,
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  BarChart3,
  GraduationCap,
  Settings2,
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
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export type NavItem = {
  title: string;
  url: string;
  icon: LucideIcon;
  children?: {
    title: string;
    url: string;
    icon?: LucideIcon;
    children?: NavItem["children"];
  }[];
};

const navLinks: NavItem[] = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  {
    title: "User Management",
    url: "/users",
    icon: Users,
    children: [
      {
        title: "Students",
        url: "/users/students",
        children: [{ title: "Create Student", url: "/users/students/create" }],
      },
      {
        title: "Teachers",
        url: "/users/teachers",
        children: [{ title: "Create Teacher", url: "/users/teachers/create" }],
      },
      {
        title: "Administrators",
        url: "/users/admins",
        children: [{ title: "Create Admin", url: "/users/admins/create" }],
      },
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
  { title: "Grades", url: "/grades", icon: GraduationCap },
  {
    title: "Reports",
    url: "/reports",
    icon: BarChart3,
    children: [
      { title: "Student Progress", url: "/reports/students" },
      { title: "Course Analytics", url: "/reports/courses" },
    ],
  },
  { title: "Settings", url: "/settings", icon: Settings2 },
];

export function NavMain() {
  // Current page URL
  const pathname = usePathname();
  const { open } = useSidebar();

  // Checks if a menu item matches the current route
  const isRouteActive = (url: string) => {
    return url === "/" ? pathname === "/" : pathname.startsWith(url);
  };

  return (
    <SidebarGroup className="p-1">
      <SidebarMenu className="space-y-2">
        {navLinks.map((item) => {
          const isActive = isRouteActive(item.url);

          // Shared styles for sidebar links
          const linkContainerStyles = cn(
            "flex items-center w-full gap-2 transition-all duration-300",
            open ? "px-2 justify-start" : "px-0 justify-center",
          );

          return (
            <SidebarMenuItem key={item.title}>
              {item.children ? (
                // Menu item with dropdown children
                <div
                  className={cn(
                    "flex items-center rounded-full transition-all duration-300 group h-11",
                    isActive
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "hover:bg-secondary",
                    open ? "px-2" : "px-0 justify-center",
                  )}
                >
                  <SidebarMenuButton
                    tooltip={item.title}
                    className={cn(
                      "h-full rounded-full",
                      open ? "w-full" : "w-11 justify-center",
                    )}
                  >
                    <Link href={item.url} className={linkContainerStyles}>
                      <item.icon className="size-5 shrink-0" />
                      {open && (
                        <span className="font-normal">{item.title}</span>
                      )}
                    </Link>
                  </SidebarMenuButton>

                  {open && (
                    // Dropdown trigger for child links
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        className={cn(
                          "flex min-w-9 h-9 items-center justify-center rounded-full transition-colors",
                          "hover:bg-secondary",
                          isActive
                            ? "text-primary-foreground hover:text-primary dark:hover:text-primary-foreground"
                            : "text-muted-foreground",
                        )}
                      >
                        <ChevronRight className="size-4" />
                      </DropdownMenuTrigger>

                      <DropdownMenuContent side="right" align="start">
                        {/* Passed pathname as a prop here */}
                        <NavDropdownItems
                          items={item.children}
                          pathname={pathname}
                        />
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              ) : (
                // Normal menu item without children
                <SidebarMenuButton
                  tooltip={item.title}
                  className={cn(
                    "h-11 rounded-full w-full transition-all duration-300",
                    isActive
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "hover:bg-secondary",
                    open ? "px-2" : "px-0",
                  )}
                >
                  <Link href={item.url} className={linkContainerStyles}>
                    <item.icon className="size-5 shrink-0" />
                    {open && <span>{item.title}</span>}
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

// Displays nested dropdown menu items
function NavDropdownItems({
  items,
  pathname,
}: {
  items: NavItem["children"];
  pathname: string;
}) {
  return (
    <>
      {items?.map((child) => {
        const isActive = pathname === child.url;
        const hasChildren = child.children && child.children.length > 0;

        if (hasChildren) {
          // Creates another dropdown level
          return (
            <DropdownMenuSub key={child.title}>
              <DropdownMenuSubTrigger className="cursor-pointer">
                <Link
                  href={child.url}
                  className={cn(
                    "flex items-center w-full",
                    isActive && "text-primary font-medium",
                  )}
                >
                  {child.icon && (
                    <child.icon className="size-4 mr-2 shrink-0" />
                  )}
                  <span>{child.title}</span>
                </Link>
              </DropdownMenuSubTrigger>

              <DropdownMenuSubContent>
                <NavDropdownItems items={child.children} pathname={pathname} />
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          );
        }

        // Creates final clickable dropdown link
        return (
          <DropdownMenuItem key={child.title}>
            <Link
              href={child.url}
              className={cn(
                "cursor-pointer w-full flex items-center justify-between",
                isActive ? "text-primary bg-primary/10" : "",
              )}
            >
              <div className="flex items-center">
                {child.icon && <child.icon className="size-4 mr-2 shrink-0" />}
                <span>{child.title}</span>
              </div>

              {isActive && (
                <div className="size-1.5 rounded-full bg-primary ml-2 shrink-0" />
              )}
            </Link>
          </DropdownMenuItem>
        );
      })}
    </>
  );
}
