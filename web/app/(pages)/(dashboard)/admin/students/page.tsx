import { DataTable } from "@/components/ui/data-table/data-table";
import { columns } from "./columns";
import { getStudents } from "@/lib/actions/admin/student.action";

export default async function DemoPage() {
  const data = await getStudents();

  return (
    <div className="container mx-auto py-10">
      <DataTable
        columns={columns}
        data={data}
        globalFilterColumns={["fullName", "cnic", "guardian"]}
        createButton={{
          icon: true,
          label: "Add",
          href: "/admin/students/create",
        }}
      />
    </div>
  );
}
