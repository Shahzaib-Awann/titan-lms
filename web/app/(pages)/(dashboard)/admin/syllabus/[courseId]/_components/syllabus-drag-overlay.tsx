"use client";

import React from "react";
import { DragOverlay } from "@dnd-kit/core";
import { ModuleWithLessons, Lesson } from "../_types/syllabus";
import { Card } from "@/components/ui/card";
import { GripVertical } from "lucide-react";

export interface ActiveDragItem {
  type: "module" | "lesson";
  module?: ModuleWithLessons;
  lesson?: Lesson;
}

interface SyllabusDragOverlayProps {
  activeItem: ActiveDragItem | null;
}

export const SyllabusDragOverlay = ({
  activeItem,
}: SyllabusDragOverlayProps) => {
  return (
    <DragOverlay>
      {activeItem?.type === "module" && activeItem.module ? (
        <Card className="p-6 shadow-xl opacity-90 border-primary">
          <div className="flex items-center gap-3">
            <GripVertical className="size-5 text-muted-foreground" />
            <h2 className="text-xl font-bold">{activeItem.module.title}</h2>
          </div>
        </Card>
      ) : activeItem?.type === "lesson" && activeItem.lesson ? (
        <div className="rounded-md border border-primary bg-card p-4 shadow-xl opacity-90">
          <p className="text-sm font-semibold">{activeItem.lesson.title}</p>
        </div>
      ) : null}
    </DragOverlay>
  );
};
