"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { BookOpen, FileText } from "lucide-react";

export interface ModuleFormData {
  id?: string | null;
  title: string;
  description: string;
}

interface SyllabusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data?: ModuleFormData;
  type: "module" | "lesson";
  onSubmit: (data: ModuleFormData) => void;
}

export const SyllabusDialog = ({
  open,
  onOpenChange,
  data,
  onSubmit,
  type,
}: SyllabusDialogProps) => {
  const [formData, setFormData] = useState<ModuleFormData>({
    title: "",
    description: "",
  });

  const isEdit = Boolean(data?.id);

  useEffect(() => {
    if (data) {
      setFormData({
        id: data.id,
        title: data.title,
        description: data.description,
      });
    } else {
      setFormData({
        title: "",
        description: "",
      });
    }
  }, [data, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSubmit(formData);
    onOpenChange(false);
  };

  const entity = type === "module" ? "Module" : "Lesson";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="flex flex-row items-center gap-4 border-b border-border px-4 py-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              {type === "module" ? (
                <BookOpen className="h-6 w-6 text-primary" />
              ) : (
                <FileText className="h-6 w-6 text-primary" />
              )}
            </div>

            <div className="flex-1 space-y-1 text-left">
              <DialogTitle className="text-xl font-semibold tracking-tight">
                {isEdit ? `Edit ${entity}` : `Create ${entity}`}
              </DialogTitle>

              <DialogDescription className="text-sm text-muted-foreground">
                {isEdit
                  ? `Update the ${entity.toLowerCase()} details below.`
                  : `Add a new ${entity.toLowerCase()} to your course syllabus.`}
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="space-y-5 px-5 py-6">
            <div className="space-y-2">
              <Label htmlFor="title">
                {type === "module" ? "Module Title" : "Lesson Title"}
              </Label>

              <Input
                id="title"
                placeholder="Enter module title"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>

              <Textarea
                id="description"
                placeholder="Enter module description"
                rows={4}
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          <DialogFooter className="px-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>

            <Button type="submit">
              {isEdit ? "Save Changes" : `Create ${type}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
