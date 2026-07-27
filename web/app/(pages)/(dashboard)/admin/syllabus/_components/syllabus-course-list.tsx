"use client";

import { CourseSyllabusCard } from "./course-syllabus-card";
import { EmptyState } from "./empty-state";
import { CourseSyllabus } from "../_data/mock-data";

interface SyllabusCourseListProps {
  courses: CourseSyllabus[];
}

export function SyllabusCourseList({ courses }: SyllabusCourseListProps) {
  return (
    <div className="flex flex-col gap-6">
      {courses.length === 0 ? (
        <EmptyState variant={"no_courses"} />
      ) : (
        <div className="flex flex-col gap-5">
          <p className="text-sm text-muted-foreground">
            Showing{" "}
            <span className="font-medium text-foreground">
              {courses.length}
            </span>{" "}
            of{" "}
            <span className="font-medium text-foreground">
              {courses.length}
            </span>{" "}
            courses
          </p>

          {courses.map((course) => (
            <CourseSyllabusCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}
