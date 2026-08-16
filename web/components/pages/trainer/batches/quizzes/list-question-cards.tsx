"use client";

import { memo, useCallback, useState } from "react";
import {
  Control,
  Controller,
  UseFormSetValue,
  useFieldArray,
} from "react-hook-form";
import { z } from "zod";
import { ChevronDown, Trash2 } from "lucide-react";

import { manualQuizSchema } from "@/lib/zod/trainer.schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";

type ManualQuizFormValues = z.infer<typeof manualQuizSchema>;
type QuestionType = "mcq" | "boolean";
type OptionId = "a" | "b" | "c" | "d";

interface ListQuestionCardProps {
  index: number;
  control: Control<ManualQuizFormValues>;
  setValue: UseFormSetValue<ManualQuizFormValues>;
  removeQuestion: (index: number) => void;
}

// Create options for a given question type.
const createOptions = (type: QuestionType) =>
  type === "mcq"
    ? [
        { id: "a" as const, text: "" },
        { id: "b" as const, text: "" },
        { id: "c" as const, text: "" },
        { id: "d" as const, text: "" },
      ]
    : [
        { id: "a" as const, text: "True" },
        { id: "b" as const, text: "False" },
      ];

export const ListQuestionCard = memo(function ListQuestionCard({
  index,
  control,
  setValue,
  removeQuestion,
}: ListQuestionCardProps) {
  // State to handle collapsible open/closed state.
  const [isOpen, setIsOpen] = useState(true);

  // Field array to handle options for each question.
  const { fields: optionFields, replace: replaceOptions } = useFieldArray({
    control,
    name: `questions.${index}.options`,
    keyName: "_key",
  });

  // Handle question type change.
  const handleTypeChange = useCallback(
    (type: QuestionType) => {
      replaceOptions(createOptions(type));

      setValue(`questions.${index}.correctOption`, "a", {
        shouldDirty: true,
        shouldValidate: true,
      });

      setValue(`questions.${index}.type`, type, {
        shouldDirty: true,
        shouldValidate: true,
      });
    },
    [index, replaceOptions, setValue],
  );

  // Handle question removal.
  const handleRemove = useCallback(
    () => removeQuestion(index),
    [index, removeQuestion],
  );

  // Render the question card.
  return (
    <Card className="w-full">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            Question {index + 1}
          </CardTitle>

          <div className="flex gap-2">
            <CollapsibleTrigger
              render={
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="rounded-full"
                />
              }
            >
              <ChevronDown
                className={`size-4 transition-transform duration-200 ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
              <span className="sr-only">{isOpen ? "Collapse" : "Expand"}</span>
            </CollapsibleTrigger>

            <Button
              type="button"
              variant="destructive"
              size="icon"
              onClick={handleRemove}
              className="rounded-full bg-destructive/25 text-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              <Trash2 className="size-4" />
              <span className="sr-only">Delete question</span>
            </Button>
          </div>
        </CardHeader>

        {/* Collapsed question summary */}
        {!isOpen && (
          <div className="px-6 pb-5">
            <Controller
              name={`questions.${index}.question`}
              control={control}
              render={({ field }) => (
                <p className="text-sm font-medium leading-6 text-muted-foreground">
                  {field.value || "Untitled question"}
                </p>
              )}
            />
          </div>
        )}

        <CollapsibleContent>
          <CardContent className="space-y-5 pt-5">
            {/* Question type and marks */}
            <div className="flex flex-row justify-between gap-4">
              {/* Question type */}
              <Controller
                name={`questions.${index}.type`}
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Type</FieldLabel>

                    <Select
                      value={field.value}
                      onValueChange={(value) =>
                        handleTypeChange(value as QuestionType)
                      }
                    >
                      <SelectTrigger className="min-h-11 max-w-50">
                        <SelectValue>
                          {field.value === "mcq"
                            ? "Multiple Choice"
                            : "Boolean"}
                        </SelectValue>
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="mcq">Multiple Choice</SelectItem>
                        <SelectItem value="boolean">Boolean</SelectItem>
                      </SelectContent>
                    </Select>

                    <FieldError
                      errors={fieldState.error ? [fieldState.error] : []}
                    />
                  </Field>
                )}
              />

              {/* Question marks */}
              <Controller
                name={`questions.${index}.marks`}
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="w-fit">
                    <FieldLabel>Marks</FieldLabel>

                    <Input
                      type="number"
                      min={1}
                      value={field.value}
                      onChange={(event) =>
                        field.onChange(event.target.valueAsNumber)
                      }
                      className="w-30"
                    />

                    <FieldError
                      errors={fieldState.error ? [fieldState.error] : []}
                    />
                  </Field>
                )}
              />
            </div>

            {/* Question text */}
            <Controller
              name={`questions.${index}.question`}
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Question</FieldLabel>

                  <Input {...field} placeholder="Enter your question..." />

                  <FieldError
                    errors={fieldState.error ? [fieldState.error] : []}
                  />
                </Field>
              )}
            />

            {/* Options */}
            <Controller
              name={`questions.${index}.correctOption`}
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Options</FieldLabel>

                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                    className="grid grid-cols-2 gap-4"
                  >
                    {optionFields.map((optionField, optionIndex) => (
                      <OptionField
                        key={optionField._key}
                        control={control}
                        questionIndex={index}
                        optionIndex={optionIndex}
                        optionId={optionField.id as OptionId}
                        optionLabel={String.fromCharCode(65 + optionIndex)}
                      />
                    ))}
                  </RadioGroup>

                  <FieldError
                    errors={fieldState.error ? [fieldState.error] : []}
                  />
                </Field>
              )}
            />
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
});

interface OptionFieldProps {
  control: Control<ManualQuizFormValues>;
  questionIndex: number;
  optionIndex: number;
  optionId: OptionId;
  optionLabel: string;
}

// Render a single editable answer option with its selection control.
const OptionField = memo(function OptionField({
  control,
  questionIndex,
  optionIndex,
  optionId,
  optionLabel,
}: OptionFieldProps) {
  return (
    <Controller
      name={`questions.${questionIndex}.options.${optionIndex}.text`}
      control={control}
      render={({ field, fieldState }) => (
        <Field
          orientation="horizontal"
          data-invalid={fieldState.invalid}
          className="items-center gap-3"
        >
          <RadioGroupItem
            value={optionId}
            id={`question-${questionIndex}-option-${optionId}`}
          />

          <label
            htmlFor={`question-${questionIndex}-option-${optionId}`}
            className="w-6 shrink-0 text-sm font-medium text-muted-foreground"
          >
            {optionLabel}
          </label>

          <div className="flex-1">
            <Input {...field} placeholder={`Option ${optionLabel}`} />

            <FieldError errors={fieldState.error ? [fieldState.error] : []} />
          </div>
        </Field>
      )}
    />
  );
});
