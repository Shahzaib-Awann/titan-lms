import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Save, Sparkles } from "lucide-react";

interface QuizzesPageHeaderProps {
  onCreateQuiz?: () => void;
  isUnsavedChanges: boolean;
  showCreateButton?: boolean;
  onGenerateWithAI?: () => void;
}

export const QuizzesPageHeader = ({
  onCreateQuiz,
  isUnsavedChanges,
  showCreateButton = true,
  onGenerateWithAI,
}: QuizzesPageHeaderProps) => {
  return (
    <section className="flex items-start justify-between gap-6 p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Manage Quizzes
        </h1>

        <p className="max-w-3xl line-clamp-2 text-muted-foreground">
          Create, manage, and organize quizzes to assess learners&apos;
          knowledge and progress.
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        {isUnsavedChanges && (
          <Badge
            variant="warning"
            className="gap-1.5 rounded-full border px-3 py-1 text-amber-500"
          >
            Unsaved Changes
          </Badge>
        )}

        <Button
          type="submit"
          variant={isUnsavedChanges ? "primary" : "outline"}
          className="gap-2"
          disabled={!isUnsavedChanges}
        >
          <Save className="h-4 w-4" />
          Save
        </Button>

        <Button type="button" onClick={onGenerateWithAI} className="gap-2">
          <Sparkles className="h-4 w-4" />
          Generate with AI
        </Button>

        {showCreateButton && (
          <Button
            type="button"
            onClick={onCreateQuiz}
            className="gap-2 bg-primary text-primary-foreground hover:bg-blurple-hover"
          >
            <Plus className="h-4 w-4" />
            Add Question
          </Button>
        )}
      </div>
    </section>
  );
};
