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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="floating" collapsible="icon" {...props}>
      <SidebarHeader className="p-0">
        <SideBarHeader />
      </SidebarHeader>
      <SidebarContent className="px-1 py-1">
        <NavMain role={"admin"} />
      </SidebarContent>
      <SidebarFooter>
        <p>Footer</p>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
