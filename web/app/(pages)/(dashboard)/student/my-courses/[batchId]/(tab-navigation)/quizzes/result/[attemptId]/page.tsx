import React from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

import { formatDate } from "@/lib/helpers/date-fns";
import { getQuizAttemptResult } from "@/lib/actions/quizzes.action";

type AttemptStatus = "cheated" | "cancelled" | "submitted" | "in_progress";

type QuizResultPageProps = {
  params: Promise<{
    attemptId: string;
  }>;
};

const QuizResultPage = async ({ params }: QuizResultPageProps) => {
  const { attemptId } = await params;
  const { student, quiz, attempt, result } =
    await getQuizAttemptResult(attemptId);

  const status = attempt.status as AttemptStatus;
  const isTerminated = status === "cancelled" || status === "cheated";

  const getHeaderLabel = () => {
    if (status === "cheated") return "Quiz Terminated (Proctoring Violation)";
    if (status === "cancelled") return "Quiz Cancelled";
    return "Quiz Result";
  };

  return (
    <main className="flex items-center justify-center p-4 sm:p-6">
      <Card className="w-full overflow-hidden">
        <CardContent className="p-6 sm:p-8">
          {/* Header */}
          <div className="flex flex-col gap-6 border-b pb-7 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                {getHeaderLabel()}
              </p>
              <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                {quiz.title}
              </h1>
            </div>

            <div className="text-left sm:text-right">
              <h2 className="font-semibold">{student.fullName}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {student.rollNumber ?? "—"}
              </p>
            </div>
          </div>

          {/* Main Content */}
          {isTerminated ? (
            <TerminatedAttempt status={status} attempt={attempt} />
          ) : (
            <CompletedAttempt
              percentage={Number(attempt.percentage)}
              score={Number(attempt.score)}
              totalMarks={Number(attempt.totalMarks)}
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

// Completed Attempt View
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
}: CompletedAttemptProps) => (
  <>
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

    {/* Progress Bar */}
    <div>
      <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
        <span>Overall Performance</span>
        <span className="font-medium">{percentage}%</span>
      </div>
      <Progress value={percentage} className="h-2.5" />
    </div>

    {/* Statistics */}
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

// Terminated Attempt View (Cancelled or Cheated)
type TerminatedAttemptProps = {
  status: AttemptStatus;
  attempt: {
    cancelledAt: Date | null;
    cancellationReason: string | null;
    answeredCount: number;
    unansweredCount: number;
    correctCount: number;
    incorrectCount: number;
  };
};

const TerminatedAttempt = ({ status, attempt }: TerminatedAttemptProps) => {
  const isCheated = status === "cheated";

  return (
    <div className="space-y-8 py-5">
      {/* Header Badge & Message */}
      <div className="text-center">
        <Badge variant="destructive" className="px-4 py-1.5 text-sm">
          {isCheated ? "Terminated for Security Violation" : "Quiz Cancelled"}
        </Badge>

        <h2 className="mt-4 text-xl font-semibold tracking-tight">
          {isCheated
            ? "This quiz attempt was automatically terminated"
            : "This quiz attempt was cancelled"}
        </h2>

        <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
          Your progress up to the point of termination was saved.
        </p>
      </div>

      {/* Details Box */}
      <div className="mx-auto mt-8 max-w-2xl divide-y rounded-lg border bg-muted/10">
        <div className="grid gap-1 p-4 sm:grid-cols-[160px_1fr] sm:gap-6">
          <span className="text-sm font-medium text-muted-foreground">
            Reason
          </span>
          <span className="text-sm font-medium text-destructive dark:text-red-400">
            {attempt.cancellationReason || "No reason provided"}
          </span>
        </div>

        <div className="grid gap-1 p-4 sm:grid-cols-[160px_1fr] sm:gap-6">
          <span className="text-sm font-medium text-muted-foreground">
            Terminated At
          </span>
          <span className="text-sm font-medium">
            {attempt.cancelledAt
              ? formatDate(attempt.cancelledAt, { withTime: true })
              : "—"}
          </span>
        </div>
      </div>

      {/* Snapshot Statistics */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 border-t pt-5">
        <ResultStat
          value={attempt.answeredCount}
          label="Answered"
          variant="success"
        />
        <ResultStat
          value={attempt.unansweredCount}
          label="Unanswered"
          variant="warning"
        />
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
      </div>
    </div>
  );
};

// Result Statistic Badge Component
type ResultStatProps = {
  value: number;
  label: string;
  variant: "success" | "destructive" | "warning";
};

const STAT_VARIANTS = {
  success:
    "border-green-500/20 bg-green-500/5 text-green-600 dark:text-green-400",
  destructive: "border-red-500/20 bg-red-500/5 text-red-600 dark:text-red-400",
  warning:
    "border-yellow-500/20 bg-yellow-500/5 text-yellow-600 dark:text-yellow-400",
};

const ResultStat = ({ value, label, variant }: ResultStatProps) => (
  <div
    className={`rounded-lg border p-4 text-center ${STAT_VARIANTS[variant]}`}
  >
    <div className="text-2xl font-bold">{value}</div>
    <div className="mt-1 text-xs font-medium sm:text-sm">{label}</div>
  </div>
);
