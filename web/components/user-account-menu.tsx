"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  BadgeCheckIcon,
  BellIcon,
  Loader2Icon,
  LogOutIcon,
} from "lucide-react";
import { useState } from "react";
import { signOut } from "next-auth/react";

const UserAccountMenu = ({
  user,
}: {
  user: { name: string; role: string; avatar: string };
}) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await signOut({ callbackUrl: "/" });
      window.location.href = "/sign-in";
    } catch (error) {
      console.error("Logout failed: ", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="
          relative inline-flex h-11 w-fit
          gap-2 px-2 py-2 group
          items-center justify-center rounded-xl border
          border-border bg-card text-muted-foreground shadow-lg shadow-primary/20
          hover:bg-primary
          transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30
          hover:text-primary hover:shadow-xl hover:shadow-primary/30 focus-visible:outline-none
          focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background
        "
      >
        <Avatar>
          <AvatarImage src={user.avatar} alt={user.name} />
          <AvatarFallback initial={user.name} />
        </Avatar>
        <div className="text-left pr-2 flex flex-col justify-center items-start">
          <p className="text-sm font-medium group-hover:text-primary-foreground transition-all duration-200 capitalize">
            {user.name}
          </p>
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-fit"
        side={"bottom"}
        align="end"
        sideOffset={4}
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="p-0 font-normal">
            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
              <Avatar>
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback initial={user.name} />
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate text-foreground font-medium capitalize">
                  {user.name}
                </span>
                <span className="truncate text-xs text-muted-foreground capitalize">
                  {user.role}
                </span>
              </div>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <BadgeCheckIcon />
            Account
          </DropdownMenuItem>
          <DropdownMenuItem>
            <BellIcon />
            Notifications
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          disabled={isLoggingOut}
          variant="destructive"
        >
          {isLoggingOut && <Loader2Icon className="animate-spin" />}
          <LogOutIcon />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserAccountMenu;
