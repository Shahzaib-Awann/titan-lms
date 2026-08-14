import React from "react";
import { Users, BookOpenCheck, ClipboardList } from "lucide-react";
import { getTrainerBatchOverviewPageData } from "@/lib/actions/batch.action";
import DashboardStatsGrid from "@/components/pages/dashboards/stats-cards-grid";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { cn } from "@/lib/utils";

const BatchesSlugPage = async ({
  params,
}: {
  params: Promise<{ batchId: string }>;
}) => {
  const { batchId } = await params;

  const result = await getTrainerBatchOverviewPageData(batchId);

  const stats = result.data?.stats;

  const cards = [
    {
      title: "Total Students",
      value: stats?.totalStudentCount ?? 0,
      icon: Users,
      status: "Active students in this batch",
      color: "text-blue-500",
    },
    {
      title: "Batch Progress",
      value: `${stats?.BatchProgressPercentage ?? 0}%`,
      icon: BookOpenCheck,
      status: "Course completion percentage",
      color: "text-green-500",
    },
    {
      title: "Assignments",
      value: stats?.totalAssigmentsCount ?? 0,
      icon: ClipboardList,
      status: "Assignments created for this batch",
      color: "text-purple-500",
    },
  ];

  return (
    <div className="space-y-5">
      <DashboardStatsGrid
        success={result.success}
        cards={cards}
        className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3"
      />

      <BatchRecentEnrollments
        success={result.success}
        enrollments={result.data?.recentEnrollments ?? []}
      />
    </div>
  );
};

const BatchRecentEnrollments = ({
  success,
  enrollments,
}: {
  success: boolean;
  enrollments: {
    studentId: string;
    avatarUrl: string | null;
    fullName: string;
    rollNumber: string;
    status: string;
  }[];
}) => {
  if (!success) {
    return (
      <Card className="overflow-hidden shadow-sm">
        <CardHeader>
          <CardTitle>Recent Enrollments</CardTitle>
          <CardDescription>
            Unable to load recent batch enrollments.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="flex h-56 items-center justify-center rounded-xl border border-dashed border-border bg-muted/20">
            <div className="space-y-2 text-center">
              <p className="font-medium text-foreground">
                Something went wrong
              </p>

              <p className="text-sm text-muted-foreground">
                Please try again later.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md">
      <CardContent className="p-0">
        <CardHeader className="border-b border-border/50">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Batch
            </p>

            <CardTitle className="mt-2 text-2xl">Recent Enrollments</CardTitle>

            <CardDescription className="mt-2">
              Latest students enrolled in this batch.
            </CardDescription>
          </div>
        </CardHeader>

        <Table>
          <TableHeader>
            <TableRow className="border-border/50 hover:bg-transparent">
              <TableHead className="px-6 py-3">Student</TableHead>
              <TableHead>Roll Number</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {enrollments.map((enrollment) => (
              <TableRow
                key={enrollment.studentId}
                className="border-border/40 transition-all duration-200 hover:bg-accent/30"
              >
                <TableCell className="px-6 py-5">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-11 w-11 border border-primary/15 bg-primary/10">
                      {enrollment.avatarUrl && (
                        <AvatarImage
                          src={enrollment.avatarUrl}
                          alt={enrollment.fullName}
                        />
                      )}

                      <AvatarFallback
                        initial={enrollment.fullName}
                        className="bg-primary/10 font-semibold text-primary"
                      />
                    </Avatar>

                    <div>
                      <p className="font-semibold text-foreground">
                        {enrollment.fullName}
                      </p>

                      <p className="text-sm text-muted-foreground">Student</p>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="font-medium">
                  {enrollment.rollNumber}
                </TableCell>

                <TableCell>
                  <Badge
                    className={cn(
                      "rounded-full",
                      enrollment.status === "active"
                        ? "border-0 bg-green/15 text-green"
                        : enrollment.status === "pending"
                          ? "border-0 bg-yellow/15 text-yellow"
                          : "border-0 bg-red/15 text-red",
                    )}
                  >
                    {enrollment.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {enrollments.length === 0 && (
          <div className="flex h-56 items-center justify-center border-t border-border">
            <div className="space-y-2 text-center">
              <p className="font-medium">No enrollments yet</p>

              <p className="text-sm text-muted-foreground">
                Students enrolled in this batch will appear here.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BatchesSlugPage;
