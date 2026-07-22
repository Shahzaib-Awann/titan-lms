import { BatchForm } from "@/components/forms/batch-form";
import {
  getActiveCoursesOptions,
  getActiveTrainerOptions,
} from "@/lib/actions/admin/batch.action";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Batch | Titan LMS",
  description: "Create a new batch for Titan LMS.",
};

export default async function CreateBatchPage() {
  const [trainers, courses] = await Promise.all([
    getActiveTrainerOptions(),
    getActiveCoursesOptions(),
  ]);

  return (
    <main className="flex flex-col gap-6 p-8">
      <header className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Create Batch</h1>

        <p className="mt-2 text-muted-foreground">
          Add a new batch to manage the learning platform.
        </p>
      </header>

      <section className="mt-4">
        <BatchForm trainers={trainers} courses={courses} />
      </section>
    </main>
  );
}
