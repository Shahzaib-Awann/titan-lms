import {
  Award,
  CalendarClock,
  CalendarDays,
  CircleCheck,
  ClipboardCheck,
  FileText,
  Link2,
  MessageSquareText,
  Paperclip,
  Send,
  ExternalLink,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDate } from "@/lib/helpers/date-fns";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatUnderscoreLabel } from "@/lib/utils";
import { StudentPortalAssignment } from "../../../app/(pages)/(dashboard)/student/my-courses/[batchId]/assignments/columns";

const InfoItem = ({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
}) => (
  <div className="rounded-md border bg-muted/30 p-4">
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Icon className="size-4 text-primary" />
      <span>{label}</span>
    </div>

    <div className="mt-1">{children}</div>
  </div>
);

const ReferenceLink = ({ title, url }: { title: string; url: string }) => (
  <a
    href={url}
    target="_blank"
    rel="noopener noreferrer"
    className="group flex items-center gap-3 rounded-md border p-3 transition-colors hover:bg-muted/50"
  >
    <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted">
      <Link2 className="size-4 text-primary" />
    </div>

    <div className="min-w-0 flex-1">
      <p className="truncate text-sm font-medium">{title}</p>
      <p className="truncate text-xs text-muted-foreground">{url}</p>
    </div>

    <ExternalLink className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
  </a>
);

const SectionTitle = ({
  icon: Icon,
  children,
}: {
  icon: React.ElementType;
  children: React.ReactNode;
}) => (
  <div className="flex items-center gap-2">
    <Icon className="size-4 text-primary" />
    <p className="font-medium">{children}</p>
  </div>
);

export const ViewAssignmentDialog = ({
  viewDialogOpen,
  setViewDialogOpen,
  assignment,
}: {
  viewDialogOpen: boolean;
  setViewDialogOpen: (open: boolean) => void;
  assignment: StudentPortalAssignment;
}) => {
  const referenceLinks = assignment.assignment_reference_links;
  const submissionLinks =
    assignment.submission?.submission_reference_links ?? [];

  return (
    <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
      <DialogContent className="min-w-5xl overflow-hidden p-0">
        <DialogHeader className="border-b px-6 py-5">
          <DialogTitle>{assignment.title}</DialogTitle>

          <DialogDescription>
            {assignment.moduleName && assignment.lessonName
              ? `${assignment.moduleName} • ${assignment.lessonName}`
              : assignment.moduleName ||
                assignment.lessonName ||
                "Assignment details"}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[75vh]">
          <div className="px-5 pb-5">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Assignment */}
              <Card className="bg-surface-2">
                <CardHeader className="gap-0">
                  <CardTitle>Assignment Information</CardTitle>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Metadata */}
                  <div className="grid grid-cols-2 gap-4">
                    <InfoItem icon={CalendarDays} label="Assigned At">
                      <p className="font-medium">
                        {formatDate(assignment.assignedAt)}
                      </p>
                    </InfoItem>

                    <InfoItem icon={CalendarClock} label="Due Date">
                      <p className="font-medium">
                        {formatDate(assignment.dueAt)}
                      </p>
                    </InfoItem>

                    <InfoItem icon={ClipboardCheck} label="Status">
                      <Badge variant="outline" className="capitalize">
                        {formatUnderscoreLabel(
                          assignment.submission?.status,
                          "Not Submitted",
                        )}
                      </Badge>
                    </InfoItem>

                    <InfoItem icon={Award} label="Maximum Marks">
                      <p className="text-lg font-semibold">
                        {assignment.maxMarks}
                      </p>
                    </InfoItem>
                  </div>

                  <Separator />

                  {/* Instructions */}
                  <div className="space-y-3">
                    <SectionTitle icon={FileText}>Instructions</SectionTitle>

                    <div className="rounded-md border bg-muted/30 p-4">
                      {assignment.instructions ? (
                        <p className="whitespace-pre-wrap text-sm leading-6">
                          {assignment.instructions}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No instructions provided.
                        </p>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Reference links */}
                  <div className="space-y-3">
                    <SectionTitle icon={Link2}>Reference Links</SectionTitle>

                    {referenceLinks.length ? (
                      <div className="space-y-2">
                        {referenceLinks.map((link) => (
                          <ReferenceLink
                            key={link.id}
                            title={link.title}
                            url={link.url}
                          />
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No reference links.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Submission */}
              <Card className="bg-surface-2">
                <CardHeader className="gap-0">
                  <CardTitle>Submission Information</CardTitle>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Submission summary */}
                  <div className="grid grid-cols-2 gap-4">
                    <InfoItem icon={Send} label="Submitted On">
                      {assignment.submission?.submittedAt ? (
                        <p className="font-medium">
                          {formatDate(assignment.submission.submittedAt)}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Not submitted
                        </p>
                      )}
                    </InfoItem>

                    <InfoItem icon={CircleCheck} label="Marks">
                      {assignment.submission?.marksObtained !== null &&
                      assignment.submission?.marksObtained !== undefined ? (
                        <p className="text-lg font-semibold">
                          {assignment.submission.marksObtained}
                          <span className="text-sm font-normal text-muted-foreground">
                            {" "}
                            / {assignment.maxMarks}
                          </span>
                        </p>
                      ) : (
                        <p className="text-sm font-medium text-muted-foreground">
                          Not graded
                        </p>
                      )}
                    </InfoItem>
                  </div>

                  <Separator />

                  {/* Submission Note */}
                  <div className="space-y-3">
                    <SectionTitle icon={MessageSquareText}>
                      Submission Note
                    </SectionTitle>

                    <div className="rounded-md border bg-muted/30 p-4">
                      {assignment.submission?.submissionNote ? (
                        <p className="whitespace-pre-wrap text-sm leading-6">
                          {assignment.submission.submissionNote}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No submission note.
                        </p>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Submission links */}
                  <div className="space-y-3">
                    <SectionTitle icon={Paperclip}>
                      Submission Reference Links
                    </SectionTitle>

                    {submissionLinks.length ? (
                      <div className="space-y-2">
                        {submissionLinks.map((link) => (
                          <ReferenceLink
                            key={link.id}
                            title={link.title}
                            url={link.url}
                          />
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No submission reference links.
                      </p>
                    )}
                  </div>

                  <Separator />

                  {/* Teacher feedback */}
                  <div className="space-y-3">
                    <SectionTitle icon={MessageSquareText}>
                      Teacher Feedback
                    </SectionTitle>

                    <div className="rounded-md border bg-muted/30 p-4">
                      {assignment.submission?.teacherFeedback ? (
                        <p className="whitespace-pre-wrap text-sm leading-6">
                          {assignment.submission.teacherFeedback}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No feedback from teacher.
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
