"use client";

import React, { useState } from "react";
import { ModuleWithLessons } from "../_types/syllabus";
import { SyllabusHeader } from "./syllabus-header";
import { SyllabusDialog } from "./syllabus-dialog";
import { SyllabusDeleteConfirmDialog } from "./syllabus-delete-confirm-dialog";
import { SortableModuleCard } from "./sortable-module-card";
import { SyllabusDragOverlay, ActiveDragItem } from "./syllabus-drag-overlay";
import { createTempId, isTempId } from "@/lib/utils";

// Dnd Kit Imports
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  deleteSyllabusItem,
  updateCourseSyllabus,
} from "@/lib/actions/admin/syllabus.action";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface SyllabusClientPageProps {
  initialModules: ModuleWithLessons[];
  course: {
    id: string;
    title: string;
    description: string;
  };
}

export const SyllabusClientPage = ({
  initialModules,
  course,
}: SyllabusClientPageProps) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [modules, setModules] = useState(initialModules);
  const [isDirty, setIsDirty] = useState(false);
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

  const [activeItem, setActiveItem] = useState<ActiveDragItem | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const findContainer = (id: string) => {
    if (modules.some((m) => m.id === id)) {
      return id;
    }
    return modules.find((m) => m.lessons.some((l) => l.id === id))?.id;
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeData = active.data.current;

    if (activeData?.type === "module") {
      setActiveItem({ type: "module", module: activeData.module });
    } else if (activeData?.type === "lesson") {
      setActiveItem({ type: "lesson", lesson: activeData.lesson });
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeData = active.data.current;
    const overData = over.data.current;

    if (activeData?.type !== "lesson") return;

    const activeContainer = findContainer(activeId);
    const overContainer = findContainer(overId);

    if (
      !activeContainer ||
      !overContainer ||
      activeContainer === overContainer
    ) {
      return;
    }

    setModules((prev) => {
      const activeModule = prev.find((m) => m.id === activeContainer);
      const overModule = prev.find((m) => m.id === overContainer);

      if (!activeModule || !overModule) return prev;

      const activeLessonIndex = activeModule.lessons.findIndex(
        (l) => l.id === activeId,
      );
      if (activeLessonIndex === -1) return prev;

      const activeLesson = activeModule.lessons[activeLessonIndex];

      let newIndex: number;
      if (overData?.type === "lesson") {
        const overLessonIndex = overModule.lessons.findIndex(
          (l) => l.id === overId,
        );
        const isBelowOverItem =
          over &&
          active.rect.current.translated &&
          active.rect.current.translated.top > over.rect.top + over.rect.height;

        const modifier = isBelowOverItem ? 1 : 0;
        newIndex =
          overLessonIndex >= 0
            ? overLessonIndex + modifier
            : overModule.lessons.length;
      } else {
        newIndex = overModule.lessons.length;
      }

      return prev.map((module) => {
        if (module.id === activeContainer) {
          const updatedLessons = module.lessons
            .filter((l) => l.id !== activeId)
            .map((l, idx) => ({ ...l, orderIndex: idx }));
          return { ...module, lessons: updatedLessons };
        }

        if (module.id === overContainer) {
          const newLessons = [...module.lessons];
          newLessons.splice(newIndex, 0, activeLesson);
          const updatedLessons = newLessons.map((l, idx) => ({
            ...l,
            orderIndex: idx,
          }));
          return { ...module, lessons: updatedLessons };
        }

        return module;
      });
    });

    setIsDirty(true);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveItem(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeData = active.data.current;

    if (activeData?.type === "module") {
      if (activeId !== overId) {
        setModules((prev) => {
          const oldIndex = prev.findIndex((m) => m.id === activeId);
          const newIndex = prev.findIndex((m) => m.id === overId);

          if (oldIndex !== -1 && newIndex !== -1) {
            const reordered = arrayMove(prev, oldIndex, newIndex);
            return reordered.map((mod, idx) => ({
              ...mod,
              orderIndex: idx,
            }));
          }
          return prev;
        });

        setIsDirty(true);
      }
      return;
    }

    if (activeData?.type === "lesson") {
      const activeContainer = findContainer(activeId);
      const overContainer = findContainer(overId);

      if (
        activeContainer &&
        overContainer &&
        activeContainer === overContainer
      ) {
        setModules((prev) => {
          return prev.map((module) => {
            if (module.id === activeContainer) {
              const oldIndex = module.lessons.findIndex(
                (l) => l.id === activeId,
              );
              const newIndex = module.lessons.findIndex((l) => l.id === overId);

              if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
                const reorderedLessons = arrayMove(
                  module.lessons,
                  oldIndex,
                  newIndex,
                );

                setIsDirty(true);

                return {
                  ...module,
                  lessons: reorderedLessons.map((l, idx) => ({
                    ...l,
                    orderIndex: idx,
                  })),
                };
              }
            }
            return module;
          });
        });
      }
    }
  };

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

    setIsDirty(true);
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

    setIsDirty(true);
    setLessonModuleId(null);
    setEditingLesson(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      const id =
        deleteTarget.type === "module"
          ? deleteTarget.moduleId
          : deleteTarget.lessonId;

      /**
       * Delete from database only if it exists there
       */
      if (id && !isTempId(id)) {
        await deleteSyllabusItem(deleteTarget.type, id, course.id);
      }

      /**
       * Update local state
       */
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

      toast.success(
        `${deleteTarget.type === "module" ? "Module" : "Lesson"} deleted successfully.`,
      );

      setDeleteTarget(null);
      setIsDirty(true);
    } catch (error) {
      console.error("Delete syllabus item error:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to delete syllabus item.",
      );
    }
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
    try {
      const payload = prepareSyllabusPayload(modules);

      const result = await updateCourseSyllabus(course.id, payload);

      if (result.success) {
        setIsDirty(false);
        toast.success("Course syllabus updated successfully.");
        router.push("/admin/syllabus");
      }
    } catch (error) {
      console.error("Submit syllabus error:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update course syllabus.",
      );
    }
  };

  const moduleIds = modules.map((m) => m.id!);

  return (
    <div className="space-y-8 pb-10">
      <SyllabusHeader
        title={course.title}
        description={course.description}
        onCreateModule={() => {
          setOpen(true);
        }}
        isUnsavedChanges={isDirty}
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

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <section className="mx-auto max-w-5xl space-y-6">
          <SortableContext
            items={moduleIds}
            strategy={verticalListSortingStrategy}
          >
            {modules.map((module) => (
              <SortableModuleCard
                key={module.id ?? module.title}
                module={module}
                onEditModule={(m) => setEditingModule(m)}
                onDeleteModule={(m) =>
                  setDeleteTarget({
                    type: "module",
                    moduleId: m.id,
                    title: m.title,
                  })
                }
                onAddLesson={(mId) => setLessonModuleId(mId)}
                onEditLesson={(lesson, mId) =>
                  setEditingLesson({
                    ...lesson,
                    moduleId: mId,
                  })
                }
                onDeleteLesson={(lesson, mId) =>
                  setDeleteTarget({
                    type: "lesson",
                    moduleId: mId,
                    lessonId: lesson.id,
                    title: lesson.title,
                  })
                }
              />
            ))}
          </SortableContext>
        </section>

        <SyllabusDragOverlay activeItem={activeItem} />
      </DndContext>
    </div>
  );
};
