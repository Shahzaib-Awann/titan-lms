import { TrainerForm } from "@/components/forms/trainer-form";
import { Button } from "@/components/ui/button";
import { getTrainerForEdit } from "@/lib/actions/trainer.action";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function EditTrainerPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;
  const trainer = await getTrainerForEdit(id);

  if (!trainer) {
    return (
      <div className="p-6 flex flex-col min-h-[50vh] justify-center items-center">
        <div className="rounded-full bg-destructive/10 p-5">
          <AlertTriangle className="text-destructive size-8" />
        </div>
        <h3 className="text-xl mt-5 font-semibold text-foreground">
          Trainer not found
        </h3>
        <p className="mt-1 text-center text-sm leading-relaxed text-muted-foreground">
          The trainer profile you are trying to edit does not exist or may have
          been removed.
        </p>
        <Link href="/admin/trainers">
          <Button className="w-full mt-5">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Trainers
          </Button>
        </Link>
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
