import { DataTable } from "@/components/ui/data-table/data-table";
import { columns } from "./columns";
import { getStudentBatchQuizzes } from "@/lib/actions/quizzes.action";

const TrainerQuizzesPage = async ({
  params,
}: {
  params: Promise<{ batchId: string }>;
}) => {
  const { batchId } = await params;

  const { data = [] } = await getStudentBatchQuizzes(batchId);

  return (
    <div className="space-y-5">
      <DataTable
        columns={columns}
        data={data}
        globalFilterColumns={["title", "questionsCount", "status"]}
      />
    </div>
  );
};

export default TrainerQuizzesPage;
