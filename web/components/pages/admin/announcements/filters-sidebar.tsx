"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon, Sparkles } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

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

  const [status, setStatus] = useState(searchParams.get("status") ?? "all");

  const [audience, setAudience] = useState<string[]>(
    searchParams.get("audience")?.split(",") || [],
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

          {/* Status */}
          <div className="space-y-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              Status
            </span>

            <Select
              value={status}
              onValueChange={(value) => {
                const newStatus = value ?? "all";

                setStatus(newStatus);

                updateFilters({
                  status: newStatus,
                });
              }}
            >
              <SelectTrigger className="bg-background/50 border-border w-full capitalize">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>

                <SelectItem value="live">Live</SelectItem>

                <SelectItem value="scheduled">Scheduled</SelectItem>

                <SelectItem value="draft">Draft</SelectItem>

                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Audience */}
          <div className="space-y-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              Target Audience
            </span>

            <ToggleGroup
              value={audience}
              onValueChange={(value) => {
                const filteredAudience = value.filter(
                  (item) => item !== "all-members",
                );

                setAudience(value);

                updateFilters({
                  audience: filteredAudience.length
                    ? filteredAudience.join(",")
                    : undefined,
                });
              }}
              variant="outline"
              className="flex flex-row flex-wrap gap-2 p-1.5 items-stretch"
            >
              <ToggleGroupItem value="all-members">All Members</ToggleGroupItem>

              <ToggleGroupItem value="students">Students</ToggleGroupItem>

              <ToggleGroupItem value="instructors">Instructors</ToggleGroupItem>
            </ToggleGroup>
          </div>

          {/* Date Range */}
          <div className="space-y-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
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

                      // Remove invalid end date
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

                      // Safety check
                      if (startDate && date < startDate) {
                        return;
                      }

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
              setStatus("all");
              setAudience([]);
              setStartDate(undefined);
              setEndDate(undefined);

              router.push(window.location.pathname);
            }}
          >
            Reset Filters
          </Button>
        </CardContent>
      </Card>

      {/* Help Card */}

      <Card className="bg-linear-to-br from-primary to-primary/80 text-primary-foreground border-none shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-20">
          <Sparkles className="w-16 h-16" />
        </div>

        <div className="absolute -bottom-6 -left-6 opacity-10">
          <Sparkles className="w-32 h-32" />
        </div>

        <CardContent className="p-6 space-y-4 relative z-10">
          <h3 className="font-bold text-xl">Need Help?</h3>

          <p className="text-sm text-primary-foreground/90 font-medium leading-relaxed">
            Learn how to create high-engagement announcements that drive student
            success.
          </p>

          <Button
            variant="secondary"
            className="bg-white/20 hover:bg-white/30 text-white border-none mt-2"
          >
            View Guide
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
