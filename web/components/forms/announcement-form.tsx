"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnnouncementFormSchema } from "@/lib/zod/admin.schema";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import toast from "react-hot-toast";
import { CalendarIcon, Loader2 } from "lucide-react";
import z from "zod";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { cn } from "@/lib/utils";
import { Switch } from "../ui/switch";
import { Separator } from "../ui/separator";
import { saveAnnouncement } from "@/lib/actions/announcements.action";

type AnnouncementFormValues = z.infer<typeof AnnouncementFormSchema>;

type AnnouncementFormProps = {
  data?: {
    id: string;
    title: string;
    description: string;
    audience: "all" | "trainers" | "students";
    isPublic: boolean;
    isPinned: boolean;
    startDate: string;
    endDate: string | null;
  };
};

export function AnnouncementForm({ data }: AnnouncementFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const isEditMode = !!data?.id;

  const form = useForm<AnnouncementFormValues>({
    resolver: zodResolver(AnnouncementFormSchema),
    defaultValues: {
      id: data?.id ?? null,
      title: data?.title ?? "",
      description: data?.description ?? "",
      audience: data?.audience ?? "all",
      isPublic: data?.isPublic ?? false,
      isPinned: data?.isPinned ?? false,
      startDate: data?.startDate ?? "",
      endDate: data?.endDate ?? null,
    },
  });

  const { handleSubmit, control } = form;

  async function onSubmit(values: AnnouncementFormValues) {
    startTransition(async () => {
      try {
        const result = await saveAnnouncement(values);
        console.log(JSON.stringify(values, null, 4));

        if (result.success) {
          toast.success(
            isEditMode
              ? "Announcement updated successfully!"
              : "Announcement created successfully!",
          );

          router.push("/admin/announcements");
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
      {/* Announcement Information */}
      <section>
        <div className="mb-5">
          <h3 className="text-base font-semibold">Announcement Information</h3>

          <p className="mt-1 text-sm text-muted-foreground">
            Create announcements and manage visibility settings.
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
                  Title
                </FieldLabel>

                <Input
                  {...field}
                  id="title"
                  className="h-11 rounded-xl"
                  placeholder="New batch announcement"
                  aria-invalid={!!error}
                />

                <FieldError errors={[error]} />
              </Field>
            )}
          />

          {/* Audience */}
          <Controller
            name="audience"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <Field className="space-y-2" data-invalid={!!error}>
                <FieldLabel required>Audience</FieldLabel>

                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="min-h-11 rounded-xl capitalize">
                    <SelectValue placeholder="Select audience" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="all">All Members</SelectItem>

                    <SelectItem value="trainers">Trainers Only</SelectItem>

                    <SelectItem value="students">Students Only</SelectItem>
                  </SelectContent>
                </Select>

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
                <FieldLabel required>Start Date</FieldLabel>

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
                    <CalendarIcon className="mr-2 size-4" />

                    {field.value
                      ? format(new Date(field.value), "yyyy-MM-dd")
                      : "Select date"}
                  </PopoverTrigger>

                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) => {
                        if (date) {
                          field.onChange(format(date, "yyyy-MM-dd"));
                        }
                      }}
                    />
                  </PopoverContent>
                </Popover>

                <FieldDescription>
                  Select the start date. Leave end date empty for one-day
                  announcements.
                </FieldDescription>

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
                <FieldLabel>End Date</FieldLabel>

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
                    <CalendarIcon className="mr-2 size-4" />

                    {field.value
                      ? format(new Date(field.value), "yyyy-MM-dd")
                      : "Select date"}
                  </PopoverTrigger>

                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) => {
                        if (date) {
                          field.onChange(format(date, "yyyy-MM-dd"));
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

        {/* Description */}
        <div className="mt-5">
          <Controller
            name="description"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <Field className="space-y-2" data-invalid={!!error}>
                <FieldLabel required>Description</FieldLabel>

                <Textarea
                  {...field}
                  rows={6}
                  className="rounded-xl resize-none"
                  placeholder="Write announcement details..."
                  aria-invalid={!!error}
                />

                <FieldError errors={[error]} />
              </Field>
            )}
          />
        </div>
      </section>

      <Separator className="my-8" />

      {/* Visibility Settings */}
      <section>
        <div className="mb-5">
          <h3 className="text-base font-semibold">Visibility Settings</h3>
        </div>

        <div className="space-y-5">
          <Controller
            name="isPublic"
            control={control}
            render={({ field }) => (
              <div className="flex items-center justify-between">
                <div>
                  <FieldLabel htmlFor="switch-visibility-announcement-form">
                    Public Announcement
                  </FieldLabel>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Allow all platform members to view this announcement.
                  </p>
                </div>

                <Switch
                  id="switch-visibility-announcement-form"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </div>
            )}
          />

          <Controller
            name="isPinned"
            control={control}
            render={({ field }) => (
              <div className="flex items-center justify-between">
                <div>
                  <FieldLabel htmlFor="switch-pinned-announcement-form">
                    Pin Announcement
                  </FieldLabel>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Keep this announcement highlighted.
                  </p>
                </div>

                <Switch
                  id="switch-pinned-announcement-form"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </div>
            )}
          />
        </div>
      </section>

      {/* Footer */}
      <div className="mt-8 flex justify-end gap-3 border-t border-border pt-6">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push("/admin/announcements")}
        >
          Cancel
        </Button>

        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}

          {isEditMode ? "Save Changes" : "Create Announcement"}
        </Button>
      </div>
    </form>
  );
}
