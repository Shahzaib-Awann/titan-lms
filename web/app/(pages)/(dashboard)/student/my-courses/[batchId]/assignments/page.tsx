import { DataTable } from "@/components/ui/data-table/data-table";
import { columns } from "./columns";
import { getStudentPortalAssignments } from "@/lib/actions/assignment.action";

const AssignmentsPage = async ({
  params,
}: {
  params: Promise<{ batchId: string }>;
}) => {
  const { batchId } = await params;

  const assignments = await getStudentPortalAssignments(batchId);

  return (
    <div className="space-y-5 py-3">
      <DataTable
        columns={columns}
        data={assignments}
        globalFilterColumns={["title", "moduleName", "lessonName"]}
      />
    </div>
  );
};

export default AssignmentsPage;
