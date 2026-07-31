"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

import { format } from "date-fns";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export const FiltersSidebar = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [audience, setAudience] = useState(
    searchParams.get("audience") ?? "all",
  );

  const [visibility, setVisibility] = useState(
    searchParams.get("visibility") ?? "both",
  );

  const [startDate, setStartDate] = useState<Date | undefined>(
    searchParams.get("startDate")
      ? new Date(searchParams.get("startDate")!)
      : undefined,
  );

  const [endDate, setEndDate] = useState<Date | undefined>(
    searchParams.get("endDate")
      ? new Date(searchParams.get("endDate")!)
      : undefined,
  );

  const updateFilters = (
    updates: Record<string, string | null | undefined>,
  ) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (!value || value === "all") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    router.push(`?${params.toString()}`);
  };

  return (
    <div className="space-y-4">
      <Card className="shadow-sm">
        <CardContent className="p-5 space-y-6">
          <h3 className="font-bold text-lg">Filters</h3>

          {/* Audience */}
          <div className="space-y-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Audience
            </span>

            <Select
              value={audience}
              onValueChange={(value) => {
                if (!value) return;

                setAudience(value);

                updateFilters({
                  audience: value,
                });
              }}
            >
              <SelectTrigger className="w-full capitalize">
                <SelectValue placeholder="All Audience" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="students">Students</SelectItem>
                <SelectItem value="trainers">Trainers</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Visibility */}
          <div className="space-y-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Visibility
            </span>

            <ToggleGroup
              value={[visibility]}
              onValueChange={(value) => {
                const selected = value[0];

                if (!selected) return;

                setVisibility(selected);

                updateFilters({
                  visibility: selected === "both" ? undefined : selected,
                });
              }}
              variant="outline"
              className="flex gap-2"
            >
              <ToggleGroupItem value="both">Both</ToggleGroupItem>
              <ToggleGroupItem value="public">Public</ToggleGroupItem>

              <ToggleGroupItem value="private">Private</ToggleGroupItem>
            </ToggleGroup>
          </div>

          {/* Date Range */}
          <div className="space-y-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Date Range
            </span>

            <div className="space-y-3">
              {/* Start Date */}
              <Popover>
                <PopoverTrigger
                  render={
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground",
                      )}
                    />
                  }
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />

                  {startDate ? (
                    format(startDate, "yyyy-MM-dd")
                  ) : (
                    <span>Start date</span>
                  )}
                </PopoverTrigger>

                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => {
                      if (!date) return;

                      setStartDate(date);

                      if (endDate && date > endDate) {
                        setEndDate(undefined);

                        updateFilters({
                          startDate: format(date, "yyyy-MM-dd"),
                          endDate: undefined,
                        });

                        return;
                      }

                      updateFilters({
                        startDate: format(date, "yyyy-MM-dd"),
                      });
                    }}
                  />
                </PopoverContent>
              </Popover>

              {/* End Date */}
              <Popover>
                <PopoverTrigger
                  render={
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground",
                      )}
                    />
                  }
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />

                  {endDate ? (
                    format(endDate, "yyyy-MM-dd")
                  ) : (
                    <span>End date</span>
                  )}
                </PopoverTrigger>

                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    disabled={(date) => (startDate ? date < startDate : false)}
                    onSelect={(date) => {
                      if (!date) return;

                      setEndDate(date);

                      updateFilters({
                        endDate: format(date, "yyyy-MM-dd"),
                      });
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Reset */}
          <Button
            variant="secondary"
            className="w-full bg-background/80 hover:bg-background border border-border"
            onClick={() => {
              setAudience("all");
              setVisibility("public");
              setStartDate(undefined);
              setEndDate(undefined);

              router.push(window.location.pathname);
            }}
          >
            Reset Filters
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
