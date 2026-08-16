import { AssignmentsTable } from "@/components/pages/assignments/assignments-table";
import { getTrainerBatchAssignmentsForDataTable } from "@/lib/actions/assignment.action";

const AssignmentsPage = async ({
  params,
}: {
  params: Promise<{ batchId: string }>;
}) => {
  const { batchId } = await params;

  const assignments = await getTrainerBatchAssignmentsForDataTable(batchId);

  return (
    <div className="space-y-5">
      <AssignmentsTable batchId={batchId} data={assignments} />
    </div>
  );
};

export default AssignmentsPage;
