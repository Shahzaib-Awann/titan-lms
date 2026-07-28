import { TrainerForm } from "@/components/forms/trainer-form";
import { getTrainerForEdit } from "@/lib/actions/trainer.action";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Trainer | Titan LMS",
  description: "Edit trainer for Titan LMS.",
};

export default async function EditTrainerPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;
  const trainer = await getTrainerForEdit(id);

  if (!trainer) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Trainer not found.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Edit Trainer</h1>

        <p className="mt-2 text-muted-foreground">
          Edit the trainer account information.
        </p>
      </div>

      <div className="mt-4">
        <TrainerForm data={trainer} />
      </div>
    </div>
  );
}
