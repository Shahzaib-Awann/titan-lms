"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  GraduationCap,
  Calendar,
  Clock,
  DollarSign,
  MapPin,
  Sparkles,
  Users,
  ArrowRight,
  CalendarDays,
} from "lucide-react";
import { StudentEnrollment } from "../../../../app/(pages)/(dashboard)/admin/enrollments/columns";
import { Course } from "../../../../app/(pages)/(dashboard)/admin/enrollments/create/page";
import { formatDate, formatTime, formatDay } from "@/lib/helpers/date-fns";
import { transferStudentEnrollments } from "@/lib/actions/enrollment.action";
import toast from "react-hot-toast";

interface TransferStudentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  students: StudentEnrollment[];
  courses: Course[];
}

export function TransferStudentsDialog({
  open,
  onOpenChange,
  students = [],
  courses = [],
}: TransferStudentsDialogProps) {
  const [isTransferring, setIsTransferring] = useState(false);
  const [selectedCourseBatch, setSelectedCourseBatch] = useState<{
    courseId: string;
    batchId: string;
  } | null>(null);

  const handleCourseChange = (courseId: string | null) => {
    if (!courseId) {
      setSelectedCourseBatch(null);
      return;
    }

    setSelectedCourseBatch({
      courseId,
      batchId: "",
    });
  };

  const selectedCourse = courses.find(
    (c) => c.id === selectedCourseBatch?.courseId,
  );

  const selectedBatch = selectedCourse?.batches.find(
    (b) => b.id === selectedCourseBatch?.batchId,
  );

  const handleTransfer = async () => {
    if (!selectedCourseBatch?.courseId || !selectedCourseBatch?.batchId) {
      return;
    }

    setIsTransferring(true);

    try {
      const payload = {
        studentIds: students.map((student) => student.student.id),
        transferToCourseId: selectedCourseBatch.courseId,
        transferToBatchId: selectedCourseBatch.batchId,
      };

      const response = await transferStudentEnrollments(payload);

      toast.success(response.message || "Students transferred successfully.");
      onOpenChange(false);
    } catch (error) {
      console.error("Transfer failed:", error);

      toast.error(
        error instanceof Error ? error.message : "Failed to transfer students.",
      );
    } finally {
      setIsTransferring(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          setSelectedCourseBatch(null);
        }

        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="min-w-[60vw] max-h-[98vh] overflow-y-auto flex flex-col p-6 gap-5">
        {/* Header */}
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <GraduationCap className="size-5 text-primary" />
            Transfer Course & Batch
          </DialogTitle>
          <DialogDescription>
            Reassign selected students to a new program or batch.
          </DialogDescription>
        </DialogHeader>

        {/* 2-Column Main Content */}
        <div className="grid grid-cols-1 w-full md:grid-cols-2 gap-6 overflow-y-auto pr-1">
          {/* LEFT COLUMN: Selected Students Queue */}
          <div className="flex flex-col space-y-3 rounded-xl border border-border bg-muted/10 py-4">
            <div className="flex items-center justify-between pb-2 border-b border-border/60 px-4">
              <div className="text-base font-semibold flex items-center gap-2">
                <Users className="size-4 text-primary" />
                <span>Selected Students</span>
              </div>
              <Badge
                variant={students.length > 0 ? "default" : "secondary"}
                className="rounded-full px-2.5 py-0.5 text-xs font-medium"
              >
                {students.length}{" "}
                {students.length === 1 ? "Student" : "Students"}
              </Badge>
            </div>

            <div className="space-y-2 py-1 overflow-y-auto flex-1 max-h-[60vh] px-4">
              {students.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between p-3 rounded-lg border border-border/80 bg-card shadow-2xs hover:border-primary/30 transition-all"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <Avatar className="h-11 w-11 border border-border shrink-0">
                      <AvatarImage
                        src={item.student.avatarUrl ?? undefined}
                        alt={item.student.name}
                      />
                      <AvatarFallback
                        initial={item.student.name}
                        className="text-xs font-semibold bg-primary/10 text-primary"
                      />
                    </Avatar>

                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {item.student.name}
                        </p>
                        <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-mono font-medium text-primary">
                          {item.student.rollNumber}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                        <span className="inline-flex items-center gap-1 truncate">
                          <GraduationCap className="size-3 text-muted-foreground/70" />
                          <span className="text-foreground/80 font-medium">
                            {item.course.name}
                          </span>
                        </span>
                        <span className="text-border">•</span>
                        <span className="inline-flex items-center gap-1 truncate">
                          <CalendarDays className="size-3 text-muted-foreground/70" />
                          <span className="text-foreground/80 font-medium">
                            {item.batch.name}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {students.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
                  <p className="text-xs">No students selected for transfer.</p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Target Course/Batch Selection & Preview */}
          <div className="flex flex-col space-y-4 rounded-xl border border-border/80 bg-card p-4">
            <div className="space-y-1 pb-2 border-b border-border/60">
              <h4 className="text-sm font-semibold text-foreground">
                Target Program Selection
              </h4>
              <p className="text-xs text-muted-foreground">
                Choose the destination course and batch for these students.
              </p>
            </div>

            {/* Inputs Container */}
            <div className="space-y-3">
              {/* Select Course */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                  <GraduationCap className="size-3.5 text-primary" /> Target
                  Course
                </Label>
                <Select
                  value={selectedCourseBatch?.courseId ?? ""}
                  onValueChange={handleCourseChange}
                >
                  <SelectTrigger className="w-full bg-background min-h-11">
                    <SelectValue placeholder="Choose a course...">
                      {selectedCourse?.title}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem
                        key={course.id}
                        value={course.id}
                        className="text-xs"
                      >
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Select Batch */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                  <Calendar className="size-3.5 text-primary" /> Target Batch
                </Label>
                <Select
                  value={selectedCourseBatch?.batchId ?? ""}
                  onValueChange={(batchId) => {
                    if (!batchId) {
                      setSelectedCourseBatch(null);
                      return;
                    }

                    setSelectedCourseBatch((prev) =>
                      prev
                        ? {
                            ...prev,
                            batchId,
                          }
                        : null,
                    );
                  }}
                  disabled={!selectedCourseBatch?.courseId}
                >
                  <SelectTrigger className="w-full bg-background disabled:opacity-50 min-h-11">
                    <SelectValue
                      placeholder={
                        selectedCourseBatch?.courseId
                          ? "Select a batch..."
                          : "Select a course first"
                      }
                    >
                      {selectedBatch?.batchName}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {selectedCourse?.batches.map((batch) => (
                      <SelectItem
                        key={batch.id}
                        value={batch.id}
                        className="text-xs"
                      >
                        {batch.batchName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Target Batch Preview Card */}
            {selectedCourse && selectedBatch ? (
              <div className="rounded-lg border border-primary/20 bg-muted/20 p-3.5 space-y-3 animate-in fade-in-50 duration-200 overflow-y-auto flex-1">
                <div className="flex items-center justify-between pb-2 border-b border-border/60">
                  <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                    Destination Info
                  </span>
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

                {/* Trainer Profile Card */}
                {selectedBatch.trainer && (
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
                        New Trainer
                      </span>
                      <p className="text-base font-semibold text-foreground truncate leading-tight">
                        {selectedBatch.trainer.fullName}
                      </p>
                      <p className="text-xs text-primary font-medium truncate">
                        {selectedBatch.trainer.specialization}
                      </p>
                    </div>
                  </div>
                )}

                {/* Timeline */}
                <div className="p-2.5 rounded-md bg-card border border-border/70 text-xs space-y-0.5">
                  <span className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1">
                    <Calendar className="size-3 text-primary" /> Batch Duration
                  </span>
                  <p className="font-semibold text-foreground">
                    {formatDate(selectedBatch.startDate)} –{" "}
                    {formatDate(selectedBatch.endDate)}
                  </p>
                </div>

                {/* Schedule details */}
                <div className="space-y-2.5">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="size-3.5 text-primary" /> Weekly Schedule
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
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
              <div className="flex-1 border border-dashed border-border rounded-lg p-4 flex flex-col items-center justify-center text-center space-y-2 bg-muted/10">
                <Sparkles className="size-5 text-muted-foreground/50" />
                <p className="text-xs text-muted-foreground max-w-50">
                  Select both a target course and batch to preview destination
                  details.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="border-none">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>

          <Button
            disabled={
              isTransferring ||
              !selectedCourseBatch?.courseId ||
              !selectedCourseBatch?.batchId
            }
            onClick={handleTransfer}
            className="gap-2"
          >
            <span>
              {isTransferring ? "Transferring..." : "Confirm Transfer"}
            </span>

            <ArrowRight className="size-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
