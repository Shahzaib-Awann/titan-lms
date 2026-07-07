import React from "react";
import { Sparkles } from "lucide-react";
import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex w-full p-0 ">
      {/* Form Section */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:flex-none lg:w-130 xl:w-150 mx-auto lg:mx-0">
        <div className="w-full max-w-sm mx-auto lg:w-96">{children}</div>
      </div>

      {/* Image & AI Elements Section (Hidden on mobile) */}
      <div className="hidden lg:block relative flex-1 bg-surface-1 overflow-hidden">
        <Image
          className="object-cover opacity-60"
          src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop"
          alt="Students learning and collaborating"
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-primary/50 via-primary/25 to-transparent" />

        {/* AI Learning Overlay */}
        <div className="absolute bottom-12 left-12 right-12 xl:bottom-16 xl:left-16 xl:right-16">
          <div className="backdrop-blur-md bg-surface-1/80 border border-border p-6 rounded-xl shadow-elevated max-w-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                <Sparkles size={20} />
              </div>
              <h3 className="text-lg font-bold text-ink">
                Smart Learning Companion
              </h3>
            </div>

            <p className="text-ink-muted leading-relaxed text-sm">
              Titan LMS uses AI to personalize your learning journey. We analyze
              your performance, suggest tailored resources, and adapt to your
              unique pace.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
