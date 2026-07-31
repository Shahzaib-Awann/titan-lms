import React, { Suspense } from "react";
import { FiltersSidebar } from "../../../../../components/pages/admin/announcements/filters-sidebar";
import { DataTable } from "@/components/ui/data-table/data-table";
import { columns } from "./columns";
import { getAdminAnnouncementsDatatable } from "@/lib/actions/announcements.action";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Megaphone } from "lucide-react";

interface AnnouncementsPageProps {
  searchParams: Promise<{
    audience?: "all" | "trainers" | "students";
    visibility?: "public" | "private";
    startDate?: string; //
    endDate?: string;
  }>;
}

const AnnouncementsPage = async ({ searchParams }: AnnouncementsPageProps) => {
  const params = await searchParams;
  const { audience, visibility, startDate, endDate } = params;

  const response = await getAdminAnnouncementsDatatable({
    audience,
    visibility,
    startDate,
    endDate,
  });

  return (
    <div className="container mx-auto py-10 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Announcements</h1>
          <p className="text-muted-foreground mt-1">
            Manage global and targeted communications for your learning
            community.
          </p>
        </div>
        <Link href="/admin/announcements/create">
          <Button>
            <Megaphone className="mr-2 h-4 w-4" />
            New Announcement
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        <div className="lg:col-span-3">
          <Suspense fallback={<div>Loading filters...</div>}>
            <FiltersSidebar />
          </Suspense>
        </div>

        <div className="lg:col-span-9">
          <DataTable
            columns={columns}
            data={response.data}
            enableViewOptions={false}
            globalFilterColumns={[
              "title",
              "description",
              "audience",
              "createdBy.name",
            ]}
            className=""
          />
        </div>
      </div>
    </div>
  );
};

export default AnnouncementsPage;
