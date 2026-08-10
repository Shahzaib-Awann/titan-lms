import { AssignmentsTable } from "../../../../../../../components/pages/trainer/assignments/assignments-table";
import { getTrainerBatchAssignmentsForDataTable } from "@/lib/actions/assignment.action";

const AssignmentsPage = async ({
  params,
}: {
  params: Promise<{ batchId: string }>;
}) => {
  const { batchId } = await params;

  const assignments = await getTrainerBatchAssignmentsForDataTable(batchId);

  return (
    <div className="container mx-auto py-10">
      <AssignmentsTable batchId={batchId} data={assignments} />
    </div>
  );
};

export default AssignmentsPage;
