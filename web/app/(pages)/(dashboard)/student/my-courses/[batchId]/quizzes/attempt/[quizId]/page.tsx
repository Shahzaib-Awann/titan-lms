import { validateQuizAttempt } from "@/lib/actions/quizzes.action";
import ClientAttemptPage from "./_components/client-attempt-page";

const QuizAttemptPage = async ({
  params,
}: {
  params: { quizId: string; batchId: string };
}) => {
  const { quizId, batchId } = await params;

  const result = await validateQuizAttempt(batchId, quizId);

  if (!result?.success) {
    return (
      <div className="flex items-center justify-center h-full">
        (Not Found)
        {result?.error}
      </div>
    );
  }

  return <ClientAttemptPage batchId={batchId} quizId={quizId} />;
};

export default QuizAttemptPage;
