import { BatchForm } from "@/components/forms/batch-form";
import {
  getActiveCoursesOptions,
  getActiveTrainerOptions,
  getCourseBatchForEdit,
} from "@/lib/actions/admin/batch.action";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Course Batch | Titan LMS",
  description: "Edit course batch for Titan LMS.",
};

type EditCourseBatchPageProps = {
  params: {
    id: string;
  };
};

export default async function EditCourseBatchPage({
  params,
}: EditCourseBatchPageProps) {
  const { id } = await params;

  const batch = await getCourseBatchForEdit(id);

  if (!batch) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Batch not found.</p>
      </div>
    );
  }

  const [trainers, courses] = await Promise.all([
    getActiveTrainerOptions(),
    getActiveCoursesOptions(),
  ]);

  return (
    <main className="flex flex-col gap-6 p-8">
      <header className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Edit Course Batch</h1>

        <p className="mt-2 text-muted-foreground">
          Edit the course batch information.
        </p>
      </header>

      <section className="mt-4">
        <BatchForm data={batch} trainers={trainers} courses={courses} />
      </section>
    </main>
  );
}
