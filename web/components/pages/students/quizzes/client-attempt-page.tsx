"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import {
  attemptQuizStudent,
  cancelQuizAttempt,
  submitQuizAttempt,
} from "@/lib/actions/quizzes.action";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatTime } from "@/lib/helpers/date-fns";

import StartQuizInstructionsDialog from "./start-quiz-instructions-dialog";
import LeftQuizSection from "./left-quiz-section";
import RightQuizSection from "./right-quiz-section";

import type { AttemptQuizData } from "@/types/quizzes";

const QUESTIONS_PER_PAGE = 2;
const MAX_WARNINGS = 3;

type Answers = Record<string, string>;

// Helper to format answers payload for API calls
const formatAnswersPayload = (
  questions: AttemptQuizData["questions"],
  answers: Answers,
) =>
  questions.map((q) => ({
    questionId: q.id,
    selectedOption:
      (answers[q.id] as "a" | "b" | "c" | "d" | undefined) ?? null,
  }));

// Helper to validate proctoring key violations
const checkKeyViolation = (event: KeyboardEvent): string | null => {
  const key = event.key.toLowerCase();
  const isMod = event.ctrlKey || event.metaKey;

  if (event.key === "Escape") return "Fullscreen exit was attempted.";
  if (event.key === "Tab") {
    if (event.altKey) return "Application switching was attempted.";
    if (isMod) return "Browser tab switching was attempted.";
    return "Tab switching was attempted.";
  }
  if (event.key === "F5" || (isMod && key === "r"))
    return "Page refresh was attempted.";
  if (event.key === "F11") return "Fullscreen toggle was attempted.";
  if (isMod && ["l", "t", "n", "w"].includes(key))
    return "Browser navigation was attempted.";

  return null;
};

