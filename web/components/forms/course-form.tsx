"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CourseFormSchema } from "@/lib/zod/admin.schema";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import z from "zod";
import { Textarea } from "../ui/textarea";
import { saveCourse } from "@/lib/actions/admin/course.action";

type CourseFormValues = z.infer<typeof CourseFormSchema>;

type CourseFormProps = {
  data?: {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    durationWeeks: number | null;
    feeAmount: number | null;
  };
};

export function CourseForm({ data }: CourseFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const isEditMode = !!data?.id;

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(CourseFormSchema),
    defaultValues: {
      id: data?.id ?? "",
      title: data?.title ?? "",
      slug: data?.slug ?? "",
      description: data?.description ?? "",
      durationWeeks: data?.durationWeeks ?? 1,
      feeAmount: data?.feeAmount ?? 0,
    },
  });

  const { handleSubmit, control } = form;

  async function onSubmit(values: CourseFormValues) {
    startTransition(async () => {
      try {
        const result = await saveCourse(values);
        if (result.success) {
          toast.success(
            isEditMode
              ? "Course updated successfully!"
              : "Course created successfully!",
          );
          router.push("/admin/courses");
        }
      } catch (error) {
        console.error(error);
        const message =
          error instanceof Error ? error.message : "Something went wrong.";
        toast.error(message);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Course Information */}
      <section>
        <div className="mb-5">
          <h3 className="text-base font-semibold">Course Information</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter the details for this course.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {/* Title */}
          <Controller
            name="title"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <Field className="space-y-2" data-invalid={!!error}>
                <FieldLabel htmlFor="title" required>
                  Course Title
                </FieldLabel>

                <Input
                  {...field}
                  id="title"
                  placeholder="Web Development"
                  className="h-11 rounded-xl"
                  aria-invalid={!!error}
                />

                <FieldError errors={[error]} />
              </Field>
            )}
          />

          {/* Slug */}
          <Controller
            name="slug"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <Field className="space-y-2" data-invalid={!!error}>
                <FieldLabel htmlFor="slug" required>
                  Slug
                </FieldLabel>

                <Input
                  {...field}
                  id="slug"
                  placeholder="web-development"
                  className="h-11 rounded-xl"
                  aria-invalid={!!error}
                />

                <FieldError errors={[error]} />

                <p className="text-xs text-muted-foreground">
                  Only lowercase letters, numbers and hyphens.
                </p>
              </Field>
            )}
          />

          {/* Duration */}
          <Controller
            name="durationWeeks"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <Field className="space-y-2" data-invalid={!!error}>
                <FieldLabel htmlFor="durationWeeks" required>
                  Duration (Weeks)
                </FieldLabel>

                <Input
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === ""
                        ? undefined
                        : e.target.valueAsNumber,
                    )
                  }
                  id="durationWeeks"
                  type="number"
                  min={1}
                  placeholder="12"
                  className="h-11 rounded-xl"
                  aria-invalid={!!error}
                />

                <FieldError errors={[error]} />
              </Field>
            )}
          />

          {/* Fee */}
          <Controller
            name="feeAmount"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <Field className="space-y-2" data-invalid={!!error}>
                <FieldLabel htmlFor="feeAmount" required>
                  Fee Amount
                </FieldLabel>

                <Input
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === ""
                        ? undefined
                        : Number(e.target.value),
                    )
                  }
                  id="feeAmount"
                  type="number"
                  min={0}
                  step="50"
                  placeholder="25000"
                  className="h-11 rounded-xl"
                  aria-invalid={!!error}
                />

                <FieldError errors={[error]} />
              </Field>
            )}
          />
        </div>

        {/* Description */}
        <div className="mt-5">
          <Controller
            name="description"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <Field className="space-y-2" data-invalid={!!error}>
                <FieldLabel htmlFor="description" required>
                  Description
                </FieldLabel>

                <Textarea
                  {...field}
                  id="description"
                  rows={6}
                  placeholder="Enter course description..."
                  className="rounded-xl"
                  aria-invalid={!!error}
                />

                <FieldError errors={[error]} />
              </Field>
            )}
          />
        </div>
      </section>

      {/* Footer */}
      <div className="mt-8 flex justify-end gap-3 border-t border-border pt-6">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push("/admin/courses")}
        >
          Cancel
        </Button>

        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
          {isEditMode ? "Save Changes" : "Create Course"}
        </Button>
      </div>
    </form>
  );
}
