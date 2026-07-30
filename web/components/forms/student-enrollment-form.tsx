"use client";

import React, { useState } from "react";
import {
  Stepper,
  StepperContent,
  StepperIndicator,
  StepperItem,
  StepperNav,
  StepperPanel,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "@/components/ui/stepper";
import { CheckIcon, LoaderCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "../ui/card";
import {
  Course,
  StudentForEnrollmentList,
} from "@/app/(pages)/(dashboard)/admin/enrollments/create/page";
import toast from "react-hot-toast";
import { createStudentEnrollments } from "@/lib/actions/enrollment.action";
import { useRouter } from "next/navigation";
import CourseBatchSelectionStep from "../pages/admin/enrollments/course-selection-step";
import StudentSelectionStep from "../pages/admin/enrollments/student-selection-step";
import EnrollmentConfirmationStep from "../pages/admin/enrollments/enrollment-confirmation-step";

const steps = [
  { title: "Student Selection" },
  { title: "Course Assignment" },
  { title: "Review & Confirm" },
];

const StudentEnrollmentForm = ({ courses }: { courses: Course[] }) => {
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(1);
  // Control whether next button is enabled
  const [canContinue, setCanContinue] = useState(false);

  const [selectedStudents, setSelectedStudents] = useState<
    StudentForEnrollmentList[]
  >([]);
  const [selectedCourseBatch, setSelectedCourseBatch] = useState<{
    courseId: string;
    batchId: string;
  } | null>(null);

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!selectedCourseBatch) {
      toast.error("Please select a course and batch");
      return;
    }

    try {
      const enrollmentData = {
        studentIds: selectedStudents.map((student) => student.id),
        courseId: selectedCourseBatch.courseId,
        batchId: selectedCourseBatch.batchId,
      };

      const response = await createStudentEnrollments(enrollmentData);

      if (response.success) {
        toast.success(response.message);

        router.push("/admin/enrollments");
      }
    } catch (error) {
      console.error("Enrollment failed:", error);

      toast.error(
        error instanceof Error ? error.message : "Failed to create enrollments",
      );
    }
  };

  return (
    <Stepper
      value={currentStep}
      onValueChange={() => {}}
      indicators={{
        completed: <CheckIcon className="size-3.5" />,
        loading: <LoaderCircleIcon className="size-3.5 animate-spin" />,
      }}
      className="flex min-h-full w-full flex-col space-y-8 overflow-hidden"
    >
      <StepperNav className="rounded-xl border border-border bg-surface-2 p-5 px-10 shadow-sm">
        {steps.map((step, index) => (
          <StepperItem
            key={index}
            step={index + 1}
            className="group flex items-center gap-3 cursor-default"
          >
            {/* Disable clicking step */}
            <StepperTrigger className="flex justify-start gap-1.5 cursor-default">
              <StepperIndicator className="size-10 rounded-full border transition-all duration-250 data-[state=active]:border-transparent data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=completed]:border-primary data-[state=completed]:bg-primary data-[state=completed]:text-primary-foreground data-[state=inactive]:border-border data-[state=inactive]:bg-muted data-[state=inactive]:text-muted-foreground ">
                {index + 1}
              </StepperIndicator>

              <StepperTitle className="text-sm font-semibold text-foreground transition-colors group-data-[state=inactive]/step:text-muted-foreground">
                {step.title}
              </StepperTitle>
            </StepperTrigger>

            {steps.length > index + 1 && (
              <StepperSeparator className="group-data-[state=completed]/step:bg-primary md:mx-2.5" />
            )}
          </StepperItem>
        ))}
      </StepperNav>

      <StepperPanel className="text-sm">
        <StepperContent value={1} className="flex items-center justify-center">
          <StudentSelectionStep
            selectedStudents={selectedStudents}
            setSelectedStudents={setSelectedStudents}
            onValidationChange={setCanContinue}
            onNext={handleNext}
          />
        </StepperContent>
        <StepperContent value={2} className="flex items-center justify-center">
          <CourseBatchSelectionStep
            selectedStudents={selectedStudents}
            setSelectedStudents={setSelectedStudents}
            onValidationChange={setCanContinue}
            onNext={handleNext}
            courses={courses}
            selectedCourseId={selectedCourseBatch?.courseId ?? ""}
            selectedBatchId={selectedCourseBatch?.batchId ?? ""}
            onSelectCourseBatch={(courseId, batchId) => {
              setSelectedCourseBatch({
                courseId,
                batchId,
              });
            }}
          />
        </StepperContent>
        <StepperContent
          value={3}
          className="flex flex-col gap-5 items-center justify-center"
        >
          <EnrollmentConfirmationStep
            selectedStudents={selectedStudents}
            selectedCourseId={selectedCourseBatch?.courseId ?? ""}
            selectedBatchId={selectedCourseBatch?.batchId ?? ""}
            courses={courses}
            onValidationChange={setCanContinue}
          />
        </StepperContent>
      </StepperPanel>

      <Card className="shadow-sm flex flex-row justify-between w-full p-5">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 1}
        >
          Back
        </Button>

        <Button
          onClick={currentStep === steps.length ? handleSubmit : handleNext}
          disabled={!canContinue}
        >
          {currentStep === steps.length ? "Confirm Enrollments" : "Proceed"}
        </Button>
      </Card>
    </Stepper>
  );
};

export default StudentEnrollmentForm;
