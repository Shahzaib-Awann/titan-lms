"use client";

import { useState } from "react";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import toast from "react-hot-toast";
import { signIn } from "next-auth/react";
import { SignInFormSchema } from "@/lib/zod/schema";

type SignInFormValues = z.infer<typeof SignInFormSchema>;

export default function SignInForm({ redirectUrl }: { redirectUrl?: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<SignInFormValues>({
    resolver: zodResolver(SignInFormSchema),
    defaultValues: {
      cnic: "",
      password: "",
    },
  });

  /* === Submit Handler === */
  async function onSubmit(values: z.infer<typeof SignInFormSchema>) {
    try {
      setIsLoading(true);

      toast.loading("Signing you in...", {
        id: "signin-loading",
      });

      const result = await signIn("credentials", {
        cnic: values.cnic,
        password: values.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Invalid CNIC or password.");
        return;
      }

      if (result?.ok) {
        toast.success("Logged in successfully! Welcome back.");
        window.location.href = redirectUrl || "/student";
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
      toast.dismiss("signin-loading");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-xl font-bold text-primary-foreground shadow-lg shadow-primary/30">
            T
          </div>

          <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to continue your learning journey.
          </p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldSet>
            <FieldGroup>
              {/* CNIC */}
              <Controller
                name="cnic"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="cnic">CNIC / B-Form No</FieldLabel>

                    <Input
                      {...field}
                      id="cnic"
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      maxLength={13}
                      placeholder="xxxxxxxxxxxxx"
                    />

                    <FieldDescription>
                      Enter your 13-digit CNIC or B-Form number.
                    </FieldDescription>

                    <FieldError
                      errors={fieldState.error ? [fieldState.error] : []}
                    />
                  </Field>
                )}
              />

              {/* Password */}
              <Controller
                name="password"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="password">Password</FieldLabel>

                    <div className="relative">
                      <Input
                        {...field}
                        id="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        placeholder="••••••••"
                        className="pr-10"
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>

                    <FieldError
                      errors={fieldState.error ? [fieldState.error] : []}
                    />
                  </Field>
                )}
              />

              {/* Remember me */}
              <Field
                orientation="horizontal"
                className="items-center justify-end"
              >
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-primary hover:text-primary/80"
                >
                  Forgot password?
                </Link>
              </Field>

              {/* Submit */}
              <Field>
                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  isLoading={isLoading}
                  disabled={isLoading}
                >
                  Sign In
                </Button>
              </Field>
            </FieldGroup>
          </FieldSet>
        </form>
      </div>
    </main>
  );
}
