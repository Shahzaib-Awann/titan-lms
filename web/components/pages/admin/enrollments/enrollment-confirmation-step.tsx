import React, { useEffect } from "react";
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
  GraduationCap,
  Calendar,
  Clock,
  DollarSign,
  User,
  Phone,
  Sparkles,
  AlertCircle,
  FileCheck,
  UserCheck,
} from "lucide-react";
import {
  Course,
  StudentForEnrollmentList,
} from "../../../../app/(pages)/(dashboard)/admin/enrollments/create/page";
import { formatDate } from "@/lib/helpers/date-fns";
import { BatchScheduleItem } from "../../batch-schedule-item";

interface EnrollmentConfirmationStepProps {
  selectedStudents: StudentForEnrollmentList[];
  selectedCourseId: string;
  selectedBatchId: string;
  courses?: Course[];
  onValidationChange?: (isValid: boolean) => void;
}

export const EnrollmentConfirmationStep = ({
  selectedStudents = [],
  selectedCourseId,
  selectedBatchId,
  courses = [],
  onValidationChange,
}: EnrollmentConfirmationStepProps) => {
  const selectedCourse = courses.find((c) => c.id === selectedCourseId);
  const selectedBatch = selectedCourse?.batches.find(
    (b) => b.id === selectedBatchId,
  );

  const isValid =
    selectedStudents.length > 0 && Boolean(selectedCourse && selectedBatch);

  useEffect(() => {
    onValidationChange?.(isValid);
  }, [isValid, onValidationChange]);

  return (
    <div className="w-full space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel: Selected Students Landscape Grid */}
        <div className="col-span-1 lg:col-span-2">
          <div className="px-6 pt-6 pb-4 border-b bg-muted/20">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                  <FileCheck className="size-4" />
                  <span>Step 3</span>
                </div>
                <h3 className="text-xl font-semibold">
                  Enrolled Students Review
                </h3>
                <p className="text-muted-foreground text-sm">
                  Please review the details below before finalizing the
                  enrollment.
                </p>
              </div>

              <Badge
                variant={selectedStudents.length > 0 ? "default" : "secondary"}
                className="rounded-full px-3 py-1 text-xs font-semibold"
              >
                <UserCheck className="mr-1.5 size-3.5" />
                {selectedStudents.length}{" "}
                {selectedStudents.length === 1 ? "Student" : "Students"}
              </Badge>
            </div>
          </div>

          <div className="p-6 overflow-y-auto flex-1">
            {selectedStudents.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {selectedStudents.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-start gap-3.5 p-4 rounded-lg border border-border/80 bg-card hover:border-primary/40 hover:shadow-sm transition-all duration-200"
                  >
                    <Avatar className="h-12 w-12 border-2 border-primary/20 shrink-0">
                      <AvatarImage
                        src={student.avatar ?? undefined}
                        alt={student.name}
                      />
                      <AvatarFallback
                        initial={student.name}
                        className="text-xs font-bold bg-primary/10 text-primary"
                      />
                    </Avatar>

                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {student.name}
                        </p>
                        <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-mono font-medium text-primary shrink-0">
                          {student.rollNumber}
                        </span>
                      </div>

                      <div className="space-y-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5 truncate">
                          <User className="size-3 text-muted-foreground/70 shrink-0" />
                          <span className="truncate">
                            <strong className="font-medium text-foreground/80">
                              Guardian:
                            </strong>{" "}
                            {student.guardianName || "N/A"}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 font-mono text-muted-foreground/90">
                          <Phone className="size-3 text-muted-foreground/70 shrink-0" />
                          <span>{student.phone || "N/A"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16 border border-dashed border-border rounded-xl flex flex-col items-center justify-center text-center space-y-3 bg-muted/10">
                <div className="p-4 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <AlertCircle className="size-6" />
                </div>
                <div className="space-y-1 max-w-sm">
                  <h4 className="text-sm font-semibold text-foreground">
                    No Students Enrolled
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Please return to Step 1 and select at least one student to
                    complete enrollment.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Course & Batch Summary Overview */}
        <Card className="border col-span-1 max-h-[80vh] flex flex-col rounded-xl shadow-sm overflow-hidden bg-card">
          <CardHeader className="px-6 border-b bg-muted/20">
            <div className="flex items-center gap-2 text-primary font-semibold text-sm">
              <Sparkles className="size-4" />
              <span>Confirmation</span>
            </div>
            <CardTitle className="text-xl">Course & Batch Details</CardTitle>
            <CardDescription className="sr-only">
              Program schedule and fee breakdown summary
            </CardDescription>
          </CardHeader>

          <CardContent className="px-6 space-y-5 overflow-y-auto flex-1">
            {selectedCourse && selectedBatch ? (
              <div className="space-y-5 animate-in fade-in-50 duration-300">
                <div className="px-5 space-y-5 border-l border-border">
                  <span className="text-xs text-muted-foreground uppercase font-semibold">
                    Course
                  </span>
                  <h3 className="text-base mt-1 font-bold capitalize text-foreground">
                    {selectedCourse.title}
                  </h3>
                  <span className="text-xs text-muted-foreground uppercase font-semibold">
                    Batch
                  </span>
                  <p className="text-base mt-1 font-bold capitalize text-foreground tracking-wide">
                    {selectedBatch.batchName}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg border border-border/70 bg-muted/30 space-y-1">
                    <span className="text-xs text-muted-foreground uppercase font-medium flex items-center gap-1">
                      <Clock className="size-3.5 text-primary" /> Program
                      Duration
                    </span>
                    <p className="text-sm font-bold text-foreground">
                      {selectedCourse.durationWeeks} Weeks
                    </p>
                  </div>

                  <div className="p-3 rounded-lg border border-border/70 bg-muted/30 space-y-1">
                    <span className="text-xs text-muted-foreground uppercase font-medium flex items-center gap-1">
                      <DollarSign className="size-3.5 text-primary" /> Per
                      Student Fee
                    </span>
                    <p className="text-sm font-bold text-foreground">
                      PKR {selectedCourse.feeAmount.toLocaleString()}{" "}
                      <span className="text-muted-foreground text-xs">
                        /month
                      </span>
                    </p>
                  </div>
                </div>

                {/* Trainer Card */}
                <div className="p-3.5 rounded-xl border border-border/80 bg-card flex items-center gap-3">
                  <Avatar className="h-10 w-10 border border-primary/20 shrink-0">
                    <AvatarImage
                      src={selectedBatch.trainer.avatar ?? undefined}
                      alt={
                        selectedBatch.trainer.fullName ||
                        selectedBatch.trainer.id
                      }
                    />
                    <AvatarFallback
                      initial={selectedBatch.trainer.fullName}
                      className="text-xs bg-primary/10 text-primary"
                    />
                  </Avatar>
                  <div className="space-y-0.5 min-w-0 flex-1">
                    <span className="text-xs uppercase text-muted-foreground font-medium flex items-center gap-1">
                      Trainer
                    </span>
                    <p className="text-base font-semibold text-foreground truncate leading-tight">
                      {selectedBatch.trainer.fullName}
                    </p>
                    <p className="text-xs text-primary font-medium truncate">
                      {selectedBatch.trainer.specialization}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-border/80 space-y-1">
                  <span className="text-xs text-muted-foreground font-medium uppercase flex items-center gap-1.5">
                    <Calendar className="size-3.5 text-primary" /> Term Timeline
                  </span>
                  <p className="text-xs font-semibold capitalize text-foreground">
                    {formatDate(selectedBatch.startDate)} –{" "}
                    {formatDate(selectedBatch.endDate)}
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="size-3.5 text-primary" /> Class Schedule
                  </span>
                  <div className="space-y-2">
                    {selectedBatch.schedules.map((sch) => (
                      <BatchScheduleItem key={sch.id} schedule={sch} />
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 border border-dashed border-border rounded-xl flex flex-col items-center justify-center text-center space-y-3 bg-muted/10">
                <div className="p-3.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <GraduationCap className="size-6" />
                </div>
                <div className="space-y-1 max-w-xs">
                  <h4 className="text-sm font-semibold text-foreground">
                    Course Not Selected
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Please return to Step 2 to assign a course and batch before
                    confirming enrollment.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EnrollmentConfirmationStep;
