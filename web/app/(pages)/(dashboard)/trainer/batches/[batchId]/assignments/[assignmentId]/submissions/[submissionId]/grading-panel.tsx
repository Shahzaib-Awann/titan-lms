"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Award } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AssignmentSubmissionGradingFormSchema } from "@/lib/zod/trainer.schema";
import { useRouter } from "next/navigation";
import { gradeAssignmentSubmission } from "@/lib/actions/assignment.action";

type GradingPanelProps = {
  batchId: string;
  assignmentId: string;
  submissionId: string;
  marksObtained: number | null;
  maxMarks: number;
  teacherFeedback: string | null;
  mode?: "edit" | "readOnly";
};

type GradingFormValues = z.infer<
  ReturnType<typeof AssignmentSubmissionGradingFormSchema>
>;

const GradingPanel = ({
  batchId,
  assignmentId,
  submissionId,
  marksObtained,
  maxMarks,
  teacherFeedback,
  mode = "edit",
}: GradingPanelProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<GradingFormValues>({
    resolver: zodResolver(AssignmentSubmissionGradingFormSchema(maxMarks)),
    defaultValues: {
      marks: marksObtained ?? undefined,
      feedback: teacherFeedback ?? "",
    },
  });

  async function onSubmit(values: GradingFormValues) {
    if (mode === "readOnly") return;

    try {
      setIsLoading(true);

      const result = await gradeAssignmentSubmission({
        submissionId,
        obtainedMarks: String(values.marks),
        teacherFeedback: values.feedback,
      });

      if (!result.success) {
        toast.error("Failed to save grade.");
        return;
      }

      console.log({ result });

      toast.success("Grade saved successfully!");

      router.push(
        `/trainer/batches/${batchId}/assignments/${assignmentId}/submissions`,
      );
    } catch (error) {
      console.error("Grade submission error:", error);

      toast.error(
        error instanceof Error ? error.message : "Failed to save grade.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  function handleCancel() {
    form.reset({
      marks: marksObtained ?? undefined,
      feedback: teacherFeedback ?? "",
    });

    router.back();
  }

  return (
    <Card className="bg-surface-2 lg:sticky lg:top-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="size-4 text-primary" />
          Grading
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldSet>
            <FieldGroup>
              {/* Marks */}
              <Controller
                name="marks"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="marks">Marks</FieldLabel>

                    <div className="flex items-center gap-2">
                      <Input
                        {...field}
                        id="marks"
                        type="number"
                        min={0}
                        step="1"
                        readOnly={mode === "readOnly"}
                        value={field.value ?? ""}
                        onChange={(event) => {
                          const value = event.target.value;

                          field.onChange(
                            value === "" ? undefined : Number(value),
                          );
                        }}
                        disabled={isLoading}
                        placeholder="Enter marks"
                        aria-invalid={fieldState.invalid}
                      />

                      <span className="shrink-0 text-muted-foreground">
                        / {maxMarks}
                      </span>
                    </div>

                    <FieldError
                      errors={fieldState.error ? [fieldState.error] : []}
                    />
                  </Field>
                )}
              />

              <Separator />

              {/* Feedback */}
              <Controller
                name="feedback"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="teacher-feedback">
                      Teacher Feedback
                    </FieldLabel>

                    <Textarea
                      {...field}
                      id="teacher-feedback"
                      disabled={isLoading}
                      readOnly={mode === "readOnly"}
                      placeholder="Add feedback for the student..."
                      className="min-h-50 max-h-100 "
                      maxLength={1000}
                      aria-invalid={fieldState.invalid}
                    />

                    <FieldError
                      errors={fieldState.error ? [fieldState.error] : []}
                    />
                  </Field>
                )}
              />
              {/* Actions */}
              <Field orientation="horizontal" className="justify-end">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-2"
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  {mode === "readOnly" ? "Back" : "Cancel"}
                </Button>

                <Button
                  type="submit"
                  className="flex-1"
                  isLoading={isLoading}
                  disabled={isLoading}
                  hidden={mode === "readOnly"}
                >
                  Save Grade
                </Button>
              </Field>
            </FieldGroup>
          </FieldSet>
        </form>
      </CardContent>
    </Card>
  );
};

export default GradingPanel;
