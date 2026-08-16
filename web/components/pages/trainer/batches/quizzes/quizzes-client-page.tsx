"use client";

import { useCallback, useMemo, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

import { manualQuizSchema } from "@/lib/zod/trainer.schema";
import { createTempId, isTempId } from "@/lib/helpers/temp-id";
import { createOrUpdateQuiz } from "@/lib/actions/quizzes.action";
import { Button } from "@/components/ui/button";

import { QuizzesPageHeader } from "./quizzes-page-header";
import { ListQuestionCard } from "./list-question-cards";
import { EmptyQuestionState } from "./empty-questions-state";
import {
  AiQuizResponse,
  GenerateAiQuizDialog,
} from "./generate-ai-quiz-dialog";
import QuizInfoCard from "./quize-info-card";

// Form values type for manual quiz.
type ManualQuizFormValues = z.infer<typeof manualQuizSchema>;

// Type for manual quiz question.
type ManualQuestion = ManualQuizFormValues["questions"][number];

// Create MCQ options.
const createMcqOptions = () => [
  { id: "a" as const, text: "" },
  { id: "b" as const, text: "" },
  { id: "c" as const, text: "" },
  { id: "d" as const, text: "" },
];

// Create a new question.
const createNewQuestion = (orderIndex: number): ManualQuestion => ({
  id: createTempId(),
  type: "mcq",
  question: "",
  options: createMcqOptions(),
  correctOption: "a",
  marks: 1,
  orderIndex,
});

// Map AI questions to manual questions.
const mapAiQuestion = (
  question: AiQuizResponse["questions"][number],
  orderIndex: number,
): ManualQuestion => {
  if (question.type === "boolean") {
    if (!["a", "b"].includes(question.correctOption)) {
      throw new Error("Invalid boolean correct option.");
    }

    return {
      id: createTempId(),
      type: "boolean",
      question: question.question,
      options: [
        { id: "a", text: "True" },
        { id: "b", text: "False" },
      ],
      correctOption: question.correctOption as "a" | "b",
      marks: 1,
      orderIndex,
    };
  }

  return {
    id: createTempId(),
    type: "mcq",
    question: question.question,
    options: question.options,
    correctOption: question.correctOption,
    marks: 1,
    orderIndex,
  };
};

interface QuizzesClientPageProps {
  batchId: string;
  mode: "edit" | "create";
  initialData?: ManualQuizFormValues;
}

const QuizzesClientPage = ({
  batchId,
  mode,
  initialData,
}: QuizzesClientPageProps) => {
  // Local States
  const [deletedQuestionIds, setDeletedQuestionIds] = useState<string[]>([]);
  const [isAiDialogOpen, setIsAiDialogOpen] = useState(false);

  // Router
  const router = useRouter();

  // Initialize Form
  const form = useForm<ManualQuizFormValues>({
    resolver: zodResolver(manualQuizSchema),
    defaultValues: initialData ?? {
      id: null,
      title: "",
      description: "",
      type: "manual",
      durationMinutes: 30,
      status: "draft",
      publishedDate: null,
      questions: [],
    },
    mode: "onChange",
  });

  // Destructure Form
  const {
    control,
    setValue,
    handleSubmit,
    getValues,
    formState,
    clearErrors,
    reset,
  } = form;

  // Use Field Array
  const {
    fields: questionFields,
    append,
    remove,
  } = useFieldArray({ control, name: "questions", keyName: "_key" });

  // Watch Questions
  const questions = useWatch({ control, name: "questions" });

  // Statistics
  const statistics = useMemo(() => {
    const list = questions ?? [];

    return {
      questionsCount: list.length,
      booleansCount: list.filter((question) => question.type === "boolean")
        .length,
      multipleChoiceCount: list.filter((question) => question.type === "mcq")
        .length,
    };
  }, [questions]);

  // Questions Error
  const questionsError =
    formState.errors.questions?.message ??
    formState.errors.questions?.root?.message;

  // Handle Add Question
  const handleAddQuestion = useCallback(() => {
    append(createNewQuestion(questionFields.length));
    clearErrors("questions");
  }, [append, clearErrors, questionFields.length]);

  // Delete a question and update the order of the remaining questions.
  const handleDeleteQuestion = useCallback(
    (index: number) => {
      const questionId = getValues(`questions.${index}.id`);

      // Track existing database questions so they can be deleted when the quiz is saved.
      if (questionId && !isTempId(questionId)) {
        setDeletedQuestionIds((ids) =>
          ids.includes(questionId) ? ids : [...ids, questionId],
        );
      }

      remove(index);

      // Recalculate the order index for every remaining question.
      const remainingQuestions = getValues("questions");

      remainingQuestions.forEach((_, questionIndex) => {
        setValue(`questions.${questionIndex}.orderIndex`, questionIndex, {
          shouldDirty: true,
          shouldValidate: true,
        });
      });
    },
    [getValues, remove, setValue],
  );

  // Preserve the existing quiz ID when editing an existing quiz.
  const initialQuizId = initialData?.id ?? null;

  // Handle Submit Quiz
  const handleSubmitQuiz = useCallback(
    async (values: ManualQuizFormValues) => {
      try {
        // Prepare payload data by removing the temporary _key field and mapping existing IDs to null.
        const payload: ManualQuizFormValues = {
          ...values,
          id: mode === "edit" ? initialQuizId : null,
          questions: values.questions.map((question) => ({
            ...question,
            id: isTempId(question.id) ? null : question.id,
          })),
        };

        // Create or update the quiz.
        const result = await createOrUpdateQuiz({
          batchId,
          deletedQuestionIds,
          payload,
        });

        if (!result.success) {
          toast.error(result.error ?? "Failed to save quiz.");
          return;
        }

        toast.success(result.message ?? "Quiz saved successfully.");

        if (mode === "create") {
          router.push(`/trainer/batches/${batchId}/quizzes`);
        }

        // Reset the form with the saved quiz and question IDs.
        reset({
          ...values,
          id: result.quizId,
          questions: values.questions.map((question) => ({
            ...question,
            id: isTempId(question.id) ? null : question.id,
          })),
        });

        // Clear the list of deleted questions after a successful save.
        setDeletedQuestionIds([]);
      } catch (error) {
        console.error("Quiz save error:", error);
        toast.error("Failed to save quiz.");
      }
    },
    [batchId, deletedQuestionIds, initialQuizId, mode, reset, router],
  );

  // Add AI-generated questions to the current quiz.
  const handleAiQuestionsGenerated = useCallback(
    (generatedQuestions: AiQuizResponse["questions"]) => {
      // Start the new questions after the existing questions.
      const startIndex = getValues("questions").length;

      // Convert every AI question into the manual quiz format.
      const newQuestions = generatedQuestions.map((question, index) =>
        mapAiQuestion(question, startIndex + index),
      );

      // Append the generated questions to the form.
      append(newQuestions);

      // Mark the quiz type as AI-generated.
      setValue("type", "ai", {
        shouldDirty: true,
        shouldValidate: true,
      });

      // Clear any previous questions validation errors.
      clearErrors("questions");
    },
    [append, clearErrors, getValues, setValue],
  );

  return (
    <>
      {/* Submit the complete quiz form and display its main editing interface. */}
      <form onSubmit={handleSubmit(handleSubmitQuiz)}>
        <QuizzesPageHeader
          isUnsavedChanges={formState.isDirty}
          showCreateButton
          onCreateQuiz={handleAddQuestion}
          onGenerateWithAI={() => setIsAiDialogOpen(true)}
        />

        <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-3">
          <div className="col-span-1 space-y-5 xl:col-span-2">
            {questionFields.length > 0 ? (
              <>
                {/* Render every question as an editable question card. */}
                <div className="space-y-5">
                  {questionFields.map((field, index) => (
                    <ListQuestionCard
                      key={field._key}
                      index={index}
                      control={control}
                      setValue={setValue}
                      removeQuestion={handleDeleteQuestion}
                    />
                  ))}
                </div>

                <div className="mx-auto w-fit">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddQuestion}
                    className="mx-auto w-45"
                  >
                    <Plus className="size-4" />
                    Add Question
                  </Button>
                </div>
              </>
            ) : (
              // Show the empty state when the quiz has no questions.
              <EmptyQuestionState
                onCreateQuestion={handleAddQuestion}
                error={questionsError}
              />
            )}
          </div>

          {/* Display the quiz metadata in an information card. */}
          <QuizInfoCard
            control={control}
            questionsCount={statistics.questionsCount}
            booleansCount={statistics.booleansCount}
            multipleChoiceCount={statistics.multipleChoiceCount}
          />
        </div>
      </form>

      {/* Display the dialog used to generate questions with AI. */}
      <GenerateAiQuizDialog
        open={isAiDialogOpen}
        onOpenChange={setIsAiDialogOpen}
        batchId={batchId}
        onGenerated={handleAiQuestionsGenerated}
      />
    </>
  );
};

export default QuizzesClientPage;
