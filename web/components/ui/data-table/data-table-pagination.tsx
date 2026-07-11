import { type Table } from "@tanstack/react-table";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
}

export function DataTablePagination<TData>({
  table,
}: DataTablePaginationProps<TData>) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-lg border border-border bg-card">
      <div className="flex-1 text-sm text-muted-foreground">
        <span className="font-medium text-foreground">
          {table.getFilteredSelectedRowModel().rows.length}
        </span>{" "}
        of{" "}
        <span className="font-medium text-foreground">
          {table.getFilteredRowModel().rows.length}
        </span>{" "}
        selected
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <p className="hidden text-sm text-muted-foreground sm:block">
            Rows per page
          </p>

          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => table.setPageSize(Number(value))}
          >
            <SelectTrigger className="min-h-9 w-20 rounded-full border-border bg-background text-sm text-foreground hover:bg-accent focus:ring-primary">
              <SelectValue />
            </SelectTrigger>

            <SelectContent
              side="left"
              className="rounded-lg border-border bg-popover shadow-elevated"
            >
              {[10, 20, 25, 30, 40, 50].map((pageSize) => (
                <SelectItem
                  key={pageSize}
                  value={`${pageSize}`}
                  className="cursor-pointer rounded-lg focus:bg-accent focus:text-accent-foreground"
                >
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="min-w-24 text-center text-sm font-medium text-foreground">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="glass"
            size="sm"
            className="w-8"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to first page</span>
            <ChevronsLeft className="size-4" />
          </Button>

          <Button
            variant="glass"
            size="sm"
            className="w-8"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft className="size-4" />
          </Button>

          <Button
            variant="glass"
            size="sm"
            className="w-8"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight className="size-4" />
          </Button>

          <Button
            variant="glass"
            size="sm"
            className="w-8"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go to last page</span>
            <ChevronsRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
