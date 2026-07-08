import React from "react";
import { Sparkles, Users, BookOpenCheck, Rocket } from "lucide-react";
import Image from "next/image";
import SignUpForm from "@/components/pages/sign-up/sign-up-form";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex w-full p-0">
      {/* Form Section */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:flex-none lg:w-130 xl:w-150 mx-auto lg:mx-0">
        <div className="w-full max-w-sm mx-auto lg:w-96">
          <SignUpForm />
        </div>
      </div>

      {/* Premium LMS Hero Section */}
      <div className="hidden lg:block relative flex-1 bg-surface-1 overflow-hidden">
        <Image
          className="object-cover opacity-60"
          src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop"
          alt="Students studying together"
          fill
          sizes="(min-width:1024px) 50vw, 100vw"
        />

        {/* Gradient */}
        <div className="absolute inset-0 bg-linear-to-br from-primary/70 via-primary/40 to-transparent " />

        {/* Content */}
        <div className="absolute inset-0 flex items-center px-12 xl:px-16">
          <div className="max-w-lg">
            {/* Badge */}

            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-md border border-white/20 px-4 py-2 text-sm text-white mb-6">
              <Sparkles size={16} />
              Start your learning journey
            </div>

            <h2 className="text-4xl xl:text-5xl font-bold leading-tight text-white">
              Learn smarter.
              <br />
              Grow faster.
            </h2>

            <p className="mt-5 text-white/80 leading-relaxed text-base">
              Join Titan LMS and get access to personalized courses, intelligent
              recommendations, and tools designed to help you achieve your
              goals.
            </p>

            {/* Feature Cards */}

            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-4 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 p-4">
                <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <BookOpenCheck size={20} />
                </div>

                <div>
                  <h3 className="font-semibold text-white">
                    Structured Learning
                  </h3>

                  <p className="text-sm text-white/70">
                    Follow courses designed for real progress
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 p-4">
                <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <Users size={20} />
                </div>

                <div>
                  <h3 className="font-semibold text-white">
                    Community Learning
                  </h3>

                  <p className="text-sm text-white/70">
                    Learn together with motivated students
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 p-4">
                <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <Rocket size={20} />
                </div>

                <div>
                  <h3 className="font-semibold text-white">Career Growth</h3>

                  <p className="text-sm text-white/70">
                    Build skills that move you forward
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
