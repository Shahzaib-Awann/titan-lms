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
import { StudentFormSchema } from "@/lib/zod/admin.schema";
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
import toast from "react-hot-toast";
import { saveStudent } from "@/lib/actions/admin/student.action";
import { Textarea } from "../ui/textarea";
import { UserStatus } from "@/types/common";

interface StudentFormProps {
  data?: {
    id: string;
    fullName: string;
    cnic: string;
    phone: string | null;
    avatarAssetId: string | null;
    avatarUrl: string | null;
    rollNumber: string;
    dateOfBirth: Date | null;
    guardianName: string | null;
    guardianPhone: string | null;
    address: string | null;
    admissionDate: Date | null;
    status: UserStatus;
  } | null;
}

type StudentFormValues = z.infer<typeof StudentFormSchema>;
export function StudentForm({ data }: StudentFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [preview, setPreview] = useState<string | null>(
    data?.avatarUrl ?? null,
  );

  // Track if the existing image is explicitly scheduled for deletion
  const [removeAvatar, setRemoveAvatar] = useState(false);

  const isEditMode = !!data?.id;

  const form = useForm<StudentFormValues>({
    resolver: zodResolver(StudentFormSchema),
    defaultValues: {
      id: data?.id || "",
      fullName: data?.fullName || "",
      cnic: data?.cnic || "",
      phone: data?.phone || "",
      password: "",
      rollNumber: data?.rollNumber || "",
      dateOfBirth: data?.dateOfBirth ? String(data?.dateOfBirth) : "",
      guardianName: data?.guardianName || "",
      guardianPhone: data?.guardianPhone || "",
      address: data?.address || "",
      admissionDate: data?.admissionDate ? String(data?.admissionDate) : "",
      status: data?.status || "active",
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

  async function onSubmit(values: StudentFormValues) {
    startTransition(async () => {
      try {
        const result = await saveStudent({ ...values, removeAvatar });

        if (result.success) {
          toast.success(
            isEditMode
              ? "Student updated successfully!"
              : "Student created successfully!",
          );
          router.push("/admin/students");
        }
      } catch (error) {
        console.error("Student save error:", error);
        toast.error(
          error instanceof Error ? error.message : "Failed to save student",
        );
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Profile Image Section */}
      <section className="space-y-4">
        <div>
          <h3 className="text-base font-semibold">Profile Image</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload a profile picture for this student.
          </p>
        </div>

        <Controller
          name="avatar"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <div className="space-y-2">
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
                    className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-primary text-white shadow-card hover:bg-[#6548F8] transition-colors"
                  >
                    <Pencil size={14} />
                  </label>

                  <Input
                    id="avatar-upload"
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0] ?? null;
                      field.onChange(file);
                      if (file) {
                        setPreview(URL.createObjectURL(file));
                        setRemoveAvatar(false);
                      }
                    }}
                  />
                </div>

                <div>
                  <p className="text-sm font-medium">Upload image</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    PNG, JPG or WEBP (max 2MB)
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

              {error && <FieldError errors={[error]} />}
            </div>
          )}
        />
      </section>

      <Separator />

      {/* Personal Information Section */}
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
            name="cnic"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <Field className="space-y-2" data-invalid={!!error}>
                <FieldLabel htmlFor="cnic" required>
                  CNIC / B-Form
                </FieldLabel>

                <Input
                  {...field}
                  id="cnic"
                  type="text"
                  inputMode="numeric"
                  maxLength={13}
                  className="h-11 rounded-xl"
                  placeholder="3520112345671"
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
            name="rollNumber"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <Field className="space-y-2" data-invalid={!!error}>
                <FieldLabel htmlFor="rollNumber" required>
                  Roll Number
                </FieldLabel>

                <Input
                  {...field}
                  id="rollNumber"
                  className="h-11 rounded-xl"
                  placeholder="ST-1045"
                  aria-invalid={!!error}
                />

                <FieldError errors={[error]} />
              </Field>
            )}
          />

          <Controller
            name="dateOfBirth"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <Field className="space-y-2" data-invalid={!!error}>
                <FieldLabel htmlFor="dateOfBirth" required>
                  Date of Birth
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
        </div>
      </section>

      <Separator />

      {/* Guardian Information Section */}
      <section>
        <h3 className="mb-5 text-base font-semibold">Guardian Information</h3>

        <div className="grid gap-5 md:grid-cols-2">
          <Controller
            name="guardianName"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <Field className="space-y-2" data-invalid={!!error}>
                <FieldLabel htmlFor="guardianName" required>
                  Guardian Name
                </FieldLabel>

                <Input
                  {...field}
                  id="guardianName"
                  className="h-11 rounded-xl"
                  placeholder="Enter guardian name"
                  aria-invalid={!!error}
                />

                <FieldError errors={[error]} />
              </Field>
            )}
          />

          <Controller
            name="guardianPhone"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <Field className="space-y-2" data-invalid={!!error}>
                <FieldLabel htmlFor="guardianPhone" required>
                  Guardian Phone
                </FieldLabel>

                <Input
                  {...field}
                  id="guardianPhone"
                  className="h-11 rounded-xl"
                  placeholder="+92 300 1234567"
                  aria-invalid={!!error}
                />

                <FieldError errors={[error]} />
              </Field>
            )}
          />

          <div className="md:col-span-2">
            <Controller
              name="address"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <Field className="space-y-2" data-invalid={!!error}>
                  <FieldLabel htmlFor="address" required>
                    Address
                  </FieldLabel>

                  <Textarea
                    {...field}
                    id="address"
                    placeholder="Enter complete address"
                    className="min-h-24 rounded-xl resize-y"
                    aria-invalid={!!error}
                  />

                  <FieldError errors={[error]} />
                </Field>
              )}
            />
          </div>
        </div>
      </section>

      <Separator />

      {/* Admission Section */}
      <section>
        <h3 className="mb-5 text-base font-semibold">Admission Details</h3>

        <div className="grid gap-5 md:grid-cols-2">
          <Controller
            name="admissionDate"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <Field className="space-y-2" data-invalid={!!error}>
                <FieldLabel htmlFor="admissionDate" required>
                  Admission Date
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
        </div>
      </section>

      <Separator />

      {/* Security Section */}
      <section>
        <h3 className="mb-5 text-base font-semibold">Security</h3>
        <div className="grid gap-5 md:grid-cols-2">
          <Controller
            name="password"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <Field className="space-y-2" data-invalid={!!error}>
                <FieldLabel htmlFor="password" required={!isEditMode}>
                  Password {isEditMode && "(Leave blank to keep unchanged)"}
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>

                <FieldError errors={[error]} />
              </Field>
            )}
          />
        </div>
      </section>

      <Separator />

      {/* Access & Permissions Section */}
      <section>
        <h3 className="mb-5 text-base font-semibold">Access & Permissions</h3>
        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <FieldLabel htmlFor="student-form-role">Role</FieldLabel>
            <Input
              id="student-form-role"
              value="Student"
              readOnly
              className="h-11 rounded-xl bg-muted"
            />
          </div>

          <Controller
            name="status"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <Field data-invalid={!!error}>
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

      {/* Form Action Buttons */}
      <div className="flex justify-end gap-3 border-t border-border pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/students")}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
          {isEditMode ? "Save Changes" : "Create Student"}
        </Button>
      </div>
    </form>
  );
}
