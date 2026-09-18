"use client";

import { useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, ChevronDown, TriangleAlertIcon } from "lucide-react";
import toast from "react-hot-toast";

import { DataTable } from "@/components/ui/data-table/data-table";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/helpers/date-fns";
import {
  getAllBatches,
  getStudentAttendance,
  updateAttendance,
} from "@/lib/actions/attendance.action";
import { AttendanceStatus } from "@/types/common";
import { Attendance, columns } from "./columns";

// Defines the shape of a batch returned from the server.
type Batch = {
  batchId: string;
  batchName: string;
  batchStatus: string;
};

export default function StudentAttendence() {
  // Local States
  const [selectedBatchId, setSelectedBatchId] = useState("null");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [batches, setBatches] = useState<Batch[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetches batches once when the component mounts.
  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const result = await getAllBatches();
        setBatches(result);
      } catch (error) {
        console.error("Failed to fetch batches:", error);
        toast.error("Failed to fetch batches.");
      }
    };

    fetchBatches();
  }, []);

  // Fetches attendance based on the current filters.
  const handleSearch = useCallback(async () => {
    const search = searchInput.trim();

    // Search mode allows searching with optional batch/date filters.
    if (search) {
      try {
        setLoading(true);

        const result = await getStudentAttendance({
          search,
          batchId: selectedBatchId !== "null" ? selectedBatchId : undefined,
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

    // Normal attendance mode requires a batch.
    if (selectedBatchId === "null") {
      toast("Please select a batch.", {
        icon: <TriangleAlertIcon className="size-5 text-yellow-500" />,
      });
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

      const result = await getStudentAttendance({
        batchId: selectedBatchId,
        attendanceDate: selectedDate,
      });

      setAttendance(result);
    } catch (error) {
      console.error("Failed to fetch attendance:", error);
      setAttendance([]);
      toast.error("Failed to fetch attendance.");
    } finally {
      setLoading(false);
    }
  }, [searchInput, selectedBatchId, selectedDate]);

  // Updates the attendance status for all selected students.
  const handleAttendanceChange = useCallback(
    async (students: Attendance[], status: AttendanceStatus) => {
      if (!students.length) return;

      try {
        // Updates all selected students concurrently.
        await Promise.all(
          students.map(({ id }) =>
            updateAttendance({ type: "student", id, status }),
          ),
        );

        // Refreshes the table using the current filters.
        await handleSearch();
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

  // Finds the selected batch name without storing duplicate state.
  const selectedBatchName = batches.find(
    (batch) => batch.batchId === selectedBatchId,
  )?.batchName;

  return (
    <div className="container mx-auto space-y-5 py-10">
      {/* Contains all attendance filters and search controls. */}
      <div className="flex items-center gap-4">
        {/* Student search input. */}
        <Input
          placeholder="Search student..."
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          wrapperClassName="w-full max-w-sm"
        />

        {/* Batch selection filter. */}
        <Select
          value={selectedBatchId}
          onValueChange={(value) => {
            if (value) {
              setSelectedBatchId(value);
            }
          }}
        >
          <SelectTrigger className="min-h-11 min-w-60 bg-card disabled:opacity-50">
            <SelectValue placeholder="Select a course first">
              {selectedBatchId === "null" ? "Select Option" : selectedBatchName}
            </SelectValue>
          </SelectTrigger>

          <SelectContent className="min-w-70">
            {/* Default empty batch option. */}
            <SelectItem value="null">Select Option</SelectItem>

            {/* Renders all available batches. */}
            {batches.map((batch) => (
              <SelectItem key={batch.batchId} value={batch.batchId}>
                <div className="flex items-center gap-2">
                  <span>{batch.batchName}</span>

                  {/* Displays the current batch status. */}
                  <Badge
                    variant={
                      batch.batchStatus === "live"
                        ? "default"
                        : batch.batchStatus === "upcoming"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {batch.batchStatus}
                  </Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

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
        columns={columns}
        data={attendance}
        disableSearchBar
        enableViewOptions={false}
        renderSelectedActions={(students) => (
          // Provides bulk attendance actions for selected students.
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button />}>
              Mark Attendance <ChevronDown />
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                {/* Shows how many students are selected. */}
                <DropdownMenuLabel>
                  Actions ({students.length} selected)
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                {/* Marks selected students as present. */}
                <DropdownMenuItem
                  onClick={() => handleAttendanceChange(students, "present")}
                >
                  Mark Present
                </DropdownMenuItem>

                {/* Marks selected students as on leave. */}
                <DropdownMenuItem
                  onClick={() => handleAttendanceChange(students, "leave")}
                >
                  Mark Leave
                </DropdownMenuItem>

                {/* Marks selected students as absent. */}
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => handleAttendanceChange(students, "absent")}
                >
                  Mark Absent
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      />

      {/* Displays an additional loading indicator below the table. */}
      {loading && (
        <div className="text-center text-sm text-muted-foreground">
          Loading attendance...
        </div>
      )}
    </div>
  );
}