const ClientAttemptPage = ({
  batchId,
  quizId,
}: {
  batchId: string;
  quizId: string;
}) => {
  const router = useRouter();

  // Local States
  const [data, setData] = useState<AttemptQuizData | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [warningCount, setWarningCount] = useState(0);

  // Refs for callbacks & listeners
  const answersRef = useRef<Answers>({});
  const warningCountRef = useRef(0);
  const hasSubmittedRef = useRef(false);
  const isTerminatingRef = useRef(false);
  const lastViolationAtRef = useRef(0);
  const isIntentionallyExitingFullscreenRef = useRef(false);

  // Keep refs synced with active state
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    warningCountRef.current = warningCount;
  }, [warningCount]);

  // Derived Computed Values
  const questions = data?.questions ?? [];
  const visibleQuestions = questions.slice(
    currentQuestionIndex,
    currentQuestionIndex + QUESTIONS_PER_PAGE,
  );
  const isFirstPage = currentQuestionIndex === 0;
  const isLastPage =
    questions.length > 0 &&
    currentQuestionIndex + QUESTIONS_PER_PAGE >= questions.length;

  // Safe exit from fullscreen without triggering violations
  const exitFullscreenSafely = useCallback(async () => {
    if (document.fullscreenElement) {
      isIntentionallyExitingFullscreenRef.current = true;
      try {
        await document.exitFullscreen();
      } catch (error) {
        console.error("Unable to exit fullscreen:", error);
      }
    }
  }, []);

  // Handlers
  const handleStartQuiz = useCallback(async () => {
    if (data || isStarting) return;

    setIsStarting(true);
    try {
      const result = await attemptQuizStudent(batchId, quizId);

      if (!result.success || !result.data) {
        toast.error(result.error ?? "Unable to start quiz.");
        return;
      }

      const attemptData = result.data;
      const expirationTime = new Date(attemptData.attempt.expiresAt).getTime();

      setData(attemptData);
      setExpiresAt(expirationTime);
      setRemainingSeconds(
        Math.max(0, Math.ceil((expirationTime - Date.now()) / 1000)),
      );

      try {
        await document.documentElement.requestFullscreen();
      } catch (error) {
        console.error("Unable to enter fullscreen:", error);
      }
    } catch (error) {
      console.error("Unable to start quiz:", error);
    } finally {
      setIsStarting(false);
    }
  }, [batchId, quizId, data, isStarting]);

  const handleAnswerChange = useCallback(
    (questionId: string, answerId: string) => {
      setAnswers((prev) => ({ ...prev, [questionId]: answerId }));
    },
    [],
  );

  const handlePrevious = useCallback(() => {
    setCurrentQuestionIndex((index) => Math.max(index - QUESTIONS_PER_PAGE, 0));
  }, []);

  const handleNext = useCallback(() => {
    setCurrentQuestionIndex((index) => {
      const nextIndex = index + QUESTIONS_PER_PAGE;
      return nextIndex < questions.length ? nextIndex : index;
    });
  }, [questions.length]);

  const handleQuestionNavigate = useCallback((questionIndex: number) => {
    setCurrentQuestionIndex(
      Math.floor(questionIndex / QUESTIONS_PER_PAGE) * QUESTIONS_PER_PAGE,
    );
  }, []);

  const handleSubmitQuiz = useCallback(async () => {
    if (!data || hasSubmittedRef.current) return;

    hasSubmittedRef.current = true;
    setIsSubmitting(true);

    try {
      const submission = {
        batchId,
        attemptId: data.attempt.id,
        answers: formatAnswersPayload(data.questions, answersRef.current),
      };

      const result = await submitQuizAttempt(submission);

      if (!result.success) {
        hasSubmittedRef.current = false;
        toast.error("Failed to submit quiz.");
        return;
      }

      await exitFullscreenSafely();
      router.push(
        `/student/my-courses/${batchId}/quizzes/result/${data.attempt.id}`,
      );
    } catch (error) {
      hasSubmittedRef.current = false;
      console.error("Unable to submit quiz:", error);
      toast.error("Failed to submit quiz. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [batchId, data, router, exitFullscreenSafely]);

  const handleCancelQuiz = useCallback(async () => {
    if (!data || isCancelling) return;

    setIsCancelling(true);

    try {
      const cancellationPayload = {
        batchId,
        attemptId: data.attempt.id,
        status: "cancelled" as const,
        cancellationReason: "Quiz cancelled by student.",
        answers: formatAnswersPayload(data.questions, answersRef.current),
      };

      const result = await cancelQuizAttempt(cancellationPayload);

      if (!result.success) {
        toast.error("Failed to cancel quiz.");
        return;
      }

      await exitFullscreenSafely();
      router.push(
        `/student/my-courses/${batchId}/quizzes/result/${data.attempt.id}`,
      );
    } catch (error) {
      console.error("Unable to cancel quiz attempt:", error);
      setIsCancelling(false);
    }
  }, [isCancelling, batchId, data, router, exitFullscreenSafely]);

  const registerViolation = useCallback(
    async (reason: string) => {
      if (!data || isTerminatingRef.current) return;

      const now = Date.now();
      if (now - lastViolationAtRef.current < 1500) return; // Throttle violations
      lastViolationAtRef.current = now;

      const nextWarningCount = Math.min(
        warningCountRef.current + 1,
        MAX_WARNINGS,
      );
      setWarningCount(nextWarningCount);

      if (nextWarningCount < MAX_WARNINGS) {
        toast.error(`Warning ${nextWarningCount}/${MAX_WARNINGS}: ${reason}`);
        return;
      }

      // Max violations reached -> terminate attempt
      isTerminatingRef.current = true;
      setIsSubmitting(true);

      try {
        const cancellationPayload = {
          batchId,
          attemptId: data.attempt.id,
          status: "cheated" as const,
          cancellationReason: `Quiz automatically terminated after ${MAX_WARNINGS} proctoring violations.`,
          answers: formatAnswersPayload(data.questions, answersRef.current),
        };

        const result = await cancelQuizAttempt(cancellationPayload);

        if (!result.success) {
          isTerminatingRef.current = false;
          setIsSubmitting(false);
          toast.error(
            "Unable to automatically terminate the quiz. Please contact support.",
          );
          return;
        }

        await exitFullscreenSafely();
        toast.error("Quiz terminated due to repeated violations.");
        router.push(
          `/student/my-courses/${batchId}/quizzes/result/${data.attempt.id}`,
        );
      } catch (error) {
        console.error("Unable to terminate quiz:", error);
        isTerminatingRef.current = false;
        setIsSubmitting(false);
        toast.error("Failed to terminate the quiz.");
      }
    },
    [batchId, data, router, exitFullscreenSafely],
  );

  // Timer Countdown Effect
  useEffect(() => {
    if (expiresAt === null) return;

    const updateTimer = () => {
      const remaining = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
      setRemainingSeconds(remaining);

      if (remaining === 0) {
        void handleSubmitQuiz();
      }
    };

    updateTimer();
    const intervalId = window.setInterval(updateTimer, 1000);
    return () => window.clearInterval(intervalId);
  }, [expiresAt, handleSubmitQuiz]);

  // Proctoring Event Listeners
  useEffect(() => {
    if (!data) return;

    const handleVisibilityChange = () => {
      if (
        document.visibilityState === "hidden" &&
        !isTerminatingRef.current &&
        !isIntentionallyExitingFullscreenRef.current
      ) {
        void registerViolation("You switched away from the quiz.");
      }
    };

    const handleWindowBlur = () => {
      if (
        !isTerminatingRef.current &&
        !isIntentionallyExitingFullscreenRef.current
      ) {
        void registerViolation("The quiz window lost focus.");
      }
    };

    const handleFullscreenChange = () => {
      if (
        isTerminatingRef.current ||
        isIntentionallyExitingFullscreenRef.current
      )
        return;

      if (!document.fullscreenElement) {
        void registerViolation("Fullscreen mode was exited.");
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (isTerminatingRef.current) return;

      const violationReason = checkKeyViolation(event);
      if (violationReason) {
        event.preventDefault();
        event.stopPropagation();
        void registerViolation(violationReason);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    window.addEventListener("keydown", handleKeyDown, true);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      window.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [data, registerViolation]);

  // Initial instruction dialog state
  if (!data) {
    return (
      <div className="fixed inset-0 flex min-h-screen items-center justify-center bg-background">
        <StartQuizInstructionsDialog
          handleStartQuiz={handleStartQuiz}
          handleCancelQuiz={() =>
            router.push(`/student/my-courses/${batchId}/quizzes`)
          }
          isStarting={isStarting}
        />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex h-screen w-screen flex-col bg-background">
      <header className="flex h-16 shrink-0 items-center justify-between border-b px-6">
        <div>
          <h1 className="text-lg font-semibold">{data.quiz.title}</h1>
          <p className="text-sm text-muted-foreground">Quiz ID: {quizId}</p>
        </div>

        <div className="flex items-center gap-3">
          <Badge
            className="rounded-md border px-4 py-4 text-sm font-medium"
            variant={
              warningCount >= MAX_WARNINGS - 1
                ? "destructive"
                : warningCount > 0
                  ? "warning"
                  : "secondary"
            }
          >
            Warnings: {warningCount}/{MAX_WARNINGS}
          </Badge>

          <Badge
            className="rounded-md border px-4 py-4 text-sm font-medium"
            variant={remainingSeconds <= 60 ? "destructive" : "secondary"}
          >
            {formatTime(remainingSeconds, "timer")}
          </Badge>
        </div>
      </header>

      <main className="grid min-h-0 flex-1 grid-cols-4">
        <div className="col-span-3 min-h-0 overflow-y-auto">
          <LeftQuizSection
            questions={visibleQuestions}
            answers={answers}
            onAnswerChange={handleAnswerChange}
          />
        </div>

        <div className="col-span-1 min-h-0 overflow-y-auto border-l">
          <RightQuizSection
            questions={questions}
            answers={answers}
            currentQuestionIndex={currentQuestionIndex}
            onQuestionNavigate={handleQuestionNavigate}
            questionsPerPage={QUESTIONS_PER_PAGE}
          />
        </div>
      </main>

      <footer className="flex h-16 shrink-0 items-center justify-between border-t px-6">
        <Button
          variant="outline"
          onClick={handleCancelQuiz}
          disabled={isCancelling || isSubmitting}
        >
          {isCancelling ? "Cancelling..." : "Cancel Test"}
        </Button>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrevious}
            disabled={isFirstPage || isSubmitting}
          >
            Previous
          </Button>

          {isLastPage ? (
            <Button
              type="button"
              onClick={handleSubmitQuiz}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Quiz"}
            </Button>
          ) : (
            <Button type="button" onClick={handleNext} disabled={isSubmitting}>
              Next
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
};

export default ClientAttemptPage;
