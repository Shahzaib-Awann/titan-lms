import { DataTable } from "@/components/ui/data-table/data-table";
import { Admin, columns } from "./columns";

async function getData(): Promise<Admin[]> {
  // Fetch data from your API here.
  return [
    {
      id: "admin_001",
      name: "Muhammad Hassan",
      email: "hassan@example.com",
      phone: "+92 300 4567890",
      avatar: "/avatars/hassan.png",
      role: "super_admin",
      status: "active",
      lastLoginAt: "2026-07-10",
      joinedAt: "2025-01-15",
    },
    {
      id: "admin_002",
      name: "Fatima Noor",
      email: "fatima@example.com",
      phone: "+92 301 7894561",
      avatar: "/avatars/fatima.png",
      role: "admin",
      status: "active",
      lastLoginAt: "2026-07-09",
      joinedAt: "2025-04-22",
    },
    {
      id: "admin_003",
      name: "Bilal Ahmed",
      email: "bilal@example.com",
      role: "moderator",
      status: "pending",
      joinedAt: "2026-02-11",
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
        globalFilterColumns={["name", "email", "role"]}
        createButton={{
          icon: true,
          label: "Add",
          href: "/admins/create",
        }}
      />
    </div>
  );
}
