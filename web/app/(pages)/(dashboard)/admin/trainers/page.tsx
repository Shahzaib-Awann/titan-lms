import { DataTable } from "@/components/ui/data-table/data-table";
import { columns } from "./columns";
import { getTrainers } from "@/lib/actions/trainer.action";

export default async function DemoPage() {
  const data = await getTrainers();

  return (
    <div className="container mx-auto py-10">
      <DataTable
        columns={columns}
        data={data}
        globalFilterColumns={["name", "email", "expertise"]}
        createButton={{
          icon: true,
          label: "Add",
          href: "/admin/trainers/create",
        }}
      />
    </div>
  );
}
