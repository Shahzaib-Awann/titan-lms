"use client";

import { memo } from "react";
import { Control, Controller } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { manualQuizSchema } from "@/lib/zod/trainer.schema";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Define the form values type.
type ManualQuizFormValues = z.infer<typeof manualQuizSchema>;

interface QuizInfoCardProps {
  control: Control<ManualQuizFormValues>;
  questionsCount: number;
  booleansCount: number;
  multipleChoiceCount: number;
}

// Quiz info card component for displaying quiz meta data.
const QuizInfoCard = memo(function QuizInfoCard({
  control,
  questionsCount,
  booleansCount,
  multipleChoiceCount,
}: QuizInfoCardProps) {
  return (
    <Card>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-3 gap-2">
          {/* Total number of questions */}
          <StatCard
            label="Questions"
            value={questionsCount}
            color="text-emerald-400"
          />

          {/* Total number of boolean questions */}
          <StatCard
            label="Booleans"
            value={booleansCount}
            color="text-orange-400"
          />

          {/* Total number of mcq questions */}
          <StatCard
            label="MCQs"
            value={multipleChoiceCount}
            color="text-blue-400"
          />
        </div>

        {/* Quiz title */}
        <Controller
          name="title"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="quiz-title" required>
                Quiz title
              </FieldLabel>

              <Input
                {...field}
                id="quiz-title"
                placeholder="Enter quiz title..."
              />

              <FieldError errors={fieldState.error ? [fieldState.error] : []} />
            </Field>
          )}
        />

        {/* Quiz description */}
        <Controller
          name="description"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="quiz-description">Description</FieldLabel>

              <Textarea
                {...field}
                id="quiz-description"
                placeholder="Enter quiz description..."
                rows={4}
              />

              <FieldError errors={fieldState.error ? [fieldState.error] : []} />
            </Field>
          )}
        />

        {/* Quiz duration and status in a single row */}
        <div className="flex items-center gap-2">
          {/* Quiz duration */}
          <Controller
            name="durationMinutes"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="quiz-duration" required>
                  Duration{" "}
                  <span className="text-sm font-normal text-muted-foreground">
                    (mins)
                  </span>
                </FieldLabel>

                <Input
                  id="quiz-duration"
                  type="number"
                  min={1}
                  value={field.value}
                  onChange={(event) =>
                    field.onChange(event.target.valueAsNumber)
                  }
                />

                <FieldError
                  errors={fieldState.error ? [fieldState.error] : []}
                />
              </Field>
            )}
          />

          {/* Quiz status */}
          <Controller
            name="status"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="quiz-status" required>
                  Status
                </FieldLabel>

                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>

                <FieldError
                  errors={fieldState.error ? [fieldState.error] : []}
                />
              </Field>
            )}
          />
        </div>

        {/* Quiz published date */}
        <Controller
          name="publishedDate"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="quiz-published-date">
                Published Date
              </FieldLabel>

              <Popover>
                <PopoverTrigger
                  render={
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        "h-11 w-full justify-start rounded-xl bg-card text-left font-normal",
                        !field.value && "text-muted-foreground",
                      )}
                    />
                  }
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />

                  {field.value ? (
                    format(new Date(field.value), "yyyy-MM-dd")
                  ) : (
                    <span>Select date</span>
                  )}
                </PopoverTrigger>

                <PopoverContent className="w-auto bg-card p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value ? new Date(field.value) : undefined}
                    onSelect={(date) => {
                      field.onChange(date ? format(date, "yyyy-MM-dd") : null);
                    }}
                  />

                  {field.value && (
                    <div className="p-2 pt-0">
                      <Button
                        type="button"
                        variant="ghost"
                        className="w-full"
                        onClick={() => field.onChange(null)}
                      >
                        Clear date
                      </Button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>

              <FieldError errors={fieldState.error ? [fieldState.error] : []} />
            </Field>
          )}
        />
      </CardContent>
    </Card>
  );
});

// Render a single stat card.
function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="flex h-full w-full flex-col items-start rounded-lg border bg-surface-2 p-4 shadow-sm">
      <p className="text-xs font-bold uppercase text-muted-foreground">
        {label}
      </p>

      <p className={`mt-2 text-3xl font-semibold ${color}`}>{value}</p>
    </div>
  );
}

export default QuizInfoCard;
