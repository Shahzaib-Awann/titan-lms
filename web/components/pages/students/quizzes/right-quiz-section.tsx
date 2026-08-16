"use client";

import { memo } from "react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface Question {
  id: string;
  orderIndex: number;
}

interface RightQuizSectionProps {
  questions: Question[];
  answers: Record<string, string>;
  currentQuestionIndex: number;
  onQuestionNavigate: (questionIndex: number) => void;
  questionsPerPage: number;
}

const RightQuizSection = memo(function RightQuizSection({
  questions,
  answers,
  currentQuestionIndex,
  onQuestionNavigate,
  questionsPerPage,
}: RightQuizSectionProps) {
  const answeredCount = questions.reduce(
    (count, question) => count + Number(Boolean(answers[question.id])),
    0,
  );

  const progressValue =
    questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

  const pageEnd = currentQuestionIndex + questionsPerPage;

  return (
    <aside className="flex h-full flex-col p-5">
      <div className="mb-5">
        <h2 className="text-base font-semibold">Questions</h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Select a question to navigate.
        </p>
      </div>

      <div className="grid min-h-0 flex-1 auto-rows-max grid-cols-6 items-start justify-items-start gap-5 overflow-y-auto p-2">
        {questions.map((question, index) => (
          <QuestionNavigationButton
            key={question.id}
            index={index}
            isAnswered={Boolean(answers[question.id])}
            isCurrentPage={index >= currentQuestionIndex && index < pageEnd}
            onQuestionNavigate={onQuestionNavigate}
          />
        ))}
      </div>

      <div className="mt-auto border-t pt-5">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Progress</span>

          <span className="font-medium">
            {answeredCount} / {questions.length}
          </span>
        </div>

        <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
          <Progress variant="green" value={progressValue} />
        </div>
      </div>
    </aside>
  );
});

export default RightQuizSection;

interface QuestionNavigationButtonProps {
  index: number;
  isAnswered: boolean;
  isCurrentPage: boolean;
  onQuestionNavigate: (questionIndex: number) => void;
}

const QuestionNavigationButton = memo(function QuestionNavigationButton({
  index,
  isAnswered,
  isCurrentPage,
  onQuestionNavigate,
}: QuestionNavigationButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={() => onQuestionNavigate(index)}
      className={cn(
        "relative flex size-10 items-center justify-center rounded-md border text-sm transition-all",
        isAnswered
          ? "border-green-500 bg-green-500/10 text-green-500"
          : "border-muted-foreground/30 bg-background text-muted-foreground",
        isCurrentPage && "border-transparent ring-1 ring-blurple ring-offset-1",
      )}
    >
      {index + 1}
    </Button>
  );
});
