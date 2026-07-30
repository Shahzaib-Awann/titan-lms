import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IdCard, Phone, Trash2, UserPlus } from "lucide-react";
import { StudentForEnrollmentList } from "../../../../app/(pages)/(dashboard)/admin/enrollments/create/page";

interface StudentQueueCardProps {
  title?: string;
  description?: string;
  selectedStudents: StudentForEnrollmentList[];
  onRemoveStudent?: (id: string) => void;
  onClearAll?: () => void;
  emptyMessage?: string;
}

export const StudentQueueCard: React.FC<StudentQueueCardProps> = ({
  title = "Selected Students",
  description = "Queue ready for enrollment",
  selectedStudents,
  onRemoveStudent,
  onClearAll,
  emptyMessage = "Use the search panel to add students to your queue.",
}) => {
  return (
    <Card className="border col-span-1 max-h-[80vh] flex flex-col rounded-xl shadow-sm overflow-hidden bg-card">
      <CardHeader className="px-5 py-4 border-b bg-muted/20">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <span>{title}</span>
          </CardTitle>
          <Badge
            variant={selectedStudents.length > 0 ? "default" : "secondary"}
            className="rounded-full px-2.5 py-0.5 text-xs font-medium"
          >
            {selectedStudents.length}{" "}
            {selectedStudents.length === 1 ? "Student" : "Students"}
          </Badge>
        </div>
        <div className="flex items-center justify-between mt-1">
          <CardDescription className="text-xs">{description}</CardDescription>
          {onClearAll && selectedStudents.length > 0 && (
            <button
              type="button"
              onClick={onClearAll}
              className="text-[11px] font-medium text-muted-foreground hover:text-destructive transition-colors"
            >
              Clear all
            </button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-3 overflow-y-auto flex-1">
        {selectedStudents.map((student) => (
          <div
            key={student.id}
            className="group relative flex items-center justify-between gap-3 rounded-lg border border-border/80 bg-background p-3 transition-all duration-200 hover:border-primary/40 hover:shadow-sm"
          >
            <div className="flex items-center gap-3 min-w-0">
              <Avatar className="h-10 w-10 shrink-0 border border-border">
                <AvatarImage
                  src={student.avatar ?? undefined}
                  alt={student.name}
                />
                <AvatarFallback
                  initial={student.name}
                  className="text-xs font-semibold bg-primary/10 text-primary"
                />
              </Avatar>

              <div className="min-w-0 space-y-0.5">
                <div className="flex gap-2">
                  <p className="text-sm font-medium text-foreground truncate">
                    {student.name}
                  </p>
                  <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-mono font-medium text-primary">
                    {student.rollNumber}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1 truncate">
                    <IdCard className="size-3 text-muted-foreground/70" />
                    <span className="text-muted-foreground text-xs font-medium">
                      {student.cnic}
                    </span>
                  </span>
                  {student.phone && (
                    <>
                      <span className="text-border">•</span>
                      <span className="inline-flex items-center gap-1 truncate">
                        <Phone className="size-3 text-muted-foreground/70" />
                        <span className="text-muted-foreground text-xs font-medium">
                          {student.phone}
                        </span>
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {onRemoveStudent && (
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                onClick={() => onRemoveStudent(student.id)}
                title="Remove student"
              >
                <Trash2 className="size-4" />
              </Button>
            )}
          </div>
        ))}

        {selectedStudents.length === 0 && (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-2">
            <div className="p-4 rounded-full bg-muted text-muted-foreground/60">
              <UserPlus className="size-6" />
            </div>
            <p className="text-sm font-medium text-foreground">
              Queue is empty
            </p>
            <p className="text-xs text-muted-foreground max-w-50">
              {emptyMessage}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StudentQueueCard;
