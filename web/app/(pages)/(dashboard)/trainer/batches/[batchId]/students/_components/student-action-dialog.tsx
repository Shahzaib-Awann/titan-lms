"use client";

import { useState } from "react";
import { ArrowLeft, FileCheck2 } from "lucide-react";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export type StudentAction = "overview" | "assignments" | "submissions";

type Student = {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  rollNumber: string;
};

type Enrollment = {
  id: string;
  status: "active" | "completed" | "transferred" | "dropped" | "suspended";
  enrolledAt: string;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action: StudentAction;
  batchId: string;
  student: Student;
  enrollment: Enrollment;
};

const tabs: {
  value: StudentAction;
  label: string;
}[] = [
  {
    value: "overview",
    label: "Overview",
  },
  {
    value: "assignments",
    label: "Assignments",
  },
  {
    value: "submissions",
    label: "Submissions",
  },
];

export function StudentActionDialog({
  open,
  onOpenChange,
  action,
  batchId,
  student,
  enrollment,
}: Props) {
  const [activeTab, setActiveTab] = useState<StudentAction>(action);

  const handleTabChange = (tab: StudentAction) => {
    setActiveTab(tab);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-auto p-0 max-h-[95vh] max-w-[95vw]">
        <DialogTitle className="sr-only">Student Details</DialogTitle>

        {/* Header */}
        <div className="border-b">
          <div className="flex items-center gap-2 px-6 pt-5 text-sm text-muted-foreground">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="flex items-center gap-1 transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-4" />
              Students
            </button>
          </div>

          <div className="flex items-center justify-between gap-4 px-6 py-5">
            <div className="flex items-center gap-3">
              <Avatar className="size-11">
                <AvatarImage
                  src={student.avatarUrl ?? undefined}
                  alt={student.fullName}
                />
                <AvatarFallback initial={student.fullName} />
              </Avatar>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold">{student.fullName}</h2>

                  <Badge
                    variant="secondary"
                    className={cn(
                      "rounded-lg capitalize",
                      enrollment.status === "active" && "text-green-600",
                      enrollment.status === "completed" && "text-blue-600",
                      enrollment.status === "transferred" && "text-purple-600",
                      enrollment.status === "dropped" && "text-orange-600",
                      enrollment.status === "suspended" && "text-red-600",
                    )}
                  >
                    {enrollment.status}
                  </Badge>
                </div>

                <p className="text-sm text-muted-foreground">
                  {student.rollNumber}
                </p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => handleTabChange(tab.value)}
                className={cn(
                  "border-b-2 px-3 py-2.5 text-sm font-medium transition-colors",
                  activeTab === tab.value
                    ? "border-primary not-odd:text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="max-h-[65vh] overflow-y-auto p-6">
          {activeTab === "overview" && <OverviewTab />}

          {activeTab === "assignments" && <AssignmentsTab />}

          {activeTab === "submissions" && <SubmissionsTab />}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function OverviewTab() {
  return (
    <div className="space-y-8">
      {/* Assignment Activity */}
      <div className="mb-4">
        <h3 className="font-semibold">Assignment Activity</h3>
        <p className="text-sm text-muted-foreground">
          Overview of this student&apos;s assignment progress.
        </p>
      </div>

      <div className="rounded-lg border p-6">
        <div className="flex items-center gap-3">
          <FileCheck2 className="size-5 text-muted-foreground" />

          <div>
            <p className="font-medium">Overview details</p>

            <p className="text-sm text-muted-foreground">
              Overview details will appear here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function AssignmentsTab() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Assignments</h3>

        <p className="text-sm text-muted-foreground">
          All assignments for this student.
        </p>
      </div>

      <div className="rounded-lg border p-6">
        <div className="flex items-center gap-3">
          <FileCheck2 className="size-5 text-muted-foreground" />

          <div>
            <p className="font-medium">Student assignments</p>

            <p className="text-sm text-muted-foreground">
              Assignment list will appear here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SubmissionsTab() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Submissions</h3>

        <p className="text-sm text-muted-foreground">
          Review and grade this student&apos;s submissions.
        </p>
      </div>

      <div className="rounded-lg border p-6">
        <div className="flex items-center gap-3">
          <FileCheck2 className="size-5 text-muted-foreground" />

          <div>
            <p className="font-medium">Student submissions</p>

            <p className="text-sm text-muted-foreground">
              Submission list will appear here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
