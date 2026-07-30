import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Plus } from "lucide-react";

interface EmptySyllabusStateProps {
  onCreateModule: () => void;
}

export const EmptySyllabusState = ({
  onCreateModule,
}: EmptySyllabusStateProps) => {
  return (
    <Card className="flex items-center justify-center min-h-[60vh] border-dashed">
      <CardContent className="flex flex-col items-center justify-center text-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <BookOpen className="h-8 w-8 text-primary" />
        </div>

        <div>
          <h3 className="text-lg font-semibold">No syllabus modules found</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Start building your course syllabus by creating your first module.
          </p>
        </div>

        <Button onClick={onCreateModule}>
          <Plus className="mr-2 h-4 w-4" />
          Create Module
        </Button>
      </CardContent>
    </Card>
  );
};
