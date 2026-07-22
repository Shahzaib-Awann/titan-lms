import { DataTable } from "@/components/ui/data-table/data-table";
import { columns } from "./columns";
import { getCourses } from "@/lib/actions/admin/course.action";

export default async function CoursesPage() {
  const data = await getCourses();

  return (
    <div className="container mx-auto py-10">
      <DataTable
        columns={columns}
        data={data}
        globalFilterColumns={["title", "trainer.name", "durationWeeks"]}
        createButton={{
          icon: true,
          label: "Add Course",
          href: "/admin/courses/create",
        }}
      />
    </div>
  );
}
