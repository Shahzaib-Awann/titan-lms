"use client";

import * as React from "react";

import { SideBarHeader } from "@/components/side-bar-header";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NavMain } from "./nav-main";
import SideBarFooter from "./side-bar-footer";
import { Role } from "@/types/common";

export function AppSidebar({
  role,
  ...props
}: { role: Role } & React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="floating" collapsible="icon" {...props}>
      <SidebarHeader className="p-0">
        <SideBarHeader />
      </SidebarHeader>
      <SidebarContent className="px-1 py-1">
        <NavMain role={role} />
      </SidebarContent>
      <SidebarFooter>
        <SideBarFooter />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
