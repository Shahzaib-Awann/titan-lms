import { DataTable } from "@/components/ui/data-table/data-table";
import { columns } from "./columns";
import { getQuizzesByBatchIdForDataTable } from "@/lib/actions/quizzes.action";

const TrainerQuizzesPage = async ({
  params,
}: {
  params: Promise<{ batchId: string }>;
}) => {
  const { batchId } = await params;

  const { data = [] } = await getQuizzesByBatchIdForDataTable(batchId);

  return (
    <div className="space-y-5">
      <DataTable
        columns={columns}
        data={data}
        globalFilterColumns={["title", "description", "status"]}
        createButton={{
          icon: true,
          label: "Create Quiz",
          href: `/trainer/batches/${batchId}/quizzes/create`,
        }}
      />
    </div>
  );
};

export default TrainerQuizzesPage;
