"use client";

import { useCallback, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { Plus } from "lucide-react";

import { manualQuizSchema } from "@/lib/zod/trainer.schema";
import { createTempId, isTempId } from "@/lib/helpers/temp-id";
import { Button } from "@/components/ui/button";

import { QuizzesPageHeader } from "./quizzes-page-header";
import { ListQuestionCard } from "./list-question-cards";
import QuizeInfoCard from "./quize-info-card";
import { EmptyQuestionState } from "./empty-questions-state";
import { createOrUpdateManualQuiz } from "@/lib/actions/quizzes.action";
import { useRouter } from "next/navigation";
import {
  AiQuizResponse,
  GenerateAiQuizDialog,
} from "./generate-ai-quiz-dialog";

type ManualQuizFormValues = z.infer<typeof manualQuizSchema>;

const createMcqOptions = () => [
  { id: "a" as const, text: "" },
  { id: "b" as const, text: "" },
  { id: "c" as const, text: "" },
  { id: "d" as const, text: "" },
];

type ManualQuestion = ManualQuizFormValues["questions"][number];

const QuizzesClientPage = ({
  batchId,
  mode,
  initialData,
}: {
  batchId: string;
  mode: "edit" | "create";
  initialData?: ManualQuizFormValues;
}) => {
  const [deletedQuestionIds, setDeletedQuestionIds] = useState<string[]>([]);
  const [isAiDialogOpen, setIsAiDialogOpen] = useState(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const router = useRouter();

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

  const {
    control,
    setValue,
    handleSubmit,
    getValues,
    formState,
    clearErrors,
    reset: formReset,
  } = form;

  const {
    fields: questionFields,
    append,
    remove,
  } = useFieldArray({
    control,
    name: "questions",
    keyName: "_key",
  });

  const questionTypes = useWatch({
    control,
    name: "questions",
  });

  const questionsError =
    formState.errors.questions?.message ??
    formState.errors.questions?.root?.message;

  const handleAddQuestion = useCallback(() => {
    append({
      id: createTempId(),
      type: "mcq",
      question: "",
      options: createMcqOptions(),
      correctOption: "a",
      marks: 1,
      orderIndex: getValues("questions").length,
    });

    clearErrors("questions");
  }, [append, getValues, clearErrors]);

  const handleDeleteQuestion = useCallback(
    (index: number) => {
      const question = getValues(`questions.${index}`);
      const questionId = question?.id;

      if (questionId && !isTempId(questionId)) {
        setDeletedQuestionIds((ids) =>
          ids.includes(questionId) ? ids : [...ids, questionId],
        );
      }

      remove(index);

      const questions = getValues("questions");

      questions.forEach((_, questionIndex) => {
        setValue(`questions.${questionIndex}.orderIndex`, questionIndex, {
          shouldDirty: true,
          shouldValidate: true,
        });
      });
    },
    [getValues, remove, setValue],
  );

  const onSubmit = useCallback(
    async (values: ManualQuizFormValues) => {
      try {
        const payload: ManualQuizFormValues = {
          ...values,
          id: mode === "edit" ? (initialData?.id ?? null) : null,
          questions: values.questions.map((question) => ({
            ...question,
            id: isTempId(question.id) ? null : question.id,
          })),
        };

        const result = await createOrUpdateManualQuiz({
          batchId,
          deletedQuestionIds,
          payload,
        });

        if (!result.success) {
          toast.error(result.error ?? "Failed to save quiz.");
          return;
        }

        toast.success(result.message ?? "Quiz saved successfully!");
        if (mode === "create") {
          router.push(`/trainer/batches/${batchId}/quizzes/${result.quizId}`);
        }

        formReset({
          ...values,
          id: result.quizId,
          questions: values.questions.map((question) => ({
            ...question,
            id: isTempId(question.id) ? null : question.id,
          })),
        });

        setDeletedQuestionIds([]);
      } catch (error) {
        console.error("Quiz save error:", error);
        toast.error("Failed to save quiz.");
      }
    },
    [batchId, deletedQuestionIds, formReset, mode, initialData?.id],
  );

  const handleAiQuestionsGenerated = useCallback(
    (generatedQuestions: AiQuizResponse["questions"]) => {
      const existingQuestions = getValues("questions");

      const newQuestions: ManualQuestion[] = generatedQuestions.map(
        (question, index) => {
          if (question.type === "boolean") {
            return {
              id: createTempId(),
              type: "boolean" as const,
              question: question.question,
              options: [
                { id: "a" as const, text: "True" },
                { id: "b" as const, text: "False" },
              ],
              correctOption: question.correctOption as "a" | "b",
              marks: 1,
              orderIndex: existingQuestions.length + index,
            };
          }

          return {
            id: createTempId(),
            type: "mcq" as const,
            question: question.question,
            options: question.options,
            correctOption: question.correctOption as "a" | "b" | "c" | "d",
            marks: 1,
            orderIndex: existingQuestions.length + index,
          };
        },
      );

      append(newQuestions);

      setValue("type", "ai", {
        shouldDirty: true,
      });

      clearErrors("questions");
    },
    [append, clearErrors, getValues, setValue],
  );

  const questionsCount = questionTypes?.length ?? 0;
  const booleansCount =
    questionTypes?.filter((question) => question.type === "boolean").length ??
    0;
  const multipleChoiceCount =
    questionTypes?.filter((question) => question.type === "mcq").length ?? 0;

  const formError = (errors: typeof form.formState.errors) => {
    console.log("❌ FORM VALIDATION ERRORS");
    console.dir(errors, { depth: null });
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit, formError)}>
        <QuizzesPageHeader
          isUnsavedChanges={formState.isDirty}
          showCreateButton
          onCreateQuiz={handleAddQuestion}
          onGenerateWithAI={() => setIsAiDialogOpen(true)}
        />
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-3 items-start">
          <div className="col-span-1 space-y-5 xl:col-span-2">
            {questionFields.length > 0 ? (
              <>
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
              <EmptyQuestionState
                onCreateQuestion={handleAddQuestion}
                error={questionsError}
              />
            )}
          </div>

          <QuizeInfoCard
            control={control}
            questionsCount={questionsCount}
            booleansCount={booleansCount}
            multipleChoiceCount={multipleChoiceCount}
          />
        </div>
      </form>
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
