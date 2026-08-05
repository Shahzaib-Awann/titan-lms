"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import { CheckCircle2, ChevronDown, ChevronUp, Clock3 } from "lucide-react";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import toast from "react-hot-toast";
import { LessonStatusDropdown } from "./lesson-status-dropdown";
import { updateTrainerLessonProgress } from "@/lib/actions/batch.action";

interface BatchModulesCardProps {
  batchId: string;
  modules: {
    id: string;
    title: string;
    description: string | null;
    orderIndex: number;
    status: "completed" | "in_progress" | "not_started";
    moduleProgressPercentage: number;
    totalLessonsCount: number;
    lessons: {
      id: string;
      title: string;
      description: string | null;
      orderIndex: number;
      progressStatus: "completed" | "in_progress" | "not_started" | "skipped";
    }[];
  }[];
}

export default function BatchModulesCard({
  batchId,
  modules,
}: BatchModulesCardProps) {
  const [openModule, setOpenModule] = useState<string | null>(null);

  const handleLessonStatus = async (
    moduleId: string,
    lessonId: string,
    action: string,
  ) => {
    if (!moduleId || !lessonId || !action) {
      toast.error("Invalid Data");
      return;
    }

    const response = await updateTrainerLessonProgress({
      moduleId,
      lessonId,
      batchId,
      action: action as "completed" | "in_progress" | "not_started" | "skipped",
    });

    if (!response.success) {
      toast.error(response.message);
      return;
    }

    toast.success("Lesson progress updated successfully");
  };

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-normal uppercase tracking-wider text-muted-foreground">
        Curriculum Roadmap
      </h2>

      {modules.map((module, moduleIndex) => {
        const isOpen = openModule === module.id;

        return (
          <Collapsible
            key={module.id}
            open={isOpen}
            onOpenChange={(open) => setOpenModule(open ? module.id : null)}
          >
            <Card className="rounded-2xl shadow-sm p-0">
              <CollapsibleTrigger
                render={
                  <button className="flex w-full items-center justify-between p-6 text-left transition hover:bg-muted/30">
                    <div className="flex items-center gap-5">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
                        {module.status === "completed" ? (
                          <CheckCircle2 className="h-7 w-7 text-emerald-400" />
                        ) : (
                          <Clock3 className="h-6 w-6 text-violet-300" />
                        )}
                      </div>

                      <div>
                        <h3 className="text-2xl font-semibold">
                          {moduleIndex + 1}. {module.title}
                        </h3>

                        <p className="mt-1 font-medium text-muted-foreground">
                          {module.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-5">
                      <div className="text-right">
                        <Badge
                          variant={
                            module.status === "completed"
                              ? "success"
                              : module.status === "in_progress"
                                ? "info"
                                : "secondary"
                          }
                        >
                          {module.status === "completed"
                            ? "Completed"
                            : module.status === "in_progress"
                              ? "In Progress"
                              : "Not Started"}
                        </Badge>

                        <p className="mt-2 text-sm text-muted-foreground">
                          {module.totalLessonsCount} Lessons •{" "}
                          {module.moduleProgressPercentage}%
                        </p>
                      </div>

                      {isOpen ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </button>
                }
              />

              <CollapsibleContent className="p-2">
                <CardContent className="divide-y p-0 bg-background rounded-lg">
                  {module.lessons.map((lesson, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between px-6 py-5"
                    >
                      <div className="flex items-center gap-4">
                        <p className="font-bold">
                          {moduleIndex + 1}.{index + 1}
                        </p>
                        <div>
                          <h4 className="text-lg font-medium">
                            {lesson.title}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {lesson.description}
                          </p>
                        </div>
                      </div>
                      <LessonStatusDropdown
                        moduleId={module.id}
                        lessonId={lesson.id}
                        status={lesson.progressStatus}
                        onChange={handleLessonStatus}
                      />
                    </div>
                  ))}
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        );
      })}
    </div>
  );
}
