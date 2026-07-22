"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BatchFormSchema } from "@/lib/zod/admin.schema";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import toast from "react-hot-toast";
import { CalendarIcon, Loader2, Plus, Trash2 } from "lucide-react";
import z from "zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { saveCourseBatch } from "@/lib/actions/admin/batch.action";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { cn } from "@/lib/utils";
import { WeekDays } from "@/types/common";

type BatchFormValues = z.infer<typeof BatchFormSchema>;

type BatchFormProps = {
  data?: {
    id: string;

    courseId: string;
    trainerId: string;

    batchName: string;

    startDate: string;
    endDate: string | null;

    schedules: {
      id?: string;
      weekday: WeekDays;
      startTime: string;
      endTime: string;
      room: string | null;
    }[];
  };

  trainers: {
    id: string;
    name: string;
  }[];

  courses: {
    id: string;
    title: string;
  }[];
};

export function BatchForm({
  data,
  trainers = [],
  courses = [],
}: BatchFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const isEditMode = !!data?.id;

  const form = useForm<BatchFormValues>({
    resolver: zodResolver(BatchFormSchema),

    defaultValues: {
      id: data?.id ?? "",

      courseId: data?.courseId ?? "",
      trainerId: data?.trainerId ?? "",

      batchName: data?.batchName ?? "",

      startDate: data?.startDate ?? "",
      endDate: data?.endDate ?? "",

      schedules: data?.schedules?.map((schedule) => ({
        id: schedule.id ?? "",

        weekday: schedule.weekday,

        startTime: schedule.startTime,
        endTime: schedule.endTime,

        room: schedule.room ?? "",
      })) ?? [
        {
          weekday: "monday",
          startTime: "",
          endTime: "",
          room: "",
        },
      ],
    },
  });

  const { handleSubmit, control } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "schedules",
  });

  async function onSubmit(values: BatchFormValues) {
    startTransition(async () => {
      try {
        const result = await saveCourseBatch(values);
        if (result.success) {
          toast.success(
            isEditMode
              ? "Batch updated successfully!"
              : "Batch created successfully!",
          );
          router.push("/admin/batches");
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
      {/* Batch Information */}
      <section>
        <div className="mb-5">
          <h3 className="text-base font-semibold">Batch Information</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter the details for this batch.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {/* Course */}
          <Controller
            name="courseId"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <Field className="space-y-2" data-invalid={!!error}>
                <FieldLabel htmlFor="courseId" required>
                  Course
                </FieldLabel>

                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    id="trainerId"
                    className="h-11 rounded-xl capitalize"
                  >
                    <SelectValue placeholder="Select trainer">
                      {
                        courses?.find((course) => course.id === field.value)
                          ?.title
                      }
                    </SelectValue>
                  </SelectTrigger>

                  <SelectContent>
                    {courses?.map((course) => (
                      <SelectItem
                        key={course.id}
                        value={course.id}
                        className="capitalize"
                      >
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <FieldError errors={[error]} />
              </Field>
            )}
          />

          <Controller
            name="trainerId"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <Field className="space-y-2" data-invalid={!!error}>
                <FieldLabel htmlFor="trainerId" required>
                  Trainer
                </FieldLabel>

                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    id="trainerId"
                    className="h-11 rounded-xl capitalize"
                  >
                    <SelectValue placeholder="Select trainer">
                      {
                        trainers?.find((trainer) => trainer.id === field.value)
                          ?.name
                      }
                    </SelectValue>
                  </SelectTrigger>

                  <SelectContent>
                    {trainers?.map((trainer) => (
                      <SelectItem
                        key={trainer.id}
                        value={trainer.id}
                        className="capitalize"
                      >
                        {trainer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <FieldError errors={[error]} />
              </Field>
            )}
          />

          {/* Batch Name */}
          <Controller
            name="batchName"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <Field className="space-y-2" data-invalid={!!error}>
                <FieldLabel htmlFor="batchName" required>
                  Batch Name
                </FieldLabel>

                <Input
                  {...field}
                  id="batchName"
                  placeholder="Morning Web Development Batch"
                  className="h-11 rounded-xl"
                  aria-invalid={!!error}
                />

                <FieldError errors={[error]} />
              </Field>
            )}
          />

          {/* Start Date */}
          <Controller
            name="startDate"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <Field className="space-y-2" data-invalid={!!error}>
                <FieldLabel htmlFor="startDate" required>
                  Start Date
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

                  <PopoverContent className="w-auto p-0" align="start">
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

          {/* End Date */}
          <Controller
            name="endDate"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <Field className="space-y-2" data-invalid={!!error}>
                <FieldLabel htmlFor="endDate">End Date</FieldLabel>

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

                  <PopoverContent className="w-auto p-0" align="start">
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
        </div>
      </section>

      {/* Schedule Information */}
      <section className="mt-8">
        <div className="mb-5">
          <h3 className="text-base font-semibold">Batch Schedule</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Add weekly class schedules.
          </p>
        </div>

        {fields.map((schedule, index) => (
          <div key={schedule.id} className="mb-5 rounded-xl border p-5">
            <div className="grid gap-5 md:grid-cols-5 items-center">
              {/* Weekday */}
              <Controller
                name={`schedules.${index}.weekday`}
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <Field className="space-y-2">
                    <FieldLabel required>Day</FieldLabel>

                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="min-h-11 rounded-xl capitalize">
                        <SelectValue placeholder="Select day" />
                      </SelectTrigger>

                      <SelectContent>
                        {[
                          "monday",
                          "tuesday",
                          "wednesday",
                          "thursday",
                          "friday",
                          "saturday",
                          "sunday",
                        ].map((day) => (
                          <SelectItem
                            key={day}
                            value={day}
                            className="capitalize"
                          >
                            {day}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <FieldError errors={[error]} />
                  </Field>
                )}
              />

              {/* Start Time */}
              <Controller
                name={`schedules.${index}.startTime`}
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <Field className="space-y-2">
                    <FieldLabel required>Start Time</FieldLabel>

                    <Input
                      {...field}
                      type="time"
                      className="h-11 rounded-xl"
                      aria-invalid={!!error}
                    />

                    <FieldError errors={[error]} />
                  </Field>
                )}
              />

              {/* End Time */}
              <Controller
                name={`schedules.${index}.endTime`}
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <Field className="space-y-2">
                    <FieldLabel required>End Time</FieldLabel>

                    <Input
                      {...field}
                      type="time"
                      className="h-11 rounded-xl"
                      aria-invalid={!!error}
                    />

                    <FieldError errors={[error]} />
                  </Field>
                )}
              />

              {/* Room */}
              <Controller
                name={`schedules.${index}.room`}
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <Field className="space-y-2">
                    <FieldLabel>Room</FieldLabel>

                    <Input
                      {...field}
                      placeholder="Room 101"
                      className="h-11 rounded-xl"
                      aria-invalid={!!error}
                    />

                    <FieldError errors={[error]} />
                  </Field>
                )}
              />

              <Button
                type="button"
                variant="destructive"
                className="mt-4"
                onClick={() => remove(index)}
                disabled={fields.length === 1}
              >
                <Trash2 /> Remove Schedule
              </Button>
            </div>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={() =>
            append({
              weekday: "monday",
              startTime: "",
              endTime: "",
              room: "",
            })
          }
        >
          <Plus />
          Add Schedule
        </Button>
      </section>

      {/* Footer */}
      <div className="mt-8 flex justify-end gap-3 border-t border-border pt-6">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push("/admin/batches")}
        >
          Cancel
        </Button>

        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
          {isEditMode ? "Save Changes" : "Create Batch"}
        </Button>
      </div>
    </form>
  );
}
