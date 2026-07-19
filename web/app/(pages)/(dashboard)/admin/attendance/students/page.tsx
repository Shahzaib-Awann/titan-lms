"use client";

import { useState } from "react";
import { DataTable } from "@/components/ui/data-table/data-table";
import { Attendance, columns } from "./columns";
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
import { Button } from "@/components/ui/button";
import { CalendarIcon, ChevronDown } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export default function StudentAttendence() {
  const [batch, setBatch] = useState("all");
  const [selectedDate, setSelectedDate] = useState("");

  const data: Attendance[] = [
    {
      id: 1,
      student_id: "AI-12345",
      student_name: "Shahzaib Awan",
      last_marked: "8:00 AM",
      batch: "AI & DS",
      status: "present",
    },
    {
      id: 2,
      student_id: "2023-CS-043",
      student_name: "Ayesha Khan",
      last_marked: "9:00 AM",
      batch: "AI & DS",
      status: "present",
    },
    {
      id: 3,
      student_id: "2023-CS-044",
      student_name: "Ali Raza",
      last_marked: "10:00 AM",
      batch: "Web Development",
      status: "leave",
    },
    {
      id: 4,
      student_id: "2023-CS-045",
      student_name: "Fatima Noor",
      last_marked: "11:00 AM",
      batch: "AI & DS",
      status: "present",
    },
    {
      id: 5,
      student_id: "2023-CS-046",
      student_name: "Hassan Ahmed",
      last_marked: "12:00 AM",
      batch: "Cyber Security",
      status: "absent",
    },
  ];

  const filteredData = data.filter((student) => {
    return batch === "all" || student.batch === batch;
  });

  return (
    <div className="container mx-auto py-10 space-y-5">
      {/* Filters */}
      <div className="flex gap-4 items-center">
        {/* Batch Filter */}
        <Select
          value={batch}
          onValueChange={(value) => {
            if (value) {
              setBatch(value);
            }
          }}
        >
          <SelectTrigger className="w-50" onClick={(e) => e.stopPropagation()}>
            <SelectValue placeholder="Select Batch" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">All</SelectItem>

            <SelectItem value="AI & DS">AI & DS</SelectItem>

            <SelectItem value="Web Development">Web Development</SelectItem>

            <SelectItem value="Cyber Security">Cyber Security</SelectItem>
          </SelectContent>
        </Select>

        {/* Date Filter */}
        <Popover>
          <PopoverTrigger
            render={
              <Button
                variant="outline"
                className={cn(
                  "w-50 justify-start text-left font-normal",
                  !selectedDate && "text-muted-foreground",
                )}
              />
            }
          >
            <CalendarIcon className="mr-2 h-4 w-4" />

            {selectedDate ? (
              format(selectedDate, "yyyy-MM-dd")
            ) : (
              <span>Select date</span>
            )}
          </PopoverTrigger>

          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={new Date(selectedDate)}
              onSelect={(value) => {
                if (value) {
                  setSelectedDate(format(value, "yyyy-MM-dd"));
                }
              }}
            />
          </PopoverContent>
        </Popover>
      </div>

      <DataTable
        columns={columns}
        data={filteredData}
        globalFilterColumns={["student_id", "student_name", "batch", "status"]}
        renderSelectedActions={(students) => (
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button />}>
              Mark Attendance <ChevronDown />
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                <DropdownMenuLabel>
                  Actions ({students.length} selected)
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={() => {
                    console.log("Mark Present:", students);
                  }}
                >
                  Mark Present
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => {
                    console.log("Mark Late:", students);
                  }}
                >
                  Mark Late
                </DropdownMenuItem>

                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => {
                    console.log("Mark Absent:", students);
                  }}
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
