import { AnnouncementForm } from "@/components/forms/announcement-form";
import { Button } from "@/components/ui/button";
import { getAnnouncementByIdForEdit } from "@/lib/actions/announcements.action";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function EditAnnouncementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const response = await getAnnouncementByIdForEdit(id);

  if (!response.success || !response.data) {
    return (
      <div className="p-6 flex flex-col min-h-[50vh] justify-center items-center">
        <div className="rounded-full bg-destructive/10 p-5">
          <AlertTriangle className="text-destructive size-8" />
        </div>
        <h3 className="text-xl mt-5 font-semibold text-foreground">
          Announcement not found
        </h3>
        <p className="mt-1 text-center text-sm leading-relaxed text-muted-foreground">
          The announcement you are trying to edit does not exist or may have
          been removed.
        </p>
        <Link href="/admin/announcements">
          <Button className="w-full mt-5">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Announcements
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Edit Announcement</h1>

        <p className="mt-2 text-muted-foreground">
          Edit the announcement information.
        </p>
      </div>

      <div className="mt-4">
        <AnnouncementForm data={response.data} />
      </div>
    </div>
  );
}
