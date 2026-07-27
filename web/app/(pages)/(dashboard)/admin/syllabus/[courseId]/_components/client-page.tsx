"use client";

import React, { useState } from "react";
import { ModuleWithLessons } from "../_types/syllabus";
import { SyllabusHeader } from "../_components/syllabus-header";
import { SyllabusDialog } from "./syllabus-dialog";
import { GripVertical, Pencil, Plus, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SyllabusDeleteConfirmDialog } from "./syllabus-delete-confirm-dialog";
import { Badge } from "@/components/ui/badge";

interface SyllabusClientPageProps {
  initialModules: ModuleWithLessons[];
  course: {
    id: string;
    title: string;
    description: string;
  };
}

export const createTempId = () => {
  return `temp-${crypto.randomUUID()}`;
};

export const isTempId = (id?: string | null) => {
  return id?.startsWith("temp-");
};

export const SyllabusClientPage = ({
  initialModules,
  course,
}: SyllabusClientPageProps) => {
  const [open, setOpen] = useState(false);
  const [modules, setModules] = useState(initialModules);
  const [lessonModuleId, setLessonModuleId] = useState<string | null>(null);
  const [editingModule, setEditingModule] = useState<ModuleWithLessons | null>(
    null,
  );
  const [editingLesson, setEditingLesson] = useState<{
    id: string | null;
    title: string;
    description: string | null;
    orderIndex: number;
    moduleId: string;
  } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "module" | "lesson";
    moduleId: string | null;
    lessonId?: string | null;
    title: string;
  } | null>(null);

  const handleModuleSubmit = (data: {
    id?: string | null;
    title: string;
    description: string | null;
  }) => {
    if (data.id) {
      setModules((prev) =>
        prev.map((m) =>
          m.id === data.id
            ? {
                ...m,
                title: data.title,
                description: data.description,
              }
            : m,
        ),
      );
    } else {
      const newModule: ModuleWithLessons = {
        id: createTempId(),
        title: data.title,
        description: data.description,
        orderIndex: modules.length,
        lessons: [],
      };

      setModules((prev) => [...prev, newModule]);
    }

    setEditingModule(null);
  };

  const handleLessonSubmit = (data: {
    id?: string | null;
    title: string;
    description: string | null;
  }) => {
    const moduleId = editingLesson?.moduleId ?? lessonModuleId;

    if (!moduleId) return;

    if (data.id) {
      setModules((prev) =>
        prev.map((module) =>
          module.id === moduleId
            ? {
                ...module,
                lessons: module.lessons.map((lesson) =>
                  lesson.id === data.id
                    ? {
                        ...lesson,
                        title: data.title,
                        description: data.description,
                      }
                    : lesson,
                ),
              }
            : module,
        ),
      );
    } else {
      // Create new lesson
      const newLesson = {
        id: createTempId(),
        title: data.title,
        description: data.description,
        orderIndex: modules.find((m) => m.id === moduleId)?.lessons.length ?? 0,
      };

      setModules((prev) =>
        prev.map((module) =>
          module.id === moduleId
            ? {
                ...module,
                lessons: [...module.lessons, newLesson],
              }
            : module,
        ),
      );
    }

    setLessonModuleId(null);
    setEditingLesson(null);
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === "module") {
      setModules((prev) =>
        prev
          .filter((module) => module.id !== deleteTarget.moduleId)
          .map((module, index) => ({
            ...module,
            orderIndex: index,
          })),
      );
    }

    if (deleteTarget.type === "lesson") {
      setModules((prev) =>
        prev.map((module) =>
          module.id === deleteTarget.moduleId
            ? {
                ...module,
                lessons: module.lessons
                  .filter((lesson) => lesson.id !== deleteTarget.lessonId)
                  .map((lesson, index) => ({
                    ...lesson,
                    orderIndex: index,
                  })),
              }
            : module,
        ),
      );
    }

    setDeleteTarget(null);
  };

  const prepareSyllabusPayload = (modules: ModuleWithLessons[]) => {
    return modules.map((module) => ({
      id: isTempId(module.id) ? null : module.id,

      title: module.title,

      description: module.description,

      orderIndex: module.orderIndex,

      lessons: module.lessons.map((lesson) => ({
        id: isTempId(lesson.id) ? null : lesson.id,
        title: lesson.title,
        description: lesson.description,
        orderIndex: lesson.orderIndex,
      })),
    }));
  };

  const submitHandler = async () => {
    console.log({ modules });
    const payload = prepareSyllabusPayload(modules);
    console.log("Sending to server:", payload);
  };

  return (
    <div className="space-y-8 pb-10">
      <SyllabusHeader
        title={course.title}
        description={course.description}
        onCreateModule={() => {
          setOpen(true);
        }}
        onSave={submitHandler}
      />

      <SyllabusDialog
        open={open || Boolean(editingModule)}
        onOpenChange={(value) => {
          if (!value) {
            setOpen(false);
            setEditingModule(null);
          }
        }}
        data={
          editingModule
            ? {
                id: editingModule.id,
                title: editingModule.title,
                description: editingModule.description ?? "",
              }
            : undefined
        }
        onSubmit={handleModuleSubmit}
        type="module"
      />

      <SyllabusDialog
        open={Boolean(lessonModuleId || editingLesson)}
        onOpenChange={(value) => {
          if (!value) {
            setLessonModuleId(null);
            setEditingLesson(null);
          }
        }}
        data={
          editingLesson
            ? {
                id: editingLesson.id,
                title: editingLesson.title,
                description: editingLesson.description ?? "",
              }
            : undefined
        }
        onSubmit={handleLessonSubmit}
        type="lesson"
      />

      <SyllabusDeleteConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
          }
        }}
        title={
          deleteTarget?.type === "module" ? "Delete Module?" : "Delete Lesson?"
        }
        description={
          deleteTarget?.type === "module"
            ? "This will permanently delete this module and all lessons inside it."
            : "This will permanently delete this lesson."
        }
        onConfirm={handleConfirmDelete}
      />

      {/* Modules */}
      <section className="space-y-6 max-w-5xl mx-auto">
        {modules
          .sort((a, b) => a.orderIndex - b.orderIndex)
          .map((module) => (
            <Card key={module.id ?? module.title} className="shadow-sm">
              {/* Module Header */}
              <div className="flex items-start justify-between gap-6 p-6">
                {/* Left Content */}
                <div className="flex items-start gap-3">
                  <GripVertical className="mt-1 size-5 shrink-0 text-muted-foreground/75 cursor-grab" />

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

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => setEditingModule(module)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>

                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-destructive border border-destructive/25 hover:text-destructive hover:bg-destructive/25"
                    onClick={() => {
                      setDeleteTarget({
                        type: "module",
                        moduleId: module.id,
                        title: module.title,
                      });
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Lessons */}
              <div className="rounded-none border-t border-b border-border bg-card">
                <Table className="">
                  <TableHeader>
                    <TableRow className="uppercase bg-muted dark:bg-foreground/5">
                      <TableHead className="w-15 text-muted-foreground font-semibold text-xs" />
                      <TableHead className="w-16 text-muted-foreground text-center font-semibold text-xs">
                        #
                      </TableHead>
                      <TableHead className="text-muted-foreground font-semibold text-xs">
                        Title
                      </TableHead>
                      <TableHead className="text-muted-foreground font-semibold text-xs">
                        Description
                      </TableHead>
                      <TableHead className="w-30 text-muted-foreground font-semibold text-xs">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {module.lessons
                      .sort((a, b) => a.orderIndex - b.orderIndex)
                      .map((lesson, index) => (
                        <TableRow
                          key={lesson.id ?? lesson.title}
                          className="group transition-colors hover:bg-muted/50"
                        >
                          {/* Drag Handle */}
                          <TableCell>
                            <GripVertical className="size-5 ml-auto cursor-grab text-muted-foreground/75 active:cursor-grabbing" />
                          </TableCell>

                          {/* Number */}
                          <TableCell className="text-muted-foreground text-center">
                            {index + 1}
                          </TableCell>

                          {/* Title */}
                          <TableCell>
                            <p className="font-medium text-sm text-foreground">
                              {lesson.title}
                            </p>
                          </TableCell>

                          {/* Description */}
                          <TableCell>
                            <p className="max-w-xl truncate line-clamp-2 text-sm text-muted-foreground">
                              {lesson.description ||
                                "No description available."}
                            </p>
                          </TableCell>

                          {/* Actions */}
                          <TableCell>
                            <div className="flex justify-end gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => {
                                  setEditingLesson({
                                    ...lesson,
                                    moduleId: module.id!,
                                  });
                                }}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>

                              <Button
                                size="icon"
                                variant="ghost"
                                className="text-destructive hover:text-destructive hover:bg-destructive/25"
                                onClick={() => {
                                  setDeleteTarget({
                                    type: "lesson",
                                    moduleId: module.id,
                                    lessonId: lesson.id,
                                    title: lesson.title,
                                  });
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>

              {/* Add Lesson Button */}
              <Button
                onClick={() => setLessonModuleId(module.id)}
                variant="ghost"
                className="w-fit mx-auto text-primary hover:text-primary "
              >
                <Plus className="size-4" />
                Add Lesson
              </Button>
            </Card>
          ))}
      </section>
    </div>
  );
};
