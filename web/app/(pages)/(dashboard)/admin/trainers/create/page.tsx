import { TrainerForm } from "@/components/forms/trainer-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Trainer | Titan LMS",
  description: "Create a new trainer for Titan LMS.",
};

export default function CreateTrainerPage() {
  return (
    <div className="flex flex-col gap-6 p-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Create Trainer</h1>
        <p className="mt-2 text-muted-foreground">
          Add a new trainer account to manage courses and students.
        </p>
      </div>

      <div className="mt-4">
        <TrainerForm />
      </div>
    </div>
  );
}
