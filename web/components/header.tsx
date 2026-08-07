import { Bell, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "./ui/theme-toggle";
import UserAccountMenu from "./user-account-menu";
import { Input } from "./ui/input";
import { getCurrentUser } from "@/lib/actions/auth.action";

export default async function Header() {
  const user = await getCurrentUser();
  return (
    <header className="flex h-16 shrink-0 justify-between items-center gap-4 px-4">
      <SidebarTrigger className="text-white" />

      <Input
        type="text"
        placeholder="Search for courses, lessons, quizzes..."
        wrapperClassName="w-full max-w-lg"
        icon={Search}
      />

      <div className="flex flex-row gap-4">
        <ThemeToggle />

        <Button variant="glass" size="icon" className="group">
          <Bell className="size-5 text-muted-foreground transition-colors duration-300 group-hover:text-primary" />
        </Button>

        {user && (
          <UserAccountMenu
            user={{ ...user, avatarUrl: user.avatarUrl ?? null }}
          />
        )}
      </div>
    </header>
  );
}
