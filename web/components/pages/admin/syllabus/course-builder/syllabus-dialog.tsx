"use client";

import React, { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

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

import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";

import { BookOpen, FileText } from "lucide-react";

import { syllabusDialogFormSchema } from "@/lib/zod/admin.schema";

type SyllabusFormValues = z.infer<typeof syllabusDialogFormSchema>;

interface SyllabusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data?: SyllabusFormValues;
  type: "module" | "lesson";
  onSubmit: (data: SyllabusFormValues) => void;
}

export const SyllabusDialog = ({
  open,
  onOpenChange,
  data,
  onSubmit,
  type,
}: SyllabusDialogProps) => {
  const isEdit = Boolean(data?.id);

  const form = useForm<SyllabusFormValues>({
    resolver: zodResolver(syllabusDialogFormSchema),
    defaultValues: {
      id: null,
      title: "",
      description: "",
    },
  });

  useEffect(() => {
    if (data) {
      form.reset({
        id: data.id ?? null,
        title: data.title,
        description: data.description,
      });
    } else {
      form.reset({
        id: null,
        title: "",
        description: "",
      });
    }
  }, [data, open, form]);

  const handleSubmit = (values: SyllabusFormValues) => {
    onSubmit(values);
    onOpenChange(false);
    form.reset();
  };

  const entity = type === "module" ? "Module" : "Lesson";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <form onSubmit={form.handleSubmit(handleSubmit)}>
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
            <FieldSet>
              <FieldGroup>
                {/* Title */}
                <Controller
                  name="title"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="title">
                        {type === "module" ? "Module Title" : "Lesson Title"}
                      </FieldLabel>

                      <Input
                        {...field}
                        id="title"
                        placeholder={`Enter ${type} title`}
                      />

                      <FieldError
                        errors={fieldState.error ? [fieldState.error] : []}
                      />
                    </Field>
                  )}
                />

                {/* Description */}
                <Controller
                  name="description"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="description">Description</FieldLabel>

                      <Textarea
                        {...field}
                        id="description"
                        rows={4}
                        placeholder={`Enter ${type} description`}
                      />

                      <FieldError
                        errors={fieldState.error ? [fieldState.error] : []}
                      />
                    </Field>
                  )}
                />
              </FieldGroup>
            </FieldSet>
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
