"use client";

import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { generateAiQuiz } from "@/lib/actions/quizzes.action";
import { aiQuizResponseSchema } from "@/lib/zod/trainer.schema";
import z from "zod";

export type AiQuizResponse = z.infer<typeof aiQuizResponseSchema>;

interface GenerateAiQuizDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  batchId: string;
  onGenerated: (questions: AiQuizResponse["questions"]) => void;
}

export function GenerateAiQuizDialog({
  open,
  onOpenChange,
  batchId,
  onGenerated,
}: GenerateAiQuizDialogProps) {
  const [prompt, setPrompt] = useState("");
  const [questionCount, setQuestionCount] = useState(10);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    "medium",
  );

  const [isGenerating, setIsGenerating] = useState(false);
  const [promptError, setPromptError] = useState("");

  const handleGenerate = async () => {
    const trimmedPrompt = prompt.trim();

    if (!trimmedPrompt) {
      setPromptError("Please describe what you want the quiz to cover.");
      return;
    }

    if (trimmedPrompt.length < 10) {
      setPromptError("Please provide a little more detail.");
      return;
    }

    if (trimmedPrompt.length > 5000) {
      setPromptError("Prompt cannot exceed 5000 characters.");
      return;
    }

    setPromptError("");
    setIsGenerating(true);

    try {
      const result = await generateAiQuiz({
        batchId,
        prompt: trimmedPrompt,
        questionCount,
        difficulty,
      });

      if (!result.success || !result.data) {
        toast.error(result.error ?? "Failed to generate quiz.");
        return;
      }

      onGenerated(result.data.questions);

      toast.success(
        `${result.data.questions.length} questions generated successfully.`,
      );

      onOpenChange(false);

      // Reset dialog for next generation.
      setPrompt("");
      setQuestionCount(10);
      setDifficulty("medium");
    } catch (error) {
      console.error("AI quiz generation error:", error);

      toast.error("Failed to generate quiz questions.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (isGenerating) {
      return;
    }

    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="size-5 text-primary" />
            Generate Quiz with AI
          </DialogTitle>

          <DialogDescription>
            Describe the topic you want to assess. AI will generate questions
            that you can edit before saving.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <Field data-invalid={!!promptError}>
            <FieldLabel htmlFor="ai-quiz-prompt" required>
              Prompt
            </FieldLabel>

            <Textarea
              id="ai-quiz-prompt"
              value={prompt}
              onChange={(event) => {
                setPrompt(event.target.value);

                if (promptError) {
                  setPromptError("");
                }
              }}
              placeholder="Example: Create a quiz about basic networking concepts including IP addresses, DNS, HTTP, TCP and UDP."
              rows={6}
              disabled={isGenerating}
            />

            {promptError && <FieldError>{promptError}</FieldError>}
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel htmlFor="ai-question-count" required>
                Number of questions
              </FieldLabel>

              <Input
                id="ai-question-count"
                type="number"
                min={1}
                max={30}
                value={questionCount}
                onChange={(event) => {
                  const value = Number(event.target.value);

                  if (Number.isNaN(value)) {
                    return;
                  }

                  setQuestionCount(Math.min(30, Math.max(1, value)));
                }}
                disabled={isGenerating}
              />
            </Field>

            <Field>
              <FieldLabel required>Difficulty</FieldLabel>

              <Select
                value={difficulty}
                onValueChange={(value) =>
                  setDifficulty(value as "easy" | "medium" | "hard")
                }
                disabled={isGenerating}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
        </div>

        <DialogFooter className="border-none">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isGenerating}
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="size-4" />
                Generate Quiz
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
