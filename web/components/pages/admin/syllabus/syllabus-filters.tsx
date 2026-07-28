"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

import { useDebounce } from "@/hooks/use-debounce";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SortOption = "asc" | "desc";

const sortLabel: Record<SortOption, string> = {
  asc: "Ascending (A–Z)",
  desc: "Descending (Z–A)",
};

export function SyllabusFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentSearch = searchParams.get("search") ?? "";
  const currentSort = (searchParams.get("sort") as SortOption | null) ?? "";

  // Initialize once from the URL
  const [search, setSearch] = useState(() => currentSearch);

  const debouncedSearch = useDebounce(search, 300);

  const updateQueryParams = useCallback(
    (key: string, value?: string | null) => {
      const params = new URLSearchParams(searchParams.toString());

      if (!value?.trim()) {
        params.delete(key);
      } else {
        params.set(key, value);
      }

      const nextQuery = params.toString();
      const currentQuery = searchParams.toString();

      // Prevent unnecessary router.replace()
      if (nextQuery === currentQuery) return;

      router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router, searchParams],
  );

  // Update URL after debounce
  useEffect(() => {
    updateQueryParams("search", debouncedSearch);
  }, [debouncedSearch, updateQueryParams]);

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      {/* Search */}
      <div className="relative w-full lg:max-w-md">
        <Input
          icon={Search}
          type="text"
          placeholder="Search courses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-11 w-full"
        />
      </div>

      {/* Sort */}
      <div className="flex items-center gap-3">
        <Select
          value={currentSort}
          onValueChange={(value) => {
            updateQueryParams("sort", value);
          }}
        >
          <SelectTrigger
            className="
              min-h-11
              w-50
              rounded-xl
              border-border
              bg-card
              text-sm
              shadow-none
              transition-all
              hover:border-primary/40
              focus:ring-primary/30
            "
          >
            <SelectValue placeholder="Sort by">
              {currentSort ? sortLabel[currentSort] : "Sort by"}
            </SelectValue>
          </SelectTrigger>

          <SelectContent className="rounded-xl border-border bg-card">
            <SelectItem value="asc">Ascending (A–Z)</SelectItem>
            <SelectItem value="desc">Descending (Z–A)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
