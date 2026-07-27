"use client";

import React from "react";
import { Lesson } from "../_types/syllabus";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { GripVertical, Pencil, Trash2 } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SortableLessonRowProps {
  lesson: Lesson;
  index: number;
  moduleId: string;
  onEdit: (lesson: Lesson) => void;
  onDelete: (lesson: Lesson) => void;
}

export const SortableLessonRow = ({
  lesson,
  index,
  moduleId,
  onEdit,
  onDelete,
}: SortableLessonRowProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: lesson.id!,
    data: {
      type: "lesson",
      lesson,
      moduleId,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className="group transition-colors hover:bg-muted/50"
    >
      {/* Drag Handle */}
      <TableCell className="w-15">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="ml-auto flex cursor-grab items-center text-muted-foreground/75 hover:text-foreground active:cursor-grabbing touch-none"
        >
          <GripVertical className="size-5" />
        </button>
      </TableCell>

      {/* Number */}
      <TableCell className="w-16 text-center text-muted-foreground">
        {index + 1}
      </TableCell>

      {/* Title */}
      <TableCell>
        <p className="text-sm font-medium text-foreground">{lesson.title}</p>
      </TableCell>

      {/* Description */}
      <TableCell>
        <p className="max-w-xl truncate line-clamp-2 text-sm text-muted-foreground">
          {lesson.description || "No description available."}
        </p>
      </TableCell>

      {/* Actions */}
      <TableCell className="w-30">
        <div className="flex justify-end gap-2 opacity-0 transition-opacity group-hover:opacity-100">
          <Button size="icon" variant="ghost" onClick={() => onEdit(lesson)}>
            <Pencil className="h-4 w-4" />
          </Button>

          <Button
            size="icon"
            variant="ghost"
            className="text-destructive hover:bg-destructive/25 hover:text-destructive"
            onClick={() => onDelete(lesson)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};
