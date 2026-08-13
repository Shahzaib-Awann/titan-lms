"use client";

import { DataTable } from "@/components/ui/data-table/data-table";
import {
  Assignment,
  columns,
} from "@/app/(pages)/(dashboard)/trainer/batches/[batchId]/assignments/columns";

interface AssignmentsTableProps {
  batchId: string;
  data: Assignment[];
}

export function AssignmentsTable({ batchId, data }: AssignmentsTableProps) {
  return (
    <DataTable
      columns={columns({ batchId })}
      data={data}
      globalFilterColumns={["title", "status"]}
      createButton={{
        icon: true,
        label: "Create",
        href: `/trainer/batches/${batchId}/assignments/create`,
      }}
    />
  );
}
