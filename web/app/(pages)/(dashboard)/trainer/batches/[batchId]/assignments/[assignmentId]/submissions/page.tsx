import {
  AlertCircle,
  Award,
  CalendarClock,
  ClipboardCheck,
  FileText,
  Users,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import DashboardStatsGrid from "@/components/pages/dashboards/stats-cards-grid";
import { formatDate } from "@/lib/helpers/date-fns";
import { DataTable } from "@/components/ui/data-table/data-table";
import { columns } from "./columns";
import {
  getAssignmentSubmissionsDatatable,
  getAssignmentSubmissionsSummary,
} from "@/lib/actions/assignment.action";
import { Alert, AlertDescription } from "@/components/ui/alert";

const TrainerSubmissionsPage = async ({
  params,
}: {
  params: Promise<{ batchId: string; assignmentId: string }>;
}) => {
  const { batchId, assignmentId } = await params;

  const [assignmentSummary, assignmentSubmissions] = await Promise.all([
    getAssignmentSubmissionsSummary(batchId, assignmentId),
    getAssignmentSubmissionsDatatable(batchId, assignmentId),
  ]);

  const statsCards = [
    {
      title: "Total Students",
      value: assignmentSummary.stats.totalStudentCount ?? 0,
      icon: Users,
      status: "Students in this batch",
      color: "text-blue-500",
    },
    {
      title: "Submitted",
      value: assignmentSummary.stats.submittedCount ?? 0,
      icon: ClipboardCheck,
      status: "Assignments submitted",
      color: "text-green-500",
    },
    {
      title: "Pending",
      value: assignmentSummary.stats.pendingCount ?? 0,
      icon: CalendarClock,
      status: "Awaiting submission",
      color: "text-orange-500",
    },
    {
      title: "Graded",
      value: assignmentSummary.stats.gradedCount ?? 0,
      icon: Award,
      status: "Submissions graded",
      color: "text-purple-500",
    },
  ];

  return (
    <div className="space-y-5 py-3">
      {/* Assignment header */}
      {assignmentSummary.success ? (
        <>
          <Card>
            <CardContent className="space-y-5 flex justify-between w-full pl-0 pb-5">
              <div className="w-full flex flex-col justify-between">
                <CardHeader>
                  <CardTitle className="text-2xl">
                    {assignmentSummary.assignment.title}
                  </CardTitle>

                  {(assignmentSummary.assignment.moduleName ||
                    assignmentSummary.assignment.lessonName) && (
                    <p className="text-sm text-muted-foreground">
                      {[
                        assignmentSummary.assignment.moduleName,
                        assignmentSummary.assignment.lessonName,
                      ]
                        .filter(Boolean)
                        .join(" • ")}
                    </p>
                  )}
                </CardHeader>

                <CardFooter className="border-t-0">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <FileText className="size-4 text-primary" />
                      <p className="font-medium">Instructions</p>
                    </div>

                    {assignmentSummary.assignment.instructions ? (
                      <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                        {assignmentSummary.assignment.instructions}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No instructions provided.
                      </p>
                    )}
                  </div>
                </CardFooter>
              </div>

              <div className="flex flex-col gap-4">
                <div className="rounded-md border bg-muted/30 p-4">
                  <div className="flex items-center gap-2 text-sm w-35 text-muted-foreground">
                    <CalendarClock className="size-4 text-primary" />
                    <span>Due Date</span>
                  </div>

                  <p className="mt-1 font-medium">
                    {formatDate(assignmentSummary.assignment.dueAt)}
                  </p>
                </div>

                <div className="rounded-md border bg-muted/30 p-4">
                  <div className="flex items-center gap-2 text-sm w-35 text-muted-foreground">
                    <Award className="size-4 text-primary" />
                    <span>Maximum Marks</span>
                  </div>

                  <p className="mt-1 text-lg font-semibold">
                    {assignmentSummary.assignment.maxMarks}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submission stats */}
          <DashboardStatsGrid
            success={assignmentSummary.success}
            cards={statsCards}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          />
        </>
      ) : (
        <Alert variant="destructive" className="flex flex-row items-center">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            We couldn&apos;t load the submissions details.
          </AlertDescription>
        </Alert>
      )}

      {/* Submissions data table */}
      <div className="mt-10">
        <DataTable
          columns={columns}
          data={assignmentSubmissions.submissions}
          globalFilterColumns={["student.fullName", "student.rollNumber"]}
        />
      </div>
    </div>
  );
};

export default TrainerSubmissionsPage;
