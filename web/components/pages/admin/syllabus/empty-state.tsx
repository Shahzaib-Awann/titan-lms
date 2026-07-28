import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, FileX } from "lucide-react";
import Link from "next/link";

interface EmptyStateProps {
  variant: "no_syllabus" | "no_courses" | "no_results";
  courseId?: string;
}

const config = {
  no_syllabus: {
    icon: FileX,
    title: "No Syllabus Created Yet",
    message:
      "This course doesn't have a syllabus. Create one to organize modules and lessons for your students.",
  },
  no_courses: {
    icon: BookOpen,
    title: "No Courses Available",
    message:
      "There are no courses to display. Create a course first before managing syllabuses.",
  },
  no_results: {
    icon: FileX,
    title: "No Courses Found",
    message:
      "No courses match your current search and filter criteria. Try adjusting your filters.",
  },
};

export function EmptyState({ variant, courseId }: EmptyStateProps) {
  const { icon: Icon, title, message } = config[variant];

  return (
    <Card className="h-full border-dashed shadow-sm">
      <CardContent className="flex h-full min-h-72 flex-col items-center justify-center px-6 py-10 text-center">
        <div className="mb-6 flex size-20 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
          <Icon className="size-9 text-primary" />
        </div>

        <CardHeader className="space-y-2 p-0">
          <CardTitle>{title}</CardTitle>
          <CardDescription className="max-w-md text-sm leading-relaxed">
            {message}
          </CardDescription>
        </CardHeader>

        {variant === "no_courses" && (
          <Link href="/admin/courses/create" className="mt-6">
            <Button>Create Course</Button>
          </Link>
        )}

        {variant === "no_syllabus" && courseId && (
          <Link href={`/admin/syllabus/${courseId}`} className="mt-6">
            <Button>Create Syllabus</Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
