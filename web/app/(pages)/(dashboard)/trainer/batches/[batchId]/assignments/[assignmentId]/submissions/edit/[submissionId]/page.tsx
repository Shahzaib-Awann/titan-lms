import SubmissionDetails from "@/components/pages/assignments/submissions/submission-details";

const TrainerSubmissionEditPage = async ({
  params,
}: {
  params: Promise<{
    batchId: string;
    assignmentId: string;
    submissionId: string;
  }>;
}) => {
  const { batchId, assignmentId, submissionId } = await params;

  return (
    <SubmissionDetails
      batchId={batchId}
      assignmentId={assignmentId}
      submissionId={submissionId}
      mode="edit"
    />
  );
};

export default TrainerSubmissionEditPage;
