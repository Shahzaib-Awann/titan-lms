"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";

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
import { CalendarIcon, Eye, EyeOff, Loader2, Pencil, User } from "lucide-react";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { TrainerFormSchema } from "@/lib/zod/admin.schema";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { saveTrainer } from "@/lib/actions/trainer.action";
import toast from "react-hot-toast";

interface TrainerFormProps {
  data?: {
    id: string;
    fullName: string;
    phone: string | null;

    status: "active" | "inactive" | "suspended";

    avatarAssetId: string | null;
    avatarUrl: string | null;

    employeeCode: string;
    specialization: string | null;
    hourlyRate: number | null;
    joinedAt: Date | null;
  } | null;
}

type TrainerFormValues = z.infer<typeof TrainerFormSchema>;
export function TrainerForm({ data }: TrainerFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [preview, setPreview] = useState<string | null>(
    data?.avatarUrl ?? null,
  );

  // Track if the existing image is explicitly scheduled for deletion
  const [removeAvatar, setRemoveAvatar] = useState(false);

  const isEditMode = Boolean(data?.id);

  const form = useForm<TrainerFormValues>({
    resolver: zodResolver(TrainerFormSchema),
    defaultValues: {
      id: data?.id ?? "",
      fullName: data?.fullName ?? "",
      phone: data?.phone ?? "",
      password: "",
      employeeCode: data?.employeeCode ?? "",
      specialization: data?.specialization ?? "",
      hourlyRate: data?.hourlyRate?.toString() ?? "",
      joinedDate: data?.joinedAt ? format(data.joinedAt, "yyyy-MM-dd") : "",
      status: data?.status ?? "active",
      avatar: null,
    },
  });

  const { handleSubmit, control } = form;

  useEffect(() => {
    return () => {
      if (preview?.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  async function onSubmit(values: TrainerFormValues) {
    startTransition(async () => {
      try {
        const result = await saveTrainer({ ...values, removeAvatar });

        if (result.success) {
          toast.success(
            isEditMode
              ? "Trainer updated successfully!"
              : "Trainer created successfully!",
          );
          router.push("/admin/trainers");
        }
      } catch (error) {
        console.error("Trainer save error:", error);
        toast.error(
          error instanceof Error ? error.message : "Failed to save trainer",
        );
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Profile Image */}
      <section className="space-y-4">
        <div>
          <h3 className="text-base font-semibold">Profile Image</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload a profile picture for this trainer account.
          </p>
        </div>

        <Controller
          name="avatar"
          control={control}
          render={({ field }) => (
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="relative h-24 w-24 overflow-hidden rounded-full border border-border bg-muted">
                  {preview ? (
                    <Image
                      src={preview}
                      alt="Profile"
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-linear-to-br from-[#6548F8] to-[#9268FF] text-3xl font-bold text-white">
                      <User className="scale-150" />
                    </div>
                  )}
                </div>

                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-primary text-white shadow-card hover:bg-[#6548F8]"
                >
                  <Pencil size={14} />
                </label>

                <Input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0] ?? null;
                    field.onChange(file);
                    setPreview(file ? URL.createObjectURL(file) : null);
                    setRemoveAvatar(false);
                  }}
                />
              </div>

              <div>
                <p className="text-sm font-medium">Upload image</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  PNG, JPG or WEBP (max 5MB)
                </p>

                {preview && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="mt-2 text-destructive hover:bg-destructive/20 hover:text-destructive"
                    onClick={() => {
                      field.onChange(null);
                      setPreview(null);
                      setRemoveAvatar(true);
                    }}
                  >
                    Remove image
                  </Button>
                )}
              </div>
            </div>
          )}
        />
      </section>

      <Separator className="my-8" />

      {/* Personal Information */}
      <section>
        <h3 className="mb-5 text-base font-semibold">Personal Information</h3>
        <div className="grid gap-5 md:grid-cols-2">
          <Controller
            name="fullName"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <Field className="space-y-2" data-invalid={!!error}>
                <FieldLabel htmlFor="fullName" required>
                  Full Name
                </FieldLabel>

                <Input
                  {...field}
                  id="fullName"
                  className="h-11 rounded-xl"
                  placeholder="Sarah Connor"
                  aria-invalid={!!error}
                />

                <FieldError errors={[error]} />
              </Field>
            )}
          />

          <Controller
            name="phone"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <Field className="space-y-2" data-invalid={!!error}>
                <FieldLabel htmlFor="phone">Phone Number</FieldLabel>

                <Input
                  {...field}
                  id="phone"
                  className="h-11 rounded-xl"
                  placeholder="+92 300 1234567"
                  aria-invalid={!!error}
                />

                <FieldError errors={[error]} />
              </Field>
            )}
          />

          <Controller
            name="employeeCode"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <Field className="space-y-2" data-invalid={!!error}>
                <FieldLabel htmlFor="employeeCode" required>
                  Employee Code
                </FieldLabel>

                <Input
                  {...field}
                  id="employeeCode"
                  className="h-11 rounded-xl"
                  placeholder="TR-1045"
                  aria-invalid={!!error}
                />

                <FieldError errors={[error]} />
              </Field>
            )}
          />
        </div>
      </section>

      <Separator className="my-8" />

      {/* Professional Details */}
      <section>
        <h3 className="mb-5 text-base font-semibold">Professional Details</h3>
        <div className="grid gap-5 md:grid-cols-2">
          <Controller
            name="specialization"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <Field className="space-y-2" data-invalid={!!error}>
                <FieldLabel htmlFor="specialization" required>
                  Specialization
                </FieldLabel>

                <Input
                  {...field}
                  id="specialization"
                  className="h-11 rounded-xl"
                  placeholder="e.g. Frontend Development"
                  aria-invalid={!!error}
                />

                <FieldError errors={[error]} />
              </Field>
            )}
          />

          <Controller
            name="hourlyRate"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <Field className="space-y-2" data-invalid={!!error}>
                <FieldLabel htmlFor="hourlyRate" required>
                  Hourly Rate (PKR)
                </FieldLabel>

                <Input
                  {...field}
                  id="hourlyRate"
                  type="number"
                  min="0"
                  step="0.01"
                  className="h-11 rounded-xl"
                  placeholder="50"
                  aria-invalid={!!error}
                />

                <FieldError errors={[error]} />
              </Field>
            )}
          />

          <Controller
            name="joinedDate"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <Field className="space-y-2" data-invalid={!!error}>
                <FieldLabel htmlFor="joinedDate" required>
                  Joined Date
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
        </div>
      </section>

      <Separator className="my-8" />

      {/* Security */}
      <section>
        <h3 className="mb-5 text-base font-semibold">Security</h3>
        <Controller
          name="password"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <Field className="space-y-2" data-invalid={!!error}>
              <FieldLabel htmlFor="password" required>
                Password
              </FieldLabel>

              <div className="relative">
                <Input
                  {...field}
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="h-11 rounded-xl pr-10"
                  placeholder="Enter password"
                  autoComplete="new-password"
                  aria-invalid={!!error}
                />

                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>

              <FieldError errors={[error]} />
            </Field>
          )}
        />
      </section>

      <Separator className="my-8" />

      {/* Access & Permissions */}
      <section>
        <h3 className="mb-5 text-base font-semibold">Access & Permissions</h3>
        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-4">
            <FieldLabel htmlFor="trainer-form-role">Role</FieldLabel>
            <Input id="trainer-form-role" value="Trainer" readOnly />
          </div>

          <Controller
            name="status"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <Field className="space-y-2" data-invalid={!!error}>
                <FieldLabel required>Status</FieldLabel>

                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="min-h-11 rounded-xl capitalize">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>

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
          onClick={() => router.push("/admin/trainers")}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
          {isEditMode ? "Save Changes" : "Create Trainer"}
        </Button>
      </div>
    </form>
  );
}
