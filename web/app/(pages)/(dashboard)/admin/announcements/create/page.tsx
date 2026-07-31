import { AnnouncementForm } from "@/components/forms/announcement-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Announcement | Titan LMS",
  description: "Create a new announcement for Titan LMS.",
};

export default function CreateAnnouncementPage() {
  return (
    <div className="flex flex-col gap-6 p-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">
          Create Announcement
        </h1>
        <p className="text-muted-foreground mt-2">
          Add a new announcement to manage the learning platform.
        </p>
      </div>

      <div className="mt-4">
        <AnnouncementForm />
      </div>
    </div>
  );
}
