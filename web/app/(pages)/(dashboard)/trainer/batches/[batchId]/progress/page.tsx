import {
  getBatchCurriculumProgressRoadmap,
  getBatchLessonProgressSummary,
} from "@/lib/actions/batch.action";
import BatchModulesCard from "../../../../../../../components/pages/trainer/batches/batch-modules-preview";
import BatchProgressOverview from "../../../../../../../components/pages/trainer/batches/batch-progress-overview";

const ProgressPage = async ({
  params,
}: {
  params: Promise<{ batchId: string }>;
}) => {
  const { batchId } = await params;

  const [batchProgress, curriculumRoadmap] = await Promise.all([
    getBatchLessonProgressSummary(batchId),
    getBatchCurriculumProgressRoadmap(batchId, "trainer"),
  ]);

  return (
    <div className="space-y-5 py-3">
      <BatchProgressOverview
        batchProgress={batchProgress.success ? batchProgress.data : undefined}
      />

      <BatchModulesCard
        batchId={batchId}
        modules={curriculumRoadmap.success ? curriculumRoadmap.data : []}
      />
    </div>
  );
};

export default ProgressPage;
