"use client";

import { useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import toast from "react-hot-toast";
import {
  CalendarIcon,
  ExternalLink,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import z from "zod";
import { Separator } from "@/components/ui/separator";
import { AssignmentWithReferencesFormSchema } from "@/lib/zod/trainer.schema";
import { Textarea } from "../ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar } from "../ui/calendar";
import { createOrUpdateAssignment } from "@/lib/actions/assignment.action";
import { AssignmentStatus } from "@/types/common";

type AssignmentFormValues = z.infer<typeof AssignmentWithReferencesFormSchema>;

type AssignmentFormProps = {
  data?: {
    id: string;
    moduleId: string | null;
    lessonId: string | null;
    title: string;
    instructions: string | null;
    maxMarks: number;
    status: AssignmentStatus;
    assignedAt: Date;
    dueAt: Date;
    referenceLinks?: {
      id: string;
      title: string;
      url: string;
    }[];
  };
  batchId: string;
  modulesAndLessons: {
    moduleId: string;
    moduleTitle: string;
    moduleDescription: string | null;
    lessons: {
      lessonId: string;
      lessonTitle: string;
      lessonDescription: string | null;
    }[];
  }[];
};

export function AssignmentForm({
  data,
  batchId,
  modulesAndLessons,
}: AssignmentFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const isEditMode = !!data?.id;

  const form = useForm<AssignmentFormValues>({
    resolver: zodResolver(AssignmentWithReferencesFormSchema),
    defaultValues: {
      id: data?.id ?? null,

      moduleId: data?.moduleId ?? null,
      lessonId: data?.lessonId ?? null,

      title: data?.title ?? "",
      instructions: data?.instructions ?? null,

      maxMarks: data?.maxMarks ?? 100,
      status: data?.status ?? "draft",

      assignedAt: data?.assignedAt ? format(data.assignedAt, "yyyy-MM-dd") : "",
      dueAt: data?.dueAt ? format(data.dueAt, "yyyy-MM-dd") : "",

      referenceLinks:
        data?.referenceLinks?.map((link) => ({
          id: link.id ?? null,
          title: link.title ?? "",
          url: link.url ?? "",
        })) ?? [],
    },
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = form;

  /** * Currently selected module. */
  const selectedModuleId = useWatch({
    name: "moduleId",
    control,
  });

  const availableLessons = useMemo(() => {
    const selectedModule = modulesAndLessons.find(
      (module) => module.moduleId === selectedModuleId,
    );

    return selectedModule?.lessons ?? [];
  }, [modulesAndLessons, selectedModuleId]);

  /**
   * Reference links repeater.
   */
  const { fields, append, remove } = useFieldArray({
    control,
    name: "referenceLinks",
  });

  async function onSubmit(values: AssignmentFormValues) {
    startTransition(async () => {
      try {
        const result = await createOrUpdateAssignment({
          data: values,
          batchId,
        });

        if (result.success) {
          toast.success(
            isEditMode
              ? "Assignment updated successfully!"
              : "Assignment created successfully!",
          );

          router.push(`/trainer/batches/${batchId}/assignments`);
        }
      } catch (error) {
        console.error("Assignment save error:", error);
        const message =
          error instanceof Error
            ? error.message
            : "Something went wrong while saving the assignment.";
        toast.error(message);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-0">
      {/* Assignment Information */}
      <section>
        <div className="mb-5">
          <h3 className="text-base font-semibold">Assignment Information</h3>

          <p className="mt-1 text-sm text-muted-foreground">
            Enter the basic information for this assignment.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {/* Title */}
          <Controller
            name="title"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <Field className="space-y-2 md:col-span-2" data-invalid={!!error}>
                <FieldLabel htmlFor="title" required>
                  Assignment Title
                </FieldLabel>

                <Input
                  {...field}
                  id="title"
                  className="h-11 rounded-xl"
                  placeholder="e.g. Introduction to Algebra"
                  aria-invalid={!!error}
                />

                <FieldError errors={[error]} />
              </Field>
            )}
          />

          {/* Module ID */}
          <Controller
            name="moduleId"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <Field className="space-y-2" data-invalid={!!error}>
                <FieldLabel htmlFor="moduleId">Module</FieldLabel>

                <Select
                  value={field.value ?? null}
                  onValueChange={(value) => {
                    field.onChange(value);

                    setValue("lessonId", null, {
                      shouldValidate: true,
                      shouldDirty: true,
                    });
                  }}
                >
                  <SelectTrigger
                    id="moduleId"
                    className="min-h-11 rounded-xl"
                    aria-invalid={!!error}
                  >
                    <SelectValue placeholder="Select a module">
                      {field.value
                        ? modulesAndLessons.find(
                            (module) => module.moduleId === field.value,
                          )?.moduleTitle
                        : "Select a module"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {modulesAndLessons.length === 0 ? (
                      <SelectItem value="no-modules" disabled>
                        No modules available
                      </SelectItem>
                    ) : (
                      modulesAndLessons.map((module) => (
                        <SelectItem
                          key={module.moduleId}
                          value={module.moduleId}
                        >
                          <div className="flex flex-col text-left">
                            <span>{module.moduleTitle}</span>
                            {module.moduleDescription && (
                              <span className="text-xs text-muted-foreground">
                                {module.moduleDescription}
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>

                <FieldError errors={[error]} />
              </Field>
            )}
          />

          {/* Lesson ID */}
          <Controller
            name="lessonId"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <Field className="space-y-2" data-invalid={!!error}>
                <FieldLabel htmlFor="lessonId">Lesson</FieldLabel>

                <Select
                  value={field.value ?? null}
                  onValueChange={field.onChange}
                  disabled={!selectedModuleId || availableLessons.length === 0}
                >
                  <SelectTrigger
                    id="lessonId"
                    className="min-h-11 rounded-xl"
                    aria-invalid={!!error}
                  >
                    <SelectValue
                      placeholder={
                        !selectedModuleId
                          ? "Select a module first"
                          : availableLessons.length === 0
                            ? "No lessons available"
                            : "Select a lesson"
                      }
                    >
                      {field.value &&
                        availableLessons.find(
                          (lesson) => lesson.lessonId === field.value,
                        )?.lessonTitle}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {availableLessons.map((lesson) => (
                      <SelectItem key={lesson.lessonId} value={lesson.lessonId}>
                        <div className="flex flex-col text-left">
                          <span>{lesson.lessonTitle}</span>
                          {lesson.lessonDescription && (
                            <span className="text-xs text-muted-foreground">
                              {lesson.lessonDescription}
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <FieldError errors={[error]} />
              </Field>
            )}
          />
        </div>
      </section>

      <Separator className="my-8" />

      {/* Instructions */}
      <section>
        <div className="mb-5">
          <h3 className="text-base font-semibold">Instructions</h3>

          <p className="mt-1 text-sm text-muted-foreground">
            Provide instructions or requirements for students.
          </p>
        </div>

        <Controller
          name="instructions"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <Field className="space-y-2" data-invalid={!!error}>
              <FieldLabel htmlFor="instructions">
                Assignment Instructions
              </FieldLabel>

              <Textarea
                id="instructions"
                value={field.value ?? ""}
                onChange={field.onChange}
                className="min-h-40 rounded-xl resize-y"
                placeholder="Write the assignment instructions..."
                aria-invalid={!!error}
              />

              <FieldError errors={[error]} />
            </Field>
          )}
        />
      </section>

      <Separator className="my-8" />

      {/* Marks & Schedule */}
      <section>
        <div className="mb-5">
          <h3 className="text-base font-semibold">Marks & Schedule</h3>

          <p className="mt-1 text-sm text-muted-foreground">
            Configure the assignment marks and submission schedule.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {/* Maximum Marks */}
          <Controller
            name="maxMarks"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <Field className="space-y-2" data-invalid={!!error}>
                <FieldLabel htmlFor="maxMarks" required>
                  Maximum Marks
                </FieldLabel>

                <Input
                  id="maxMarks"
                  type="number"
                  min={0}
                  step="1"
                  className="h-11 rounded-xl"
                  placeholder="100"
                  value={field.value ?? ""}
                  onChange={(event) => {
                    const value = event.target.value;

                    field.onChange(value === "" ? 0 : Number(value));
                  }}
                  aria-invalid={!!error}
                />

                <FieldError errors={[error]} />
              </Field>
            )}
          />

          {/* Status */}
          <Controller
            name="status"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <Field className="space-y-2" data-invalid={!!error}>
                <FieldLabel required>Assignment Status</FieldLabel>

                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="min-h-11 rounded-xl capitalize">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>

                    <SelectItem value="published">Published</SelectItem>

                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>

                <FieldError errors={[error]} />
              </Field>
            )}
          />

          {/* Assigned At */}
          <Controller
            name="assignedAt"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <Field className="space-y-2" data-invalid={!!error}>
                <FieldLabel htmlFor="assignedAt" required>
                  Assigned Date
                </FieldLabel>

                <Popover>
                  <PopoverTrigger
                    render={
                      <Button
                        type="button"
                        variant="outline"
                        className={cn(
                          "h-11 w-full justify-start rounded-xl bg-card text-left font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                      />
                    }
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />

                    {field.value ? (
                      format(new Date(field.value), "yyyy-MM-dd")
                    ) : (
                      <span>Select date</span>
                    )}
                  </PopoverTrigger>

                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(value) => {
                        if (value) {
                          field.onChange(format(value, "yyyy-MM-dd"));
                        }
                      }}
                    />
                  </PopoverContent>
                </Popover>

                <FieldError errors={[error]} />
              </Field>
            )}
          />

          {/* Due At */}
          <Controller
            name="dueAt"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <Field className="space-y-2" data-invalid={!!error}>
                <FieldLabel htmlFor="dueAt" required>
                  Due Date
                </FieldLabel>

                <Popover>
                  <PopoverTrigger
                    render={
                      <Button
                        type="button"
                        variant="outline"
                        className={cn(
                          "h-11 w-full justify-start rounded-xl bg-card text-left font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                      />
                    }
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />

                    {field.value ? (
                      format(new Date(field.value), "yyyy-MM-dd")
                    ) : (
                      <span>Select date</span>
                    )}
                  </PopoverTrigger>

                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(value) => {
                        if (value) {
                          field.onChange(format(value, "yyyy-MM-dd"));
                        }
                      }}
                      disabled={(date) => {
                        const assignedAt = form.getValues("assignedAt");
                        if (!assignedAt) {
                          return false;
                        }
                        const assignedDate = new Date(assignedAt);
                        return date < assignedDate;
                      }}
                    />
                  </PopoverContent>
                </Popover>

                <FieldError errors={[error]} />
              </Field>
            )}
          />
        </div>
      </section>

      <Separator className="my-8" />

      {/* Reference Links */}
      <section>
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold">Reference Links</h3>

            <p className="mt-1 text-sm text-muted-foreground">
              Add useful external resources for students.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            className="shrink-0 rounded-xl"
            onClick={() =>
              append({
                id: null,
                title: "",
                url: "",
              })
            }
          >
            <Plus className="mr-2 size-4" />
            Add Link
          </Button>
        </div>

        <div className="space-y-4">
          {fields.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-muted/30 px-6 py-8 text-center">
              <ExternalLink className="mx-auto mb-3 size-8 text-muted-foreground" />

              <p className="text-sm font-medium">No reference links added</p>

              <p className="mt-1 text-xs text-muted-foreground">
                Add links to helpful resources, articles, videos, or
                documentation.
              </p>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mt-3"
                onClick={() =>
                  append({
                    id: null,
                    title: "",
                    url: "",
                  })
                }
              >
                <Plus className="mr-2 size-4" />
                Add your first link
              </Button>
            </div>
          ) : (
            fields.map((field, index) => (
              <div
                key={field.id}
                className="rounded-xl border border-border bg-muted/20 p-5"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <ExternalLink className="size-4" />
                    </div>

                    <div>
                      <p className="text-sm font-medium">
                        Reference Link {index + 1}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        Add the title and URL
                      </p>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  {/* Link Title */}
                  <Controller
                    name={`referenceLinks.${index}.title`}
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <Field className="space-y-2" data-invalid={!!error}>
                        <FieldLabel
                          htmlFor={`referenceLinks.${index}.title`}
                          required
                        >
                          Link Title
                        </FieldLabel>

                        <Input
                          {...field}
                          id={`referenceLinks.${index}.title`}
                          className="h-11 rounded-xl"
                          placeholder="e.g. MDN Documentation"
                          aria-invalid={!!error}
                        />

                        <FieldError errors={[error]} />
                      </Field>
                    )}
                  />

                  {/* Link URL */}
                  <Controller
                    name={`referenceLinks.${index}.url`}
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <Field className="space-y-2" data-invalid={!!error}>
                        <FieldLabel
                          htmlFor={`referenceLinks.${index}.url`}
                          required
                        >
                          URL
                        </FieldLabel>

                        <div className="relative">
                          <ExternalLink className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                          <Input
                            {...field}
                            id={`referenceLinks.${index}.url`}
                            type="url"
                            className="h-11 rounded-xl pl-10"
                            placeholder="https://example.com"
                            aria-invalid={!!error}
                          />
                        </div>

                        <FieldError errors={[error]} />
                      </Field>
                    )}
                  />
                </div>
              </div>
            ))
          )}

          {/* Array-level error, if you add one later */}
          {errors.referenceLinks?.root?.message && (
            <p className="text-sm text-destructive">
              {errors.referenceLinks.root.message}
            </p>
          )}
        </div>
      </section>

      {/* Footer */}
      <div className="mt-8 flex justify-end gap-3 border-t border-border pt-6">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push(`/trainer/batches/${batchId}/assignments`)}
          disabled={isPending}
        >
          Cancel
        </Button>

        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}

          {isEditMode ? "Save Changes" : "Create Assignment"}
        </Button>
      </div>
    </form>
  );
}
