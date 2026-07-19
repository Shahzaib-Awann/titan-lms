import { Button } from "@/components/ui/button";
import { Megaphone } from "lucide-react";
import Link from "next/link";

export const Header = () => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Announcements</h1>
        <p className="text-muted-foreground mt-1">
          Manage global and targeted communications for your learning community.
        </p>
      </div>
      <Link href="/admin/announcements/create">
        <Button>
          <Megaphone className="mr-2 h-4 w-4" />
          New Announcement
        </Button>
      </Link>
    </div>
  );
};
