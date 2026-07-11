import { DataTable } from "@/components/ui/data-table/data-table";
import { Teacher, columns } from "./columns";

async function getData(): Promise<Teacher[]> {
  // Fetch data from your API here.
  return [
    {
      id: "teacher_001",
      name: "Ahmed Khan",
      email: "ahmed.khan@example.com",
      phone: "+92 300 1234567",
      avatar: "/avatars/ahmed.png",
      expertise: "Full Stack Development",
      assignedCourses: 6,
      totalStudents: 320,
      status: "active",
      joinedAt: "2025-08-12",
    },
    {
      id: "teacher_002",
      name: "Sara Ali",
      email: "sara.ali@example.com",
      phone: "+92 301 9876543",
      avatar: "/avatars/sara.png",
      expertise: "UI/UX Design",
      assignedCourses: 4,
      totalStudents: 180,
      status: "active",
      joinedAt: "2025-10-05",
    },
    {
      id: "teacher_003",
      name: "Usman Raza",
      email: "usman.raza@example.com",
      expertise: "Data Science",
      assignedCourses: 2,
      totalStudents: 75,
      status: "pending",
      joinedAt: "2026-01-20",
    },
  ];
}

export default async function DemoPage() {
  const data = await getData();

  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={data} enableSearchBar />
    </div>
  );
}
