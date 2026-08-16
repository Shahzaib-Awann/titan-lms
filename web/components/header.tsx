import { Bell } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "./ui/theme-toggle";
import UserAccountMenu from "./user-account-menu";
import { getCurrentUser } from "@/lib/actions/auth.action";
import NavigationCommand from "./navigation-search";
import Link from "next/link";

export default async function Header() {
  const user = await getCurrentUser();
  return (
    <header className="flex h-16 shrink-0 justify-between items-center gap-4 px-4">
      <SidebarTrigger className="text-white" />

      <NavigationCommand role={user?.role ?? "student"} />

      <div className="flex flex-row gap-4">
        <ThemeToggle />

        {user && (
          <Link href={`/${user?.role}/announcements`}>
            <Button variant="glass" size="icon" className="group">
              <Bell className="size-5 text-muted-foreground transition-colors duration-300 group-hover:text-primary" />
            </Button>
          </Link>
        )}

        {user && (
          <UserAccountMenu
            user={{ ...user, avatarUrl: user.avatarUrl ?? null }}
          />
        )}
      </div>
    </header>
  );
}
