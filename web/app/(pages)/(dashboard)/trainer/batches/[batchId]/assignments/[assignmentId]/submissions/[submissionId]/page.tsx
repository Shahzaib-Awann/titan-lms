import SubmissionDetails from "@/components/pages/assignments/submissions/submission-details";

const TrainerSubmissionPage = async ({
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
      mode="readOnly"
    />
  );
};

export default TrainerSubmissionPage;
