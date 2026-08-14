import { AssignmentForm } from "@/components/forms/assignment-form";
import { getModulesAndLessonsByBatchId } from "@/lib/actions/assignment.action";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "New Assignment | Titan LMS",
  description:
    "Create and publish a new assignment for your batch on Titan LMS.",
};

export default async function CreateAssignmentPage({
  params,
}: {
  params: Promise<{ batchId: string }>;
}) {
  const { batchId } = await params;

  const modulesAndLessons = await getModulesAndLessonsByBatchId(batchId);

  return (
    <div className="flex flex-col gap-6 p-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">
          Create New Assignment
        </h1>
        <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
          Define a new assignment for your batch with all the necessary details,
          instructions, and resources.
        </p>
      </div>

      <div className="mt-4">
        <AssignmentForm
          batchId={batchId}
          modulesAndLessons={modulesAndLessons}
        />
      </div>
    </div>
  );
}
