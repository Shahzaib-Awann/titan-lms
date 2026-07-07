"use client";

import React, { useState } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";

export default function SignUpPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      redirect("/");
    }, 1500);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-xl font-bold text-primary-foreground shadow-lg shadow-primary/30">
            T
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Create an account
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Start your learning journey with Titan LMS
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Full name"
            type="text"
            placeholder="John Doe"
            required
          />

          <Input
            label="Email address"
            type="email"
            placeholder="you@example.com"
            required
          />

          <div className="relative">
            <Input
              label="Password"
              type={isVisible ? "text" : "password"}
              placeholder="••••••••"
              required
            />

            <button
              type="button"
              onClick={() => setIsVisible((prev) => !prev)}
              className="absolute right-3 top-10 text-muted-foreground hover:text-foreground"
              aria-label={isVisible ? "Hide password" : "Show password"}
            >
              {isVisible ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <Button
            type="submit"
            size="lg"
            className="mt-3 w-full"
            isLoading={isLoading}
          >
            Create account
          </Button>
        </form>

        {/* Divider */}
        <div className="my-8 flex items-center gap-4">
          <div className="h-px flex-1 bg-border" />

          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Or continue with
          </span>

          <div className="h-px flex-1 bg-border" />
        </div>

        {/* OAuth */}
        <div className="grid grid-cols-2 gap-3">
          <Button variant="secondary" type="button" className="w-full">
            <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 2.5.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Google
          </Button>

          <Button variant="secondary" type="button" className="w-full">
            GitHub
          </Button>
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="font-semibold text-primary hover:text-[#6848F8]"
          >
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
