import { AdminForm } from "@/components/forms/admin-form";

export default function CreateAdminPage() {
  return (
    <div className="flex flex-col gap-6 p-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">
          Create Administrator
        </h1>
        <p className="text-muted-foreground mt-2">
          Add a new admin account to manage the learning platform.
        </p>
      </div>

      <div className="mt-4">
        <AdminForm />
      </div>
    </div>
  );
}
