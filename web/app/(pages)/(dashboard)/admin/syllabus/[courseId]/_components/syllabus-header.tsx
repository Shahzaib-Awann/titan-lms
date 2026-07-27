"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, Save } from "lucide-react";

interface SyllabusHeaderProps {
  title: string;
  description: string;
  onCreateModule?: () => void;
  onSave?: () => void;
}

export const SyllabusHeader = ({
  title,
  description,
  onCreateModule,
  onSave,
}: SyllabusHeaderProps) => {
  return (
    <section className="flex items-start justify-between gap-6 p-6">
      {/* Course Info */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {title}
        </h1>

        <p className="max-w-3xl line-clamp-2 text-muted-foreground">
          {description}
        </p>
      </div>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-3">
        <Button variant="outline" onClick={onSave} className="gap-2">
          <Save className="h-4 w-4" />
          Save
        </Button>

        <Button
          onClick={onCreateModule}
          className="gap-2 bg-primary text-primary-foreground hover:bg-blurple-hover"
        >
          <Plus className="h-4 w-4" />
          Create Module
        </Button>
      </div>
    </section>
  );
};
