import { validateQuizAttempt } from "@/lib/actions/quizzes.action";
import ClientAttemptPage from "@/components/pages/students/quizzes/client-attempt-page";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface QuizAttemptPageProps {
  params: Promise<{
    quizId: string;
    batchId: string;
  }>;
}

const QuizAttemptPage = async ({ params }: QuizAttemptPageProps) => {
  const { quizId, batchId } = await params;

  const result = await validateQuizAttempt(batchId, quizId);

  if (!result.success) {
    return (
      <Alert variant="destructive" className="flex flex-row items-center mt-5">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {result.error ?? "We couldn't load the quiz attempt."}
        </AlertDescription>
      </Alert>
    );
  }

  return <ClientAttemptPage batchId={batchId} quizId={quizId} />;
};

export default QuizAttemptPage;
