"use client";

import React, { useState } from "react";
import { ModuleWithLessons, Lesson } from "../_types/syllabus";
import { SortableLessonRow } from "./sortable-lesson-row";
import {
  GripVertical,
  Pencil,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SortableModuleCardProps {
  module: ModuleWithLessons;
  onEditModule: (module: ModuleWithLessons) => void;
  onDeleteModule: (module: ModuleWithLessons) => void;
  onAddLesson: (moduleId: string) => void;
  onEditLesson: (lesson: Lesson, moduleId: string) => void;
  onDeleteLesson: (lesson: Lesson, moduleId: string) => void;
}

export const SortableModuleCard = ({
  module,
  onEditModule,
  onDeleteModule,
  onAddLesson,
  onEditLesson,
  onDeleteLesson,
}: SortableModuleCardProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: module.id!,
    data: {
      type: "module",
      module,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const lessonIds = module.lessons.map((l) => l.id!);

  return (
    <div ref={setNodeRef} style={style}>
      <Card className="shadow-sm">
        {/* Module Header */}
        <div className="flex items-start justify-between gap-6 p-6">
          <div className="flex items-start gap-3">
            <button
              type="button"
              {...attributes}
              {...listeners}
              className="mt-1 cursor-grab text-muted-foreground/75 hover:text-foreground active:cursor-grabbing touch-none"
            >
              <GripVertical className="size-5 shrink-0" />
            </button>

            {/* Collapse / Expand Toggle */}
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="mt-0.5 h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={() => setIsCollapsed((prev) => !prev)}
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight">
                {module.title}
              </h2>

              {module.description && (
                <p className="max-w-3xl line-clamp-2 text-muted-foreground">
                  {module.description}
                </p>
              )}

              <Badge variant="info" className="rounded-lg">
                {module.lessons.length} lessons
              </Badge>
            </div>
          </div>

          {/* Module Actions */}
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="outline"
              onClick={() => onEditModule(module)}
            >
              <Pencil className="h-4 w-4" />
            </Button>

            <Button
              size="icon"
              variant="ghost"
              className="border border-destructive/25 text-destructive hover:bg-destructive/25 hover:text-destructive"
              onClick={() => onDeleteModule(module)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Collapsible Section */}
        {!isCollapsed && (
          <>
            <div className="rounded-none border-b border-t border-border bg-card">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted uppercase dark:bg-foreground/5">
                    <TableHead className="w-15 text-xs font-semibold text-muted-foreground" />
                    <TableHead className="w-16 text-center text-xs font-semibold text-muted-foreground">
                      #
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground">
                      Title
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground">
                      Description
                    </TableHead>
                    <TableHead className="w-30 text-xs font-semibold text-muted-foreground">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  <SortableContext
                    items={lessonIds}
                    strategy={verticalListSortingStrategy}
                  >
                    {module.lessons.map((lesson, index) => (
                      <SortableLessonRow
                        key={lesson.id ?? lesson.title}
                        lesson={lesson}
                        index={index}
                        moduleId={module.id!}
                        onEdit={(l) => onEditLesson(l, module.id!)}
                        onDelete={(l) => onDeleteLesson(l, module.id!)}
                      />
                    ))}
                  </SortableContext>
                </TableBody>
              </Table>
            </div>

            <Button
              onClick={() => onAddLesson(module.id!)}
              variant="ghost"
              className="mx-auto w-fit text-primary hover:text-primary"
            >
              <Plus className="size-4" />
              Add Lesson
            </Button>
          </>
        )}
      </Card>
    </div>
  );
};
