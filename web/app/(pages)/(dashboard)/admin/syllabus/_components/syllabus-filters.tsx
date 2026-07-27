"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, SlidersHorizontal } from "lucide-react";

export function SyllabusFilters() {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      {/* Search */}
      <div className="relative w-full lg:max-w-md">
        <Input
          icon={Search}
          type="text"
          placeholder="Search courses..."
          className="
            h-11
            w-full
          "
        />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div
          className="
            hidden
            h-11
            w-11
            items-center
            justify-center
            rounded-xl
            border
            border-border
            bg-card
            text-muted-foreground
            sm:flex
          "
        >
          <SlidersHorizontal className="size-4" />
        </div>

        <Select>
          <SelectTrigger
            className="
              min-h-11
              w-41.5
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
            <SelectValue placeholder="All Status" />
          </SelectTrigger>

          <SelectContent className="rounded-xl border-border bg-card">
            <SelectItem value="all">All Status</SelectItem>

            <SelectItem value="published">Published</SelectItem>

            <SelectItem value="draft">Draft</SelectItem>

            <SelectItem value="not_created">Not Created</SelectItem>
          </SelectContent>
        </Select>

        <Select>
          <SelectTrigger
            className="
              min-h-11
              w-41.5
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
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>

          <SelectContent className="rounded-xl border-border bg-card">
            <SelectItem value="recent">Recently Added</SelectItem>

            <SelectItem value="name">Course Name</SelectItem>

            <SelectItem value="progress">Progress</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
