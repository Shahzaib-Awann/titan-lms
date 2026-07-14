"use client";

import { useState } from "react";
import { DataTable } from "@/components/ui/data-table/data-table";
import { TrainerAttendance, columns } from "./columns";
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

export default function TrainerAttendancePage() {
  const [expertise, setExpertise] = useState("all");
  const [selectedDate, setSelectedDate] = useState("");

  const data: TrainerAttendance[] = [
    {
      id: 1,
      trainer_id: "TR-1001",
      trainer_name: "Ahmed Raza",
      expertise: "AI & DS",
      last_marked: "8:30 AM",
      status: "present",
    },
    {
      id: 2,
      trainer_id: "TR-1002",
      trainer_name: "Sara Khan",
      expertise: "Web Development",
      last_marked: "9:00 AM",
      status: "present",
    },
    {
      id: 3,
      trainer_id: "TR-1003",
      trainer_name: "Usman Ali",
      expertise: "Cyber Security",
      last_marked: "10:00 AM",
      status: "leave",
    },
    {
      id: 4,
      trainer_id: "TR-1004",
      trainer_name: "Hina Malik",
      expertise: "AI & DS",
      last_marked: "11:00 AM",
      status: "absent",
    },
  ];

  const filteredData = data.filter((trainer) => {
    return expertise === "all" || trainer.expertise === expertise;
  });

  return (
    <div className="container mx-auto py-10 space-y-5">
      {/* Filters */}
      <div className="flex gap-4 items-center">
        {/* expertise Filter */}
        <Select
          value={expertise}
          onValueChange={(value) => {
            if (value) {
              setExpertise(value);
            }
          }}
        >
          <SelectTrigger className="w-50" onClick={(e) => e.stopPropagation()}>
            <SelectValue placeholder="Select expertise" />
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
        globalFilterColumns={[
          "trainer_id",
          "trainer_name",
          "expertise",
          "status",
        ]}
        renderSelectedActions={(trainers) => (
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button />}>
              Mark Attendance <ChevronDown />
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                <DropdownMenuLabel>
                  Actions ({trainers.length} selected)
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={() => {
                    console.log("Mark Present:", trainers);
                  }}
                >
                  Mark Present
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => {
                    console.log("Mark Late:", trainers);
                  }}
                >
                  Mark Late
                </DropdownMenuItem>

                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => {
                    console.log("Mark Absent:", trainers);
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
