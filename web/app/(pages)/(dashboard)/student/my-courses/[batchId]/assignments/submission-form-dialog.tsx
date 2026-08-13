"use client";

import { useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link2, Loader2, Notebook, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

import { AssignmentSubmissionFormSchema } from "@/lib/zod/trainer.schema";
import { submitAssignment } from "@/lib/actions/assignment.action";
import { StudentPortalAssignment } from "./columns";

type SubmissionFormValues = z.infer<typeof AssignmentSubmissionFormSchema>;

type SubmissionFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignment: StudentPortalAssignment;
};

const SubmissionFormDialog = ({
  open,
  onOpenChange,
  assignment,
}: SubmissionFormDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<SubmissionFormValues>({
    resolver: zodResolver(AssignmentSubmissionFormSchema),
    defaultValues: {
      submissionNote: "",
      referenceLinks: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "referenceLinks",
  });

  // Submit assignment.
  async function onSubmit(values: SubmissionFormValues) {
    try {
      setIsLoading(true);

      const result = await submitAssignment(assignment.assignmentId, values);

      toast.success(result?.message ?? "Assignment submitted successfully");
      router.refresh();

      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error("Assignment submission error:", error);

      toast.error(
        error instanceof Error ? error.message : "Failed to submit assignment",
      );
    } finally {
      setIsLoading(false);
    }
  }

  // Handle dialog close.
  function handleOpenChange(value: boolean) {
    if (isLoading) return;

    onOpenChange(value);

    if (!value) {
      form.reset();
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="min-w-2xl gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b px-6 py-5">
          <DialogTitle>Submit Assignment</DialogTitle>

          <DialogDescription>
            {assignment.moduleName && assignment.lessonName
              ? `${assignment.moduleName} • ${assignment.lessonName}`
              : assignment.moduleName ||
                assignment.lessonName ||
                "Assignment details"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <ScrollArea className="max-h-[70vh] overflow-y-auto">
            <div className="space-y-5 px-6 py-5">
              {/* Assignment details */}
              <div className="space-y-2">
                <h1 className="text-base font-semibold text-foreground/80">
                  Assignment Title:{" "}
                  <span className="font-normal">{assignment.title}</span>
                </h1>

                <p className="text-sm font-semibold text-foreground/80">
                  Max Marks:{" "}
                  <span className="font-normal">{assignment.maxMarks}</span>
                </p>
              </div>

              <Separator />

              {/* Submission note */}
              <Controller
                name="submissionNote"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel
                      htmlFor="submissionNote"
                      className="my-2 flex items-center gap-2"
                    >
                      <Notebook className="size-4 text-primary" />
                      Submission Note
                    </FieldLabel>

                    <Textarea
                      {...field}
                      id="submissionNote"
                      value={field.value ?? ""}
                      disabled={isLoading}
                      placeholder="Add any notes for your teacher..."
                      className="min-h-32 resize-none"
                      maxLength={1000}
                    />

                    <div className="flex items-center justify-between gap-4">
                      <FieldError
                        errors={fieldState.error ? [fieldState.error] : []}
                      />

                      <span className="ml-auto text-xs text-muted-foreground">
                        {field.value?.length ?? 0}/1000
                      </span>
                    </div>
                  </Field>
                )}
              />

              <Separator />

              {/* Reference links */}
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="flex items-center gap-2 text-sm font-medium">
                    <Link2 className="size-4 text-primary" />
                    Reference Links
                  </h3>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      append({
                        id: null,
                        title: "",
                        url: "",
                      })
                    }
                    disabled={isLoading}
                  >
                    <Plus className="mr-2 size-4" />
                    Add Link
                  </Button>
                </div>

                {form.formState.errors.referenceLinks?.message && (
                  <p className="text-sm font-medium text-destructive capitalize">
                    {form.formState.errors.referenceLinks.message}
                  </p>
                )}

                {fields.length === 0 ? (
                  <div className="rounded-lg border border-dashed bg-muted/30 py-10 text-center">
                    <p className="text-sm text-muted-foreground">
                      No reference links.
                    </p>
                  </div>
                ) : (
                  <FieldGroup>
                    {fields.map((field, index) => (
                      <div
                        key={field.id}
                        className="rounded-lg border bg-muted/20 p-4"
                      >
                        <div className="grid grid-cols-[1fr_1fr_auto] gap-4">
                          {/* Link title */}
                          <Controller
                            name={`referenceLinks.${index}.title`}
                            control={form.control}
                            render={({ field, fieldState }) => (
                              <Field data-invalid={fieldState.invalid}>
                                <FieldLabel
                                  htmlFor={`referenceLinks-${index}-title`}
                                >
                                  Link Title
                                </FieldLabel>

                                <Input
                                  {...field}
                                  id={`referenceLinks-${index}-title`}
                                  placeholder="e.g. GitHub Repository"
                                  disabled={isLoading}
                                  maxLength={255}
                                />

                                <FieldError
                                  errors={
                                    fieldState.error ? [fieldState.error] : []
                                  }
                                />
                              </Field>
                            )}
                          />

                          {/* URL */}
                          <Controller
                            name={`referenceLinks.${index}.url`}
                            control={form.control}
                            render={({ field, fieldState }) => (
                              <Field data-invalid={fieldState.invalid}>
                                <FieldLabel
                                  htmlFor={`referenceLinks-${index}-url`}
                                >
                                  URL
                                </FieldLabel>

                                <Input
                                  {...field}
                                  id={`referenceLinks-${index}-url`}
                                  type="url"
                                  placeholder="https://example.com"
                                  disabled={isLoading}
                                />

                                <FieldError
                                  errors={
                                    fieldState.error ? [fieldState.error] : []
                                  }
                                />
                              </Field>
                            )}
                          />

                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="my-auto mt-7 text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => remove(index)}
                            disabled={isLoading}
                          >
                            <Trash2 className="size-4" />
                            <span className="sr-only">
                              Remove reference link
                            </span>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </FieldGroup>
                )}
              </div>
            </div>
          </ScrollArea>

          {/* Form actions */}
          <div className="flex items-center justify-end gap-3 border-t px-6 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
              Submit Assignment
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SubmissionFormDialog;
