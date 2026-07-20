"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AdminFormSchema } from "@/lib/zod/admin.schema";
import { saveAdmin } from "@/lib/actions/admin.action";

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
import { Eye, EyeOff, Loader2, Pencil, User } from "lucide-react";
import z from "zod";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";

type AdminFormValues = z.infer<typeof AdminFormSchema>;

type AdminFormProps = {
  data?: {
    id: string;
    cnic: string;
    fullName: string;
    phone: string;
    role: "admin" | "trainer" | "student";
    status: "active" | "inactive" | "suspended";
    avatarAssetId: string | null;
    avatarUrl: string | null;
  };
};

export function AdminForm({ data }: AdminFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [preview, setPreview] = useState<string | null>(
    data?.avatarUrl ?? null,
  );

  // Track if the existing image is explicitly scheduled for deletion
  const [removeAvatar, setRemoveAvatar] = useState(false);

  const isEditMode = !!data?.id;

  const form = useForm<AdminFormValues>({
    resolver: zodResolver(AdminFormSchema),
    defaultValues: {
      id: data?.id ?? "",
      cnic: data?.cnic ?? "",
      password: "",
      fullName: data?.fullName ?? "",
      phone: data?.phone ?? "",
      status: data?.status ?? "active",
      avatar: null,
    },
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = form;

  useEffect(() => {
    return () => {
      if (preview?.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  async function onSubmit(values: AdminFormValues) {
    startTransition(async () => {
      try {
        // Pass the removeAvatar flag alongside standard form values
        const result = await saveAdmin({ ...values, removeAvatar });
        if (result.success) {
          toast.success(
            isEditMode
              ? "Admin updated successfully!"
              : "Admin created successfully!",
          );
          router.push("/admin/admins");
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
      {/* Profile Image */}
      <section className="space-y-4">
        <div>
          <h3 className="text-base font-semibold">Profile Image</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload a profile picture for this account.
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
                    setRemoveAvatar(false); // Reset removal if new image is picked
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
                      setRemoveAvatar(true); // Flag asset removal for server logic
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
          <Field className="space-y-2" data-invalid={!!errors.fullName}>
            <FieldLabel htmlFor="fullName" required>
              Full Name
            </FieldLabel>
            <Input
              {...register("fullName")}
              id="fullName"
              className="h-11 rounded-xl"
              placeholder="John Doe"
              aria-invalid={!!errors.fullName}
            />
            <FieldError errors={[errors.fullName]} />
          </Field>

          <Field className="space-y-2" data-invalid={!!errors.cnic}>
            <FieldLabel htmlFor="cnic" required>
              CNIC
            </FieldLabel>
            <Input
              {...register("cnic")}
              id="cnic"
              className="h-11 rounded-xl"
              placeholder="xxxxxxxxxxxxx"
              aria-invalid={!!errors.cnic}
            />
            <FieldError errors={[errors.cnic]} />
          </Field>

          <Field className="space-y-2" data-invalid={!!errors.phone}>
            <FieldLabel htmlFor="phone">Phone Number</FieldLabel>
            <Input
              {...register("phone")}
              id="phone"
              className="h-11 rounded-xl"
              placeholder="+92 300 1234567"
              aria-invalid={!!errors.phone}
            />
            <FieldError errors={[errors.phone]} />
          </Field>
        </div>
      </section>

      <Separator className="my-8" />

      {/* Security */}
      <section>
        <h3 className="mb-5 text-base font-semibold">Security</h3>
        <Field className="space-y-2" data-invalid={!!errors.password}>
          <FieldLabel htmlFor="password" required>
            Password
          </FieldLabel>
          <div className="relative">
            <input
              type="password"
              name="fake-password"
              autoComplete="new-password"
              className="hidden"
            />
            <Input
              {...register("password")}
              id="password"
              type={showPassword ? "text" : "password"}
              className="h-11 rounded-xl pr-10"
              placeholder="Enter password"
              aria-invalid={!!errors.password}
              autoComplete="new-password"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              onClick={() => setShowPassword((v) => !v)}
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
          <FieldError errors={[errors.password]} />
        </Field>
      </section>

      <Separator className="my-8" />

      {/* Access & Permissions */}
      <section>
        <h3 className="mb-5 text-base font-semibold">Access & Permissions</h3>
        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-4">
            <FieldLabel htmlFor="admin-form-role">Role</FieldLabel>
            <Input id="admin-form-role" value="Admin" readOnly />
          </div>

          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Field className="space-y-2">
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
          onClick={() => router.push("/admin/admins")}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
          {isEditMode ? "Save Changes" : "Create Admin"}
        </Button>
      </div>
    </form>
  );
}
