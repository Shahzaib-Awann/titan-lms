import { AssignmentForm } from "@/components/forms/assignment-form";
import {
  getAssignmentForEdit,
  getModulesAndLessonsByBatchId,
} from "@/lib/actions/assignment.action";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Assignment | Titan LMS",
  description:
    "Update assignment details, instructions, and lesson settings on Titan LMS.",
};

type EditAssignmentPageProps = {
  params: Promise<{
    batchId: string;
    assignmentId: string;
  }>;
};

export default async function EditAssignmentPage({
  params,
}: EditAssignmentPageProps) {
  const { batchId, assignmentId } = await params;

  const assignment = await getAssignmentForEdit(assignmentId);

  if (!assignment) {
    return (
      <div className="flex w-full items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Assignment Not Found
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            The assignment you are looking for does not exist or may have been
            removed.
          </p>
        </div>
      </div>
    );
  }

  const modulesAndLessons = await getModulesAndLessonsByBatchId(batchId);

  return (
    <div className="flex flex-col gap-6 p-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Edit Assignment</h1>

        <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
          Update the assignment details, instructions, and lesson settings
          before saving your changes.
        </p>
      </div>

      <div className="mt-4">
        <AssignmentForm
          batchId={batchId}
          data={assignment}
          modulesAndLessons={modulesAndLessons}
        />
      </div>
    </div>
  );
}
