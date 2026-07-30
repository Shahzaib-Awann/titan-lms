import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Search,
  Plus,
  Check,
  Users,
  Phone,
  User,
  SearchX,
  LoaderCircle,
  IdCard,
} from "lucide-react";
import { StudentForEnrollmentList } from "../../../../app/(pages)/(dashboard)/admin/enrollments/create/page";
import { fetchStudentsForEnrollmentList } from "@/lib/actions/enrollment.action";
import { useDebounce } from "@/hooks/use-debounce";
import { StudentQueueCard } from "./student-queue-card";

interface StudentSelectionStepProps {
  onNext?: () => void;
  onValidationChange: (isValid: boolean) => void;
  selectedStudents: StudentForEnrollmentList[];
  setSelectedStudents: React.Dispatch<
    React.SetStateAction<StudentForEnrollmentList[]>
  >;
}

export const StudentSelectionStep = ({
  onValidationChange,
  selectedStudents,
  setSelectedStudents,
}: StudentSelectionStepProps) => {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const [students, setStudents] = useState<StudentForEnrollmentList[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadStudents = async () => {
      try {
        setIsLoading(true);

        const result = await fetchStudentsForEnrollmentList({
          search: debouncedSearch,
          limit: 10,
        });

        setStudents(result);
      } catch (error) {
        console.error("Failed to load students", error);
        setStudents([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadStudents();
  }, [debouncedSearch]);

  const addStudent = (student: StudentForEnrollmentList) => {
    const exists = selectedStudents.some((item) => item.id === student.id);
    if (!exists) {
      const updated = [...selectedStudents, student];
      setSelectedStudents(updated);
      onValidationChange(updated.length > 0);
    }
  };

  const removeStudent = (id: string) => {
    const updated = selectedStudents.filter((student) => student.id !== id);
    setSelectedStudents(updated);
    onValidationChange(updated.length > 0);
  };

  const clearAllSelected = () => {
    setSelectedStudents([]);
    onValidationChange(false);
  };

  return (
    <div className="w-full space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel: Student Search & Lookup */}
        <Card className="border col-span-1 lg:col-span-2 max-h-[80vh] flex flex-col rounded-xl shadow-sm overflow-hidden">
          <CardHeader className="px-6 pt-6 pb-4 border-b bg-muted/20">
            <div className="flex items-center gap-2 text-primary font-semibold text-sm">
              <Users className="size-4" />
              <span>Step 1</span>
            </div>
            <CardTitle className="text-xl">Student Lookup</CardTitle>
            <CardDescription>
              Search and add students to your enrollment queue.
            </CardDescription>
          </CardHeader>

          {/* Search Input Bar */}
          <div className="px-6 py-4">
            <Input
              placeholder="Search by name, roll number, or phone..."
              label="Search Student"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-background"
              icon={Search}
              clearable
              onClear={() => setSearch("")}
            />
          </div>

          {/* Student List */}
          <CardContent className="p-6 pt-1 space-y-3 overflow-y-auto flex-1">
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <LoaderCircle className="size-6 animate-spin text-primary mb-3" />
                <p className="text-sm">Searching students...</p>
              </div>
            )}
            {students.map((student) => {
              const isSelected = selectedStudents.some(
                (item) => item.id === student.id,
              );

              return (
                <div
                  key={student.id}
                  className={`group flex items-center justify-between gap-4 rounded-xl border p-4 transition-all duration-200 ${
                    isSelected
                      ? "border-primary/30 bg-primary/2"
                      : "border-border/80 bg-card hover:border-primary/40 hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <Avatar className="h-11 w-11 border border-border shrink-0">
                      <AvatarImage
                        src={student.avatar ?? undefined}
                        alt={student.name}
                      />
                      <AvatarFallback
                        initial={student.name}
                        className="text-xs font-semibold bg-primary/10 text-primary"
                      />
                    </Avatar>

                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {student.name}
                        </p>
                        <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-mono font-medium text-primary">
                          {student.rollNumber}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                        <span className="inline-flex items-center gap-1 truncate">
                          <IdCard className="size-3 text-muted-foreground/70" />
                          <span className="text-foreground/80 font-medium">
                            {student.cnic}
                          </span>
                        </span>
                        {student.guardianName && (
                          <>
                            <span className="text-border">•</span>
                            <span className="inline-flex items-center gap-1 truncate">
                              <User className="size-3 text-muted-foreground/70" />
                              <span className="text-foreground/80 font-medium">
                                {student.guardianName}
                              </span>
                            </span>
                          </>
                        )}
                        {student.phone && (
                          <>
                            <span className="text-border">•</span>
                            <span className="inline-flex items-center gap-1 font-mono">
                              <Phone className="size-3 text-muted-foreground/70" />
                              {student.phone}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    onClick={() => addStudent(student)}
                    variant={isSelected ? "secondary" : "primary"}
                    disabled={isSelected}
                    className={`shrink-0 transition-all ${
                      isSelected
                        ? "bg-secondary text-secondary-foreground"
                        : "shadow-xs"
                    }`}
                  >
                    {isSelected ? (
                      <span className="flex items-center gap-1 text-xs font-medium">
                        <Check className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                        Added
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-medium">
                        <Plus className="size-3.5" />
                        Add
                      </span>
                    )}
                  </Button>
                </div>
              );
            })}

            {!isLoading && students.length === 0 && (
              <div className="py-12 border border-dashed border-border rounded-xl flex flex-col items-center justify-center text-center space-y-3 bg-muted/10">
                <div className="p-3.5 rounded-full bg-muted text-muted-foreground/60">
                  <SearchX className="size-6" />
                </div>
                <div className="space-y-1 max-w-xs">
                  <h4 className="text-sm font-semibold text-foreground">
                    No students found
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    We couldn&apos;t find any student matching &quot;{search}
                    &quot;. Try searching by another name or roll number.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSearch("")}
                  className="text-xs mt-2"
                >
                  Clear Search
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Panel: Selected Students Queue */}
        <StudentQueueCard
          title="Selected Students"
          description="Queue ready for enrollment"
          selectedStudents={selectedStudents}
          onRemoveStudent={removeStudent}
          onClearAll={clearAllSelected}
          emptyMessage="Use the search panel on the left to find and add students to your bulk enrollment list."
        />
      </div>
    </div>
  );
};

export default StudentSelectionStep;
