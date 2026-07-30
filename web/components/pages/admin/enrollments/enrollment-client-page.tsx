"use client";

import { DataTable } from "@/components/ui/data-table/data-table";
import React, { useState } from "react";
import {
  StudentEnrollment,
  columns,
} from "../../../../app/(pages)/(dashboard)/admin/enrollments/columns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TransferStudentsDialog } from "./transfer-students-dialog";
import { Course } from "../../../../app/(pages)/(dashboard)/admin/enrollments/create/page";
import toast from "react-hot-toast";
import { updateStudentEnrollmentStatus } from "@/lib/actions/enrollment.action";

interface EnrollmentClientPageProps {
  data: StudentEnrollment[];
  courses: Course[];
}

const EnrollmentClientPage = ({
  data,
  courses = [],
}: EnrollmentClientPageProps) => {
  const [openTransferDialog, setOpenTransferDialog] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<StudentEnrollment[]>(
    [],
  );
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const handleStatusChange = async (
    students: StudentEnrollment[],
    action: "completed" | "suspended" | "dropped",
  ) => {
    if (!students.length) return;

    setIsUpdatingStatus(true);

    try {
      const response = await updateStudentEnrollmentStatus({
        enrollmentIds: students.map((student) => student.id),
        action,
      });

      toast.success(response.message);
    } catch (error) {
      console.error("Status update failed:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update enrollment status.",
      );
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <DataTable
        columns={columns}
        data={data}
        globalFilterColumns={[
          "student.name",
          "student.rollNumber",
          "course.name",
          "batch.name",
          "trainer.name",
          "enrollment.status",
        ]}
        createButton={{
          icon: true,
          label: "Bulk Enrollment",
          href: "/admin/enrollments/create",
        }}
        renderSelectedActions={(students) => (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button />}>
                Actions <ChevronDown className="ml-2 h-4 w-4" />
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>
                    Actions ({students.length} selected)
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={() => {
                      setSelectedStudents(students);
                      setOpenTransferDialog(true);
                    }}
                  >
                    Transfer Course / Batch
                  </DropdownMenuItem>
                </DropdownMenuGroup>

                <DropdownMenuGroup>
                  <DropdownMenuLabel className="py-2">
                    Change Status
                  </DropdownMenuLabel>
                  <DropdownMenuItem
                    disabled={isUpdatingStatus}
                    onClick={() => handleStatusChange(students, "completed")}
                  >
                    Mark Completed
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    disabled={isUpdatingStatus}
                    onClick={() => handleStatusChange(students, "suspended")}
                  >
                    Suspend Enrollment
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    variant="destructive"
                    disabled={isUpdatingStatus}
                    onClick={() => handleStatusChange(students, "dropped")}
                  >
                    Remove Enrollment
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <TransferStudentsDialog
              open={openTransferDialog}
              onOpenChange={setOpenTransferDialog}
              students={selectedStudents}
              courses={courses}
            />
          </>
        )}
      />
    </div>
  );
};

export default EnrollmentClientPage;
