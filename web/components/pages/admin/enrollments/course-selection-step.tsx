import React, { useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  BookOpen,
  Calendar,
  Clock,
  GraduationCap,
  MapPin,
  Sparkles,
  DollarSign,
} from "lucide-react";
import {
  Course,
  StudentForEnrollmentList,
} from "../../../../app/(pages)/(dashboard)/admin/enrollments/create/page";
import { formatDay, formatDate, formatTime } from "@/lib/helpers/date-fns";

import { StudentQueueCard } from "./student-queue-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface CourseBatchSelectionStepProps {
  onNext?: () => void;
  onValidationChange?: (isValid: boolean) => void;
  selectedStudents: StudentForEnrollmentList[];
  setSelectedStudents?: React.Dispatch<
    React.SetStateAction<StudentForEnrollmentList[]>
  >;
  courses: Course[];
  selectedCourseId?: string;
  selectedBatchId?: string;
  onSelectCourseBatch?: (courseId: string, batchId: string) => void;
}

export const CourseBatchSelectionStep = ({
  onValidationChange,
  selectedStudents,
  setSelectedStudents,
  courses = [],
  selectedCourseId: propCourseId,
  selectedBatchId: propBatchId,
  onSelectCourseBatch,
}: CourseBatchSelectionStepProps) => {
  const courseId = propCourseId ?? "";
  const batchId = propBatchId ?? "";

  const selectedCourse = courses.find((c) => c.id === courseId);
  const selectedBatch = selectedCourse?.batches.find((b) => b.id === batchId);

  const handleCourseChange = (id: string | null) => {
    onSelectCourseBatch?.(id ?? "", "");
  };

  const handleBatchChange = (id: string | null) => {
    onSelectCourseBatch?.(courseId, id ?? "");
  };

  useEffect(() => {
    const isValid = Boolean(courseId && batchId) && selectedStudents.length > 0;
    onValidationChange?.(isValid);
  }, [courseId, batchId, selectedStudents, onValidationChange]);

  const removeStudent = (id: string) => {
    if (setSelectedStudents) {
      setSelectedStudents((prev) =>
        prev.filter((student) => student.id !== id),
      );
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel: Course & Batch Selection */}
        <Card className="border col-span-1 lg:col-span-2 max-h-[80vh] flex flex-col rounded-xl shadow-sm overflow-hidden">
          <CardHeader className="px-6 pt-6 pb-4 border-b bg-muted/20">
            <div className="flex items-center gap-2 text-primary font-semibold text-sm">
              <BookOpen className="size-4" />
              <span>Step 2</span>
            </div>
            <CardTitle className="text-xl">Course & Batch Allocation</CardTitle>
            <CardDescription>
              Assign a program and schedule for this enrollment cohort.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 space-y-6 overflow-y-auto flex-1">
            {/* Dropdowns Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                  <GraduationCap className="size-4 text-primary" /> Select
                  Course
                </Label>
                <Select value={courseId} onValueChange={handleCourseChange}>
                  <SelectTrigger className="w-full h-11 bg-background min-h-11">
                    <SelectValue placeholder="Choose a course...">
                      {selectedCourse?.title}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        <span className="font-medium">{course.title}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                  <Calendar className="size-4 text-primary" /> Select Batch
                </Label>
                <Select
                  value={batchId}
                  onValueChange={handleBatchChange}
                  disabled={!courseId}
                >
                  <SelectTrigger className="w-full h-11 bg-background disabled:opacity-50 min-h-11">
                    <SelectValue placeholder="Select a course first">
                      {
                        selectedCourse?.batches.find(
                          (batch) => batch.id === batchId,
                        )?.batchName
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {selectedCourse?.batches.map((batch) => (
                      <SelectItem key={batch.id} value={batch.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{batch.batchName}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Info Card when Course & Batch are Selected */}
            {selectedCourse && selectedBatch ? (
              <div className="rounded-xl border border-primary/20 bg-linear-to-br from-primary/3 to-transparent p-5 space-y-5 animate-in fade-in-50 duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/60">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-primary/80">
                      Selected Program
                    </span>
                    <h3 className="text-lg capitalize font-bold text-foreground">
                      {selectedCourse.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className="px-3 py-1 font-medium"
                    >
                      <Clock className="mr-1 size-3.5 text-muted-foreground" />
                      {selectedCourse.durationWeeks} Weeks
                    </Badge>
                    <Badge
                      variant="outline"
                      className="px-3 py-1 font-semibold border-primary/30 text-primary bg-primary/5"
                    >
                      <DollarSign className="mr-0.5 size-3.5" />
                      PKR {selectedCourse.feeAmount.toLocaleString()}/month
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-lg bg-card border border-border/80 space-y-1.5">
                    <span className="text-xs text-muted-foreground font-medium uppercase flex items-center gap-1">
                      <Calendar className="size-3.5 text-primary" /> Batch
                      Duration
                    </span>
                    <p className="text-base font-semibold capitalize text-foreground">
                      {selectedBatch.batchName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(selectedBatch.startDate)} –{" "}
                      {formatDate(selectedBatch.endDate)}
                    </p>
                  </div>

                  {/* TrainerCard */}
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
                      <p className="text-base font-semibold text-foreground truncate capitalize leading-tight">
                        {selectedBatch.trainer.fullName}
                      </p>
                      <p className="text-xs text-primary font-medium truncate">
                        {selectedBatch.trainer.specialization}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="size-3.5 text-primary" /> Weekly Schedule
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {selectedBatch.schedules.map((sch) => (
                      <div
                        key={sch.id}
                        className="p-3 rounded-lg bg-card border border-border/70 flex flex-col gap-1 hover:border-primary/30 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-primary uppercase">
                            {formatDay(sch.weekday)}
                          </span>
                          {sch.room && (
                            <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono flex items-center gap-1">
                              <MapPin className="size-2.5" />
                              {sch.room}
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-medium text-foreground">
                          {formatTime(sch.startTime)} -{" "}
                          {formatTime(sch.endTime)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="border border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center text-center space-y-3 bg-muted/10">
                <div className="p-3.5 rounded-full bg-primary/10 text-primary">
                  <Sparkles className="size-6" />
                </div>
                <div className="space-y-1 max-w-sm">
                  <h4 className="text-sm font-semibold text-foreground">
                    No Course & Batch Selected
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Please choose a course and batch from the dropdowns above to
                    preview schedule details and trainer information.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Panel: Selected Queue (Reused Component) */}
        <StudentQueueCard
          title="Selected Queue"
          description="Students queued for batch assignment"
          selectedStudents={selectedStudents}
          onRemoveStudent={setSelectedStudents ? removeStudent : undefined}
          emptyMessage="Go back to the previous step to add students to this enrollment batch."
        />
      </div>
    </div>
  );
};

export default CourseBatchSelectionStep;
