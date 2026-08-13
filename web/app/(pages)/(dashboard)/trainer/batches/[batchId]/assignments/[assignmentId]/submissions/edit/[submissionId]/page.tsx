import {
  Clock3,
  ExternalLink,
  Link2,
  MessageSquareText,
  Paperclip,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { formatDate } from "@/lib/helpers/date-fns";
import { cn } from "@/lib/utils";
import { getAssignmentSubmissionBySubmissionId } from "@/lib/actions/assignment.action";
import GradingPanel from "../../[submissionId]/grading-panel";

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

  const result = await getAssignmentSubmissionBySubmissionId(
    batchId,
    assignmentId,
    submissionId,
  );

  const { assignment, submission } = result.data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight">
          {assignment.title}
        </h1>

        <div className="flex flex-wrap items-center justify-start gap-4">
          <Avatar className="size-5">
            <AvatarImage
              src={submission.student.avatarUrl ?? undefined}
              alt={submission.student.fullName}
            />

            <AvatarFallback initial={submission.student.fullName} />
          </Avatar>

          <p className="truncate font-medium">{submission.student.fullName}</p>

          <p className="text-sm text-muted-foreground">
            {submission.student.rollNumber}
          </p>

          <Badge
            variant={
              submission.submissionStatus === "graded" ? "success" : "warning"
            }
            className="capitalize"
          >
            {submission.submissionStatus.replace("_", " ")}
          </Badge>

          <span className="text-sm text-muted-foreground">
            {submission.submittedAt
              ? formatDate(submission.submittedAt, {
                  withTime: true,
                })
              : "Not submitted"}
          </span>
        </div>
      </div>

      {/* Submission details */}
      <div className="grid items-start gap-6 lg:grid-cols-4">
        {/* Left */}
        <div className="space-y-6 lg:col-span-3">
          {/* Reference links */}
          <Card className="bg-surface-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Paperclip className="size-4 text-primary" />
                Submission Reference Links
              </CardTitle>
            </CardHeader>

            <CardContent className="grid gap-3 sm:grid-cols-2">
              {submission.submission_reference_links.length > 0 ? (
                submission.submission_reference_links.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 rounded-md border p-3 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted">
                      <Link2 className="size-4 text-primary" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {link.title}
                      </p>

                      <p className="truncate text-xs text-muted-foreground">
                        {link.url}
                      </p>
                    </div>

                    <ExternalLink className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
                  </a>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No submission reference links.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Student note */}
          <Card className="bg-surface-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquareText className="size-4 text-primary" />
                Student Note
              </CardTitle>
            </CardHeader>

            <CardContent>
              {submission.submissionNote ? (
                <p className="whitespace-pre-wrap text-sm leading-6 text-secondary-foreground">
                  {submission.submissionNote}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No student note provided.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Submission timeline */}
          <Card className="bg-surface-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock3 className="size-4 text-primary" />
                Submission Timeline
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="relative space-y-6">
                {/* Assigned */}
                <TimelineItem
                  title="Assignment Assigned"
                  date={assignment.assignedAt}
                  color="primary"
                />

                {/* Submitted */}
                <TimelineItem
                  title="Submitted"
                  date={submission.submittedAt}
                  color="green"
                />

                {/* Graded */}
                <TimelineItem
                  title={submission.gradedAt ? "Graded" : "Pending Grading"}
                  date={submission.gradedAt}
                  color="blue"
                  isLast
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right */}
        <div className="lg:col-span-1">
          <GradingPanel
            batchId={batchId}
            assignmentId={assignmentId}
            submissionId={submission.submissionId}
            marksObtained={submission.marksObtained}
            maxMarks={assignment.maxMarks}
            teacherFeedback={submission.teacherFeedback}
            mode="edit"
          />
        </div>
      </div>
    </div>
  );
};

const TimelineItem = ({
  title,
  date,
  color,
  isLast = false,
}: {
  title: string;
  date: Date | string | null;
  color: "primary" | "green" | "blue";
  isLast?: boolean;
}) => {
  const colors = {
    primary: {
      dot: "bg-primary",
      line: "from-primary via-primary/40 to-transparent",
      icon: "text-primary",
    },
    green: {
      dot: "bg-emerald-500",
      line: "from-emerald-500 via-emerald-300 to-transparent",
      icon: "text-emerald-500",
    },
    blue: {
      dot: "bg-blue-500",
      line: "from-blue-500 via-blue-300 to-transparent",
      icon: "text-blue-500",
    },
  };

  const theme = colors[color];

  return (
    <div className="flex gap-4">
      {/* Timeline */}
      <div className="flex flex-col items-center">
        <div
          className={cn(
            "h-5 w-5 shrink-0 rounded-full border-4 border-card shadow-sm",
            theme.dot,
          )}
        />

        {!isLast && (
          <div
            className={cn(
              "mt-1 min-h-16 w-1 flex-1 rounded-full bg-linear-to-b",
              theme.line,
            )}
          />
        )}
      </div>

      {/* Event */}
      <div className="flex-1 pb-6">
        <div className="space-y-1">
          <p className="font-medium">{title}</p>

          <p className="text-sm text-muted-foreground">
            {date
              ? formatDate(date, {
                  withTime: true,
                })
              : "Not available"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TrainerSubmissionPage;
