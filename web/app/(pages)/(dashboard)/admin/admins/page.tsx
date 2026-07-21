import { DataTable } from "@/components/ui/data-table/data-table";
import { columns } from "./columns";
import { getAdmins } from "@/lib/actions/admin.action";

export default async function AdminPage() {
  const data = await getAdmins();

  return (
    <div className="container mx-auto py-10">
      <DataTable
        columns={columns}
        data={data}
        globalFilterColumns={["fullName", "cnic", "role"]}
        createButton={{
          icon: true,
          label: "Add",
          href: "/admin/admins/create",
        }}
      />
    </div>
  );
}
