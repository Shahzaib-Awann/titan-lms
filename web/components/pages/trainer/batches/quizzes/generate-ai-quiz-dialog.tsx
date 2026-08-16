"use client";

import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  aiQuizResponseSchema,
  generateAiQuizSchema,
} from "@/lib/zod/trainer.schema";
import { generateAiQuiz } from "@/lib/actions/quizzes.action";
import { useState } from "react";

// Define the type of the AI-generated quiz response.
export type AiQuizResponse = z.infer<typeof aiQuizResponseSchema>;

// Define the form values based on the quiz generation validation schema.
type GenerateAiQuizFormValues = z.infer<typeof generateAiQuizSchema>;

interface GenerateAiQuizDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  batchId: string;
  onGenerated: (questions: AiQuizResponse["questions"]) => void;
}

const DEFAULT_QUESTION_COUNT = 5;
const DEFAULT_DIFFICULTY: GenerateAiQuizFormValues["difficulty"] = "easy";

export function GenerateAiQuizDialog({
  open,
  onOpenChange,
  batchId,
  onGenerated,
}: GenerateAiQuizDialogProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  // Initialize form
  const form = useForm<GenerateAiQuizFormValues>({
    resolver: zodResolver(generateAiQuizSchema),
    defaultValues: {
      prompt: "",
      questionCount: DEFAULT_QUESTION_COUNT,
      difficulty: DEFAULT_DIFFICULTY,
    },
  });

  // Handle form submission.
  const onSubmit = async (values: GenerateAiQuizFormValues) => {
    try {
      setIsGenerating(true);

      // Generate AI quiz using the generateAiQuiz action.
      const result = await generateAiQuiz({
        batchId,
        ...values,
      });

      if (!result.success || !result.data) {
        toast.error(result.error ?? "Failed to generate quiz.");
        return;
      }

      // Call the onGenerated callback with the generated questions.
      onGenerated(result.data.questions);

      toast.success(
        `${result.data.questions.length} questions generated successfully.`,
      );

      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error("AI quiz generation error:", error);
      toast.error("Failed to generate quiz questions.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle dialog open/close events.
  const handleOpenChange = (nextOpen: boolean) => {
    if (isGenerating) {
      return;
    }

    onOpenChange(nextOpen);

    if (!nextOpen) {
      form.reset();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-150">
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

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldSet disabled={isGenerating}>
            <FieldGroup className="py-2">
              {/* Prompt */}
              <Controller
                name="prompt"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="ai-quiz-prompt" required>
                      Prompt
                    </FieldLabel>

                    <Textarea
                      {...field}
                      id="ai-quiz-prompt"
                      placeholder="Example: Create a quiz about basic networking concepts including IP addresses, DNS, HTTP, TCP and UDP."
                      rows={6}
                      maxLength={1000}
                      disabled={isGenerating}
                    />

                    <FieldError
                      errors={fieldState.error ? [fieldState.error] : []}
                    />
                  </Field>
                )}
              />

              {/* Question Count + Difficulty */}
              <div className="grid grid-cols-2 gap-4">
                <Controller
                  name="questionCount"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="ai-question-count" required>
                        Number of questions
                      </FieldLabel>

                      <Input
                        id="ai-question-count"
                        type="number"
                        min={1}
                        max={15}
                        value={field.value}
                        onChange={(event) => {
                          field.onChange(event.target.valueAsNumber);
                        }}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                        disabled={isGenerating}
                      />

                      <FieldError
                        errors={fieldState.error ? [fieldState.error] : []}
                      />
                    </Field>
                  )}
                />

                <Controller
                  name="difficulty"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel required>Difficulty</FieldLabel>

                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isGenerating}
                      >
                        <SelectTrigger
                          id="ai-question-difficulty"
                          onBlur={field.onBlur}
                          className="capitalize"
                        >
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>

                        <SelectContent>
                          <SelectItem value="easy">Easy</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="hard">Hard</SelectItem>
                        </SelectContent>
                      </Select>

                      <FieldError
                        errors={fieldState.error ? [fieldState.error] : []}
                      />
                    </Field>
                  )}
                />
              </div>
            </FieldGroup>
          </FieldSet>

          <DialogFooter className="border-none">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isGenerating}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={isGenerating} className="gap-2">
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
        </form>
      </DialogContent>
    </Dialog>
  );
}
