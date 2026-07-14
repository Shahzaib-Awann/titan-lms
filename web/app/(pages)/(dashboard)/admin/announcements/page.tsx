import React from "react";
import { Header } from "../../../../../components/pages/admin/announcements/header";
import { FiltersSidebar } from "../../../../../components/pages/admin/announcements/filters-sidebar";
import { DataTable } from "@/components/ui/data-table/data-table";
import { Announcement, columns } from "./columns";

const AnnouncementsPage = () => {
  const mockData: Announcement[] = [
    {
      id: "1",
      title: "System Maintenance: March 15th",
      description: "Lumina...",
      status: "public",
      audience: "All Members",
      pinned: true,
    },
    {
      id: "2",
      title: "New Course Feature: AI Tutoring",
      description: "We are excite...",
      status: "private",
      audience: "Premium Students",
      pinned: true,
    },
    {
      id: "3",
      title: "Spring Break Office Hours",
      description: "Support office...",
      status: "private",
      audience: "Instructors Only",
      pinned: true,
    },
    {
      id: "4",
      title: "Holiday Schedule Update",
      description: "Important...",
      status: "public",
      audience: "All Members",
      pinned: true,
    },
  ];

  return (
    <div className="container mx-auto py-10 space-y-6">
      <Header />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        <div className="lg:col-span-3">
          <FiltersSidebar />
        </div>
        <div className="lg:col-span-9">
          <DataTable
            columns={columns}
            data={mockData}
            disableSearchBar={true}
            enableViewOptions={false}
            className="py-3 -mt-4"
          />
        </div>
      </div>
    </div>
  );
};

export default AnnouncementsPage;
