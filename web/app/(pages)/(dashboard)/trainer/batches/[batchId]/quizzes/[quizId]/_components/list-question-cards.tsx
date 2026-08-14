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

interface ListQuestionCardProps {
  index: number;
  control: Control<ManualQuizFormValues>;
  setValue: UseFormSetValue<ManualQuizFormValues>;
  removeQuestion: (index: number) => void;
}

export const ListQuestionCard = memo(function ListQuestionCard({
  index,
  control,
  setValue,
  removeQuestion,
}: ListQuestionCardProps) {
  const [isOpen, setIsOpen] = useState(true);

  const { fields: optionFields, replace: replaceOptions } = useFieldArray({
    control,
    name: `questions.${index}.options`,
    keyName: "_key",
  });

  const handleTypeChange = useCallback(
    (value: "mcq" | "boolean") => {
      replaceOptions(
        value === "mcq"
          ? [
              { id: "a", text: "" },
              { id: "b", text: "" },
              { id: "c", text: "" },
              { id: "d", text: "" },
            ]
          : [
              { id: "a", text: "True" },
              { id: "b", text: "False" },
            ],
      );

      setValue(`questions.${index}.correctOption`, "a", {
        shouldDirty: true,
        shouldValidate: true,
      });

      setValue(`questions.${index}.type`, value, {
        shouldDirty: true,
        shouldValidate: true,
      });
    },
    [index, replaceOptions, setValue],
  );

  const handleRemove = useCallback(
    () => removeQuestion(index),
    [index, removeQuestion],
  );

  return (
    <Card className="w-full">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            <span>Question {index + 1}</span>
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
            <div className="flex flex-row justify-between gap-4">
              <Controller
                name={`questions.${index}.type`}
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Type</FieldLabel>

                    <Select
                      value={field.value}
                      onValueChange={(value) =>
                        handleTypeChange(value as "mcq" | "boolean")
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
                        optionId={optionField.id}
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
  optionId: "a" | "b" | "c" | "d";
  optionLabel: string;
}

const OptionField = memo(function OptionField({
  control,
  questionIndex,
  optionIndex,
  optionId,
  optionLabel,
}: OptionFieldProps) {
  return (
    <Controller
      name={`questions.${questionIndex}.options.${optionIndex}.text` as const}
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
