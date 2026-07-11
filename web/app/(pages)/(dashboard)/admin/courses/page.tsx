import { DataTable } from "@/components/ui/data-table/data-table";
import { columns, Payment } from "./columns";

async function getData(): Promise<Payment[]> {
  // Fetch data from your API here.
  return [
    {
      id: "728ed52f",
      amount: 100,
      status: "pending",
      email: "m1@example.com",
    },
    {
      id: "728ed52g",
      amount: 200,
      status: "failed",
      email: "m2@example.com",
    },
    {
      id: "728ed52h",
      amount: 300,
      status: "success",
      email: "m3@example.com",
    },
    {
      id: "728ed52i",
      amount: 450,
      status: "processing",
      email: "m4@example.com",
    },
    {
      id: "728ed52j",
      amount: 75,
      status: "success",
      email: "m5@example.com",
    },
    {
      id: "728ed52k",
      amount: 520,
      status: "pending",
      email: "m6@example.com",
    },
    {
      id: "728ed52l",
      amount: 890,
      status: "failed",
      email: "m7@example.com",
    },
    {
      id: "728ed52m",
      amount: 1200,
      status: "success",
      email: "m8@example.com",
    },
    {
      id: "728ed52n",
      amount: 340,
      status: "processing",
      email: "m9@example.com",
    },
    {
      id: "728ed52o",
      amount: 650,
      status: "pending",
      email: "m10@example.com",
    },
    {
      id: "728ed52p",
      amount: 980,
      status: "success",
      email: "m11@example.com",
    },
    {
      id: "728ed52q",
      amount: 150,
      status: "failed",
      email: "m12@example.com",
    },
    {
      id: "728ed52r",
      amount: 760,
      status: "processing",
      email: "m13@example.com",
    },
    {
      id: "728ed52s",
      amount: 430,
      status: "success",
      email: "m14@example.com",
    },
    {
      id: "728ed52t",
      amount: 110,
      status: "pending",
      email: "m15@example.com",
    },
    {
      id: "728ed52u",
      amount: 2200,
      status: "success",
      email: "m16@example.com",
    },
    {
      id: "728ed52v",
      amount: 560,
      status: "failed",
      email: "m17@example.com",
    },
    {
      id: "728ed52w",
      amount: 780,
      status: "processing",
      email: "m18@example.com",
    },
    {
      id: "728ed52x",
      amount: 330,
      status: "pending",
      email: "m19@example.com",
    },
    {
      id: "728ed52y",
      amount: 990,
      status: "success",
      email: "m20@example.com",
    },
    {
      id: "728ed52z",
      amount: 1250,
      status: "processing",
      email: "m21@example.com",
    },
    {
      id: "728ed530",
      amount: 670,
      status: "failed",
      email: "m22@example.com",
    },
    {
      id: "728ed531",
      amount: 540,
      status: "success",
      email: "m23@example.com",
    },
    {
      id: "728ed532",
      amount: 860,
      status: "pending",
      email: "m24@example.com",
    },
    {
      id: "728ed533",
      amount: 1450,
      status: "success",
      email: "m25@example.com",
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
