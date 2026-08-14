import React from "react";
import { ClipboardList, Clock, GraduationCap, UserCheck } from "lucide-react";

import { getStudentBatchOverviewPageData } from "@/lib/actions/batch.action";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Progress } from "@/components/ui/progress";
import DashboardStatsGrid from "@/components/pages/dashboards/stats-cards-grid";

const StudentBatcheOverviewPage = async ({
  params,
}: {
  params: Promise<{ batchId: string }>;
}) => {
  const { batchId } = await params;

  const result = await getStudentBatchOverviewPageData(batchId);

  const stats = result.data?.stats;
  const attendanceStats = result.data?.attendanceStats;

  const attendance = stats?.attendancePercentage ?? 0;

  const cards = [
    {
      title: "Attendance",
      value: `${attendanceStats?.totalPresentCount}/${attendanceStats?.totalAttendanceDaysCount}`,
      icon: UserCheck,
      status: "Your attendance in this batch",
      color: "text-blue-500",
    },
    {
      title: "Course Progress",
      value: stats?.BatchProgressPercentage ?? 0,
      icon: GraduationCap,
      status: "Your course progress",
      color: "text-green-500",
    },
    {
      title: "Assignments",
      value: stats?.totalAssigmentsCount ?? 0,
      icon: ClipboardList,
      status: "Total assignments",
      color: "text-purple-500",
    },
    {
      title: "Pending Assignments",
      value: stats?.pendingAssigmentsCount ?? 0,
      icon: Clock,
      status: "Assignments awaiting submission",
      color: "text-orange-500",
    },
  ];

  const attendanceSummary = [
    {
      label: "Present",
      value: attendanceStats?.totalPresentCount ?? 0,
    },
    {
      label: "Leave",
      value: attendanceStats?.totalLeaveCount ?? 0,
    },
    {
      label: "Absent",
      value: attendanceStats?.totalAbsentCount ?? 0,
    },
  ];

  return (
    <div className="space-y-5">
      <DashboardStatsGrid
        success={result.success}
        cards={cards}
        className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4"
      />

      <Card className="overflow-hidden shadow-sm">
        <CardHeader>
          <CardTitle className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Attendance
          </CardTitle>

          <p className="text-3xl font-bold">{attendance}%</p>
        </CardHeader>

        <CardContent className="space-y-6">
          <Progress
            value={attendance}
            variant={
              attendance > 80 ? "purple" : attendance > 50 ? "amber" : "rose"
            }
            className="h-2"
          />
        </CardContent>

        <CardFooter className="flex flex-wrap gap-4 border-none">
          {attendanceSummary.map(({ label, value }) => (
            <Card
              key={label}
              className="m-px min-w-50 gap-0 space-y-0 rounded-md border-none bg-secondary p-5 shadow-sm dark:bg-background/50"
            >
              <CardDescription className="text-muted-foreground">
                {label}
              </CardDescription>

              <CardTitle className="text-3xl font-semibold">{value}</CardTitle>
            </Card>
          ))}
        </CardFooter>
      </Card>
    </div>
  );
};

export default StudentBatcheOverviewPage;
