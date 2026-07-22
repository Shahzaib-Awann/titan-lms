import { DataTable } from "@/components/ui/data-table/data-table";
import { getCourseBatches } from "@/lib/actions/admin/batch.action";
import { columns } from "./columns";

const BatchesPage = async () => {
  const data = await getCourseBatches();

  return (
    <div className="container mx-auto py-10">
      <DataTable
        columns={columns}
        data={data}
        globalFilterColumns={["title", "trainer.name", "durationWeeks"]}
        createButton={{
          icon: true,
          label: "Add Batch",
          href: "/admin/batches/create",
        }}
      />
    </div>
  );
};

export default BatchesPage;
