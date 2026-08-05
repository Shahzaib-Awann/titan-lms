import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const BatchProgressOverview = ({
  batchProgress,
}: {
  batchProgress?: {
    totalLessonsCount: number;
    completedLessonCount: number;
    activeLessonCount: number;
    skippedLessonCount: number;
    notStartedLessonCount: number;
    progressPercentage: number;
  };
}) => {
  const stats = [
    {
      label: "Active Lessons",
      value: batchProgress?.activeLessonCount ?? 0,
    },
    {
      label: "Skipped Lessons",
      value: batchProgress?.skippedLessonCount ?? 0,
    },
    {
      label: "Completed Lessons",
      value: batchProgress?.completedLessonCount ?? 0,
    },
    {
      label: "Not Started Lessons",
      value: batchProgress?.notStartedLessonCount ?? 0,
    },
  ];

  const completed = batchProgress?.completedLessonCount ?? 0;
  const total = batchProgress?.totalLessonsCount ?? 0;
  const percentage = batchProgress?.progressPercentage ?? 0;

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row justify-between gap-2">
        <div>
          <CardDescription className="font-medium uppercase tracking-wider">
            Course Curriculum Health
          </CardDescription>

          <CardTitle className="text-3xl">
            {completed} of {total} lessons completed
          </CardTitle>
        </div>

        <div className="text-center">
          <h2 className="text-primary text-4xl font-semibold">{percentage}%</h2>

          <p className="text-muted-foreground">Overall completion</p>
        </div>
      </CardHeader>

      <CardContent>
        <Progress value={percentage} variant="green" />
      </CardContent>

      <CardFooter className="flex flex-wrap gap-4 border-none">
        {stats.map(({ label, value }) => (
          <Card
            key={label}
            className="min-w-50 m-px space-y-0 gap-0 rounded-md border-none shadow-sm bg-secondary dark:bg-background/50 p-5"
          >
            <CardDescription className="text-muted-foreground">
              {label}
            </CardDescription>

            <CardTitle className="text-3xl font-semibold">{value}</CardTitle>
          </Card>
        ))}
      </CardFooter>
    </Card>
  );
};

export default BatchProgressOverview;
