import React from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

import { formatDate } from "@/lib/helpers/date-fns";
import { getQuizAttemptResult } from "@/lib/actions/quizzes.action";

type QuizResultPageProps = {
  params: Promise<{
    attemptId: string;
  }>;
};

const QuizResultPage = async ({ params }: QuizResultPageProps) => {
  const { attemptId } = await params;

  const { student, quiz, attempt, result } =
    await getQuizAttemptResult(attemptId);

  const percentage = Number(attempt.percentage);

  const score = Number(attempt.score);

  const totalMarks = Number(attempt.totalMarks);

  const isCancelled = attempt.status === "cancelled";

  return (
    <main className="flex items-center justify-center">
      <Card className="w-full max-w-full overflow-hidden">
        <CardContent className="p-6 sm:p-8">
          {/* Header */}
          <div className="flex flex-col gap-6 border-b pb-7 sm:flex-row sm:items-center sm:justify-between">
            {/* Quiz */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                {isCancelled ? "Quiz Cancelled" : "Quiz Result"}
              </p>

              <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                {quiz.title}
              </h1>
            </div>

            {/* Student */}
            <div className="text-left sm:text-right">
              <h2 className="font-semibold">{student.fullName}</h2>

              <p className="mt-1 text-sm text-muted-foreground">
                {student.rollNumber ?? "—"}
              </p>
            </div>
          </div>

          {isCancelled ? (
            <CancelledAttempt
              cancelledAt={attempt.cancelledAt}
              cancellationReason={attempt.cancellationReason}
              answeredCount={attempt.answeredCount}
              unansweredCount={attempt.unansweredCount}
              correctCount={attempt.correctCount}
              incorrectCount={attempt.incorrectCount}
            />
          ) : (
            <CompletedAttempt
              percentage={percentage}
              score={score}
              totalMarks={totalMarks}
              result={result}
              attempt={attempt}
            />
          )}
        </CardContent>
      </Card>
    </main>
  );
};

export default QuizResultPage;

// Completed Attempt
type CompletedAttemptProps = {
  percentage: number;
  score: number;
  totalMarks: number;
  result: {
    grade: string;
    performance: string;
    passed: boolean;
  };
  attempt: {
    correctCount: number;
    incorrectCount: number;
    unansweredCount: number;
    submittedAt: Date | null;
  };
};

const CompletedAttempt = ({
  percentage,
  score,
  totalMarks,
  result,
  attempt,
}: CompletedAttemptProps) => {
  return (
    <>
      {/* Main Result */}
      <div className="grid gap-8 py-8 md:grid-cols-[1fr_auto_1fr] md:items-center">
        {/* Score */}
        <div className="text-center md:text-left">
          <p className="text-sm font-medium text-muted-foreground">Score</p>

          <div className="mt-2 flex items-baseline justify-center gap-2 md:justify-start">
            <span className="text-5xl font-bold tracking-tight sm:text-6xl">
              {percentage}%
            </span>

            <span className="text-lg font-medium text-muted-foreground">
              {score} / {totalMarks}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="hidden h-20 w-px bg-border md:block" />

        {/* Grade */}
        <div className="flex flex-col items-center md:items-end">
          <Badge
            variant={result.passed ? "default" : "destructive"}
            className="px-4 py-1.5 text-sm"
          >
            Grade {result.grade}
          </Badge>

          <p className="mt-3 text-sm font-medium text-muted-foreground">
            {result.performance} Performance
          </p>
        </div>
      </div>

      {/* Progress */}
      <div>
        <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>Overall Performance</span>

          <span className="font-medium">{percentage}%</span>
        </div>

        <Progress value={percentage} className="h-2.5" />
      </div>

      {/* Statistics + Completion */}
      <div className="mt-8 grid gap-4 border-t pt-8 md:grid-cols-[1fr_1fr_1fr_auto]">
        <ResultStat
          value={attempt.correctCount}
          label="Correct"
          variant="success"
        />

        <ResultStat
          value={attempt.incorrectCount}
          label="Incorrect"
          variant="destructive"
        />

        <ResultStat
          value={attempt.unansweredCount}
          label="Unanswered"
          variant="warning"
        />

        {/* Completion */}
        <div className="flex min-w-40 flex-col justify-center rounded-lg border bg-muted/30 p-4 text-center">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Completed
          </p>

          <p className="mt-2 text-sm font-semibold">
            {attempt.submittedAt
              ? formatDate(attempt.submittedAt, { withTime: true })
              : "—"}
          </p>
        </div>
      </div>
    </>
  );
};

// Cancelled Attempt
type CancelledAttemptProps = {
  cancelledAt: Date | null;
  cancellationReason: string | null;
  answeredCount: number;
  unansweredCount: number;
  correctCount: number;
  incorrectCount: number;
};

const CancelledAttempt = ({
  cancelledAt,
  cancellationReason,
  answeredCount,
  unansweredCount,
  correctCount,
  incorrectCount,
}: CancelledAttemptProps) => {
  return (
    <div className="space-y-8 py-5">
      {/* Status */}
      <div className="text-center">
        <Badge variant="destructive" className="px-4 py-1.5 text-sm">
          Quiz Cancelled
        </Badge>

        <h2 className="mt-4 text-xl font-semibold tracking-tight">
          This quiz attempt was cancelled
        </h2>

        <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
          Your progress was saved at the time the quiz was cancelled.
        </p>
      </div>

      {/* Cancellation Details */}
      <div className="mx-auto mt-8 max-w-2xl divide-y rounded-lg border">
        <div className="grid gap-1 p-4 sm:grid-cols-[160px_1fr] sm:gap-6">
          <span className="text-sm font-medium text-muted-foreground">
            Reason
          </span>

          <span className="text-sm font-medium">
            {cancellationReason || "No reason provided"}
          </span>
        </div>

        <div className="grid gap-1 p-4 sm:grid-cols-[160px_1fr] sm:gap-6">
          <span className="text-sm font-medium text-muted-foreground">
            Cancelled
          </span>

          <span className="text-sm font-medium">
            {cancelledAt ? formatDate(cancelledAt, { withTime: true }) : "—"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 border-t pt-5">
        <ResultStat value={answeredCount} label="Answered" variant="success" />

        <ResultStat
          value={unansweredCount}
          label="Unanswered"
          variant="warning"
        />

        <ResultStat value={correctCount} label="Correct" variant="success" />

        <ResultStat
          value={incorrectCount}
          label="Incorrect"
          variant="destructive"
        />
      </div>
    </div>
  );
};

// Result Statistic
type ResultStatProps = {
  value: number;
  label: string;
  variant: "success" | "destructive" | "warning";
};

const ResultStat = ({ value, label, variant }: ResultStatProps) => {
  const colors = {
    success:
      "border-green-500/20 bg-green-500/5 text-green-600 dark:text-green-400",

    destructive:
      "border-red-500/20 bg-red-500/5 text-red-600 dark:text-red-400",

    warning:
      "border-yellow-500/20 bg-yellow-500/5 text-yellow-600 dark:text-yellow-400",
  };

  return (
    <div className={`rounded-lg border p-4 text-center ${colors[variant]}`}>
      <div className="text-2xl font-bold">{value}</div>

      <div className="mt-1 text-xs font-medium sm:text-sm">{label}</div>
    </div>
  );
};
