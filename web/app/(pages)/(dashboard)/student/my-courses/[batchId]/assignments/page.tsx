import { DataTable } from "@/components/ui/data-table/data-table";
import { columns } from "./columns";
import { getStudentPortalAssignments } from "@/lib/actions/assignment.action";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const AssignmentsPage = async ({
  params,
}: {
  params: Promise<{ batchId: string }>;
}) => {
  const { batchId } = await params;

  const { data: assignments, success } =
    await getStudentPortalAssignments(batchId);

  return (
    <div className="space-y-5 py-3">
      {success ? (
        <DataTable
          columns={columns}
          data={assignments ?? []}
          globalFilterColumns={["title", "moduleName", "lessonName"]}
        />
      ) : (
        <Alert variant="destructive" className="flex flex-row items-center">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            We couldn&apos;t load assignments.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default AssignmentsPage;
