"use client";

import { DataTable } from "@/components/ui/data-table/data-table";
import { TrainerBatchStudentRow, columns } from "../columns";

interface Props {
  data: TrainerBatchStudentRow[];
  batchId: string;
}

export const BatchStudentDataTable = ({ data, batchId }: Props) => {
  return (
    <DataTable
      columns={columns({ batchId })}
      data={data}
      globalFilterColumns={["fullName", "cnic", "role"]}
      createButton={{
        icon: true,
        label: "Add",
        href: "/admin/admins/create",
      }}
    />
  );
};
