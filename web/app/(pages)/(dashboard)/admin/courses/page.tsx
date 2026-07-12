import { DataTable } from "@/components/ui/data-table/data-table";
import { columns, Course } from "./columns";

async function getData(): Promise<Course[]> {
  // Fetch courses from your API here.
  return [
    {
      id: "course-001",
      title: "Full Stack Web Development",
      instructor: "Ahmed Khan",
      students: 240,
      lessons: 36,
      status: "published",
      createdAt: "2026-01-15",
    },
    {
      id: "course-002",
      title: "UI/UX Design Fundamentals",
      instructor: "Sara Ali",
      students: 180,
      lessons: 24,
      status: "published",
      createdAt: "2026-01-20",
    },
    {
      id: "course-003",
      title: "Database Management with SQL",
      instructor: "Usman Ahmed",
      students: 320,
      lessons: 42,
      status: "published",
      createdAt: "2026-02-05",
    },
  ];
}

export default async function CoursesPage() {
  const data = await getData();

  return (
    <div className="container mx-auto py-10">
      <DataTable
        columns={columns}
        data={data}
        globalFilterColumns={["title", "instructor"]}
        createButton={{
          icon: true,
          label: "Add Course",
          href: "/courses/create",
        }}
      />
    </div>
  );
}
