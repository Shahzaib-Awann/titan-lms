"use client";

import { ChevronRight } from "lucide-react";

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
import { Role } from "@/types/common";
import { getNavByRole } from "@/lib/navigation/links";
import { NavItem } from "@/lib/navigation/types";

export function NavMain({ role }: { role: Role }) {
  // Current page URL
  const pathname = usePathname();
  const { open } = useSidebar();

  // Checks if a menu item matches the current route
  const isRouteActive = (url: string) => {
    return url === "/" ? pathname === "/" : pathname.startsWith(url);
  };

  const navItems = getNavByRole(role);

  return (
    <SidebarGroup className="p-1">
      <SidebarMenu className="space-y-2">
        {navItems.map((item) => {
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
                    "flex items-center rounded-full transition-all duration-300 group p-0",
                    isActive
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "hover:bg-secondary",
                    open ? "h-11 pr-2" : "justify-center w-9 h-9",
                  )}
                >
                  <SidebarMenuButton
                    tooltip={item.title}
                    className={cn(
                      "h-full rounded-full",
                      open ? "w-full px-2" : "w-11 justify-center",
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
                isActive ? "text-primary" : "",
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
