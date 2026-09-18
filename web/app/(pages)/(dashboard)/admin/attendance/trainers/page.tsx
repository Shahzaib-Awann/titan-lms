"use client";

import { useCallback, useState } from "react";
import { DataTable } from "@/components/ui/data-table/data-table";
import { TrainerAttendance, columns } from "./columns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { CalendarIcon, ChevronDown, TriangleAlertIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { formatDate } from "@/lib/helpers/date-fns";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import {
  getTrainerAttendance,
  updateAttendance,
} from "@/lib/actions/attendance.action";
import { AttendanceStatus } from "@/types/common";

export default function TrainerAttendancePage() {
  // Local States
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [attendance, setAttendance] = useState<TrainerAttendance[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetches attendance based on the current filters.
  const handleSearch = useCallback(async () => {
    const search = searchInput.trim();

    // Search mode allows searching with optional batch/date filters.
    if (search) {
      try {
        setLoading(true);

        const result = await getTrainerAttendance({
          search,
          attendanceDate: selectedDate || undefined,
        });

        setAttendance(result);
      } catch (error) {
        console.error("Failed to search attendance:", error);
        setAttendance([]);
        toast.error("Failed to fetch attendance.");
      } finally {
        setLoading(false);
      }

      return;
    }

    // Normal attendance mode also requires a date.
    if (!selectedDate) {
      toast("Please select an attendance date.", {
        icon: <TriangleAlertIcon className="size-5 text-yellow-500" />,
      });
      return;
    }

    try {
      setLoading(true);

      const result = await getTrainerAttendance({
        attendanceDate: selectedDate,
        search: undefined,
      });

      setAttendance(result);
    } catch (error) {
      console.error("Failed to fetch attendance:", error);
      setAttendance([]);
      toast.error("Failed to fetch attendance.");
    } finally {
      setLoading(false);
    }
  }, [searchInput, selectedDate]);

  // Updates the attendance status for all selected trainers.
  const handleAttendanceChange = useCallback(
    async (trainers: TrainerAttendance[], status: AttendanceStatus) => {
      if (!trainers.length) return;

      try {
        // Updates all selected trainers concurrently.
        const result = await Promise.all(
          trainers.map(({ id }) =>
            updateAttendance({ type: "trainer", id, status }),
          ),
        );

        // Refreshes the table using the current filters.
        await handleSearch();

        console.log(result);
      } catch (error) {
        console.error("Failed to update attendance:", error);

        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to update attendance.",
        );
      }
    },
    [handleSearch],
  );

  return (
    <div className="container mx-auto space-y-5 py-10">
      {/* Contains all attendance filters and search controls. */}
      <div className="flex items-center gap-4">
        {/* Trainer search input. */}
        <Input
          placeholder="Search trainer..."
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          wrapperClassName="w-full max-w-sm"
        />

        {/* Attendance date picker. */}
        <Popover>
          <PopoverTrigger
            render={
              <Button
                variant="outline"
                className={cn(
                  "w-50 justify-start bg-card text-left font-normal",
                  !selectedDate && "text-muted-foreground",
                )}
              />
            }
          >
            <CalendarIcon className="mr-2 size-4" />

            {selectedDate ? formatDate(selectedDate) : <span>Select date</span>}
          </PopoverTrigger>

          <PopoverContent className="w-auto p-5">
            {/* Calendar for selecting the attendance date. */}
            <Calendar
              mode="single"
              className="border-none p-0 shadow-none"
              selected={selectedDate ? new Date(selectedDate) : undefined}
              onSelect={(date) => {
                if (date) {
                  setSelectedDate(format(date, "yyyy-MM-dd"));
                }
              }}
            />

            {/* Clears the currently selected date. */}
            <Button variant="ghost" onClick={() => setSelectedDate(null)}>
              Clear
            </Button>
          </PopoverContent>
        </Popover>

        {/* Executes the attendance search. */}
        <Button onClick={handleSearch} disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </Button>
      </div>

      {/* Displays attendance records in the reusable data table. */}
      <DataTable
        className={loading ? "opacity-75" : "opacity-100"}
        columns={columns}
        data={attendance}
        disableSearchBar
        enableViewOptions={false}
        renderSelectedActions={(trainers) => (
          // Provides bulk attendance actions for selected trainers.
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button />}>
              Mark Attendance <ChevronDown />
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                {/* Shows how many trainers are selected. */}
                <DropdownMenuLabel>
                  Actions ({trainers.length} selected)
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                {/* Marks selected trainers as present. */}
                <DropdownMenuItem
                  onClick={() => handleAttendanceChange(trainers, "present")}
                >
                  Mark Present
                </DropdownMenuItem>

                {/* Marks selected trainers as on leave. */}
                <DropdownMenuItem
                  onClick={() => handleAttendanceChange(trainers, "leave")}
                >
                  Mark Leave
                </DropdownMenuItem>

                {/* Marks selected trainers as absent. */}
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => handleAttendanceChange(trainers, "absent")}
                >
                  Mark Absent
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      />
    </div>
  );
}
