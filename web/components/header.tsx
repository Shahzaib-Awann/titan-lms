import { Bell, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "./ui/theme-toggle";

export default function Header() {
  return (
    <header className="flex h-16 shrink-0 justify-between items-center gap-4 px-4">
      <SidebarTrigger className="text-white" />

      <div className="flex flex-1 items-center gap-3 max-w-lg w-full rounded-xl border border-white/10 bg-[#121827] px-4 py-3">
        <Search size={18} />

        <input
          placeholder="Search for courses, lessons, quizzes..."
          className="w-full bg-transparent text-sm text-white outline-none"
        />
      </div>

      <div className="flex flex-row gap-4">
        <ThemeToggle />

        <Button variant="glass" size="icon" className="group">
          <Bell className="size-5 text-muted-foreground transition-colors duration-300 group-hover:text-primary" />
        </Button>

        <Button className="flex items-center gap-3 rounded-xl bg-[#121827] px-4 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-600 font-medium text-white">
            U
          </div>

          <div className="text-sm text-white">
            <p>User</p>
            <span className="text-xs text-gray-400">Student</span>
          </div>
        </Button>
      </div>
    </header>
  );
}
