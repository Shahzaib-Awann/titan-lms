import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SyllabusModule } from "@/types/syllabus";

interface CourseSyllabusStatsProps {
  course: {
    title: string;
    description: string;
  };
  modules: SyllabusModule[];
}

export const CourseSyllabusStats = ({
  course,
  modules,
}: CourseSyllabusStatsProps) => {
  const totalLessons = modules.reduce(
    (total, module) => total + module.lessons.length,
    0,
  );

  const averageLessons =
    modules.length > 0 ? Math.round(totalLessons / modules.length) : 0;

  const emptyModules = modules.filter(
    (module) => module.lessons.length === 0,
  ).length;

  const stats = [
    {
      label: "Modules",
      value: modules.length,
      color: "text-emerald-400",
    },
    {
      label: "Lessons",
      value: totalLessons,
      color: "text-orange-400",
    },
    {
      label: "Avg Lessons / Module",
      value: averageLessons,
      color: "text-blue-400",
    },
    {
      label: "Empty Modules",
      value: emptyModules,
      color: "text-red-400",
    },
  ];

  return (
    <Card className="xl:top-10 h-fit w-full shadow-sm xl:sticky col-span-1 order-1 xl:order-2">
      <CardContent>
        <CardHeader className="p-0">
          <span className="text-xs text-muted-foreground uppercase font-semibold">
            Course
          </span>

          <CardTitle className="text-base font-bold capitalize text-foreground">
            {course.title}
          </CardTitle>

          <span className="text-xs mt-2 text-muted-foreground uppercase font-semibold">
            Description
          </span>

          <CardDescription className="text-base font-bold capitalize text-foreground tracking-wide">
            {course.description}
          </CardDescription>
        </CardHeader>

        <div className="grid grid-cols-2 gap-4 mt-8">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex items-start flex-col p-4 bg-surface-2 border border-border w-full h-full shadow-sm rounded-lg"
            >
              <p className="font-bold text-xs text-muted-foreground uppercase">
                {stat.label}
              </p>

              <p className={`font-semibold text-3xl mt-2 ${stat.color}`}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
