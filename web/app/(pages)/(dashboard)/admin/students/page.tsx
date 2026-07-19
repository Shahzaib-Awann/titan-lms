import { DataTable } from "@/components/ui/data-table/data-table";
import { Student, columns } from "./columns";

async function getData(): Promise<Student[]> {
  // Fetch data from your API here.
  return [
    {
      id: "1",
      name: "Ahmed Khan",
      email: "ahmed@example.com",
      phone: "+92 300 1234567",
      avatar: "/avatars/ahmed.png",
      enrolledCourses: 3,
      status: "active",
      joinedAt: "2026-01-12",
    },
    {
      id: "2",
      name: "Sara Ali",
      email: "sara@example.com",
      enrolledCourses: 5,
      status: "pending",
      joinedAt: "2026-02-03",
    },
  ];
}

export default async function DemoPage() {
  const data = await getData();

  return (
    <div className="container mx-auto py-10">
      <DataTable
        columns={columns}
        data={data}
        globalFilterColumns={["name", "email"]}
        createButton={{
          icon: true,
          label: "Add",
          href: "/admin/students/create",
        }}
      />
    </div>
  );
}
