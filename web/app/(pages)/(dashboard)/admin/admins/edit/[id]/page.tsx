import { AdminForm } from "@/components/forms/admin-form";
import { getAdminForEdit } from "@/lib/actions/admin.action";

export default async function EditAdminPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;
  const admin = await getAdminForEdit(id);

  if (!admin) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Admin not found.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Edit Administrator
        </h1>

        <p className="mt-2 text-muted-foreground">
          Edit the admin account information.
        </p>
      </div>

      <div className="mt-4">
        <AdminForm data={admin} />
      </div>
    </div>
  );
}
