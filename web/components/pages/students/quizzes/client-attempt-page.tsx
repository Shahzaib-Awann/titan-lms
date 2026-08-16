"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

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
import toast from "react-hot-toast";

const QUESTIONS_PER_PAGE = 2;

type Answers = Record<string, string>;

const ClientAttemptPage = ({
  batchId,
  quizId,
}: {
  batchId: string;
  quizId: string;
}) => {
  // Initialize router
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

  // Keep the latest answers and submission status available inside callbacks and effects.
  const answersRef = useRef<Answers>({});
  const hasSubmittedRef = useRef(false);

  // Derive computed values
  const questions = data?.questions ?? [];

  const visibleQuestions = questions.slice(
    currentQuestionIndex,
    currentQuestionIndex + QUESTIONS_PER_PAGE,
  );

  const isFirstPage = currentQuestionIndex === 0;

  const isLastPage =
    questions.length > 0 &&
    currentQuestionIndex + QUESTIONS_PER_PAGE >= questions.length;

  // Start the quiz attempt and enter fullscreen mode.
  const handleStartQuiz = useCallback(async () => {
    if (data || isStarting) {
      return;
    }

    setIsStarting(true);

    try {
      // Create a new student quiz attempt on the server.
      const result = await attemptQuizStudent(batchId, quizId);

      if (!result.success || !result.data) {
        toast.error(result.error ?? "Unable to start quiz.");
        return;
      }

      // Store the attempt data and initialize the countdown timer.
      const attemptData = result.data;
      const expirationTime = new Date(attemptData.attempt.expiresAt).getTime();

      setData(attemptData);
      setExpiresAt(expirationTime);
      setRemainingSeconds(
        Math.max(0, Math.ceil((expirationTime - Date.now()) / 1000)),
      );

      // Request fullscreen mode for the active quiz session.
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

  // Update the selected answer for a specific question.
  const handleAnswerChange = useCallback(
    (questionId: string, answerId: string) => {
      setAnswers((previous) => {
        const next = {
          ...previous,
          [questionId]: answerId,
        };

        // Keep the latest answer state available through the ref.
        answersRef.current = next;

        return next;
      });
    },
    [],
  );

  // Move to the previous page of questions.
  const handlePrevious = useCallback(() => {
    setCurrentQuestionIndex((index) => Math.max(index - QUESTIONS_PER_PAGE, 0));
  }, []);

  // Move to the next page of questions.
  const handleNext = useCallback(() => {
    setCurrentQuestionIndex((index) => {
      const nextIndex = index + QUESTIONS_PER_PAGE;

      return nextIndex < questions.length ? nextIndex : index;
    });
  }, [questions.length]);

  // Navigate to a specific question page (for the rigth-sidebar pagination).
  const handleQuestionNavigate = useCallback((questionIndex: number) => {
    setCurrentQuestionIndex(
      Math.floor(questionIndex / QUESTIONS_PER_PAGE) * QUESTIONS_PER_PAGE,
    );
  }, []);

  // Submit the quiz and navigate to the results page.
  const handleSubmitQuiz = useCallback(async () => {
    if (!data || hasSubmittedRef.current) {
      return;
    }

    hasSubmittedRef.current = true;
    setIsSubmitting(true);

    try {
      // Prepare the submission payload with the current answers.
      const submission = {
        batchId,
        attemptId: data.attempt.id,
        answers: data.questions.map((question) => ({
          questionId: question.id,
          selectedOption:
            (answersRef.current[question.id] as
              | "a"
              | "b"
              | "c"
              | "d"
              | undefined) ?? null,
        })),
      };

      // Submit the completed quiz attempt to the server.
      const result = await submitQuizAttempt(submission);

      if (!result.success) {
        hasSubmittedRef.current = false;
        toast.error("Failed to submit quiz.");
        return;
      }

      if (document.fullscreenElement) {
        try {
          await document.exitFullscreen();
        } catch (error) {
          console.error("Unable to exit fullscreen:", error);
        }
      }

      // Navigate to the student's quiz result page.
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
  }, [batchId, data, router]);

  const handleCancelQuiz = useCallback(async () => {
    // Prevent multiple cancellation requests.
    if (!data || isCancelling) {
      return;
    }

    setIsCancelling(true);

    try {
      const cancellationReason = "Quiz cancelled by student.";

      const cancellationPayload = {
        batchId,
        attemptId: data.attempt.id,

        cancellationReason,

        answers: data.questions.map((question) => ({
          questionId: question.id,
          selectedOption:
            (answersRef.current[question.id] as
              | "a"
              | "b"
              | "c"
              | "d"
              | undefined) ?? null,
        })),
      };

      // Cancel the attempt and save the student's current progress.
      const result = await cancelQuizAttempt(cancellationPayload);

      if (!result.success) {
        toast.error("Failed to cancel quiz.");
        return;
      }

      // Exit fullscreen mode before leaving the quiz.
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }

      // Navigate to the student's quiz result page.
      router.push(
        `/student/my-courses/${batchId}/quizzes/result/${data.attempt.id}`,
      );
    } catch (error) {
      console.error("Unable to cancel quiz attempt:", error);

      // Allow the user to try again if the
      // cancellation request failed.
      setIsCancelling(false);
    }
  }, [isCancelling, batchId, data, router]);

  // Keep the quiz countdown synchronized with its expiration time.
  useEffect(() => {
    if (expiresAt === null) {
      return;
    }

    // Calculate the remaining time and automatically submit when it reaches zero.
    const updateTimer = () => {
      const remaining = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));

      setRemainingSeconds(remaining);

      if (remaining === 0) {
        void handleSubmitQuiz();
      }
    };

    // Update the timer immediately before starting the interval.
    updateTimer();

    // Set up the interval for periodic countdown updates.
    const intervalId = window.setInterval(updateTimer, 1000);

    // Clean up the interval on unmount or before re-running the effect.
    return () => window.clearInterval(intervalId);
  }, [expiresAt, handleSubmitQuiz]);

  // Display the "Start Quiz" modal until the student begins the attempt.
  if (!data) {
    return (
      <div className="fixed inset-0 flex min-h-screen items-center justify-center bg-background">
        <StartQuizInstructionsDialog
          handleStartQuiz={handleStartQuiz}
          handleCancelQuiz={handleCancelQuiz}
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

        <Badge
          className="rounded-md border px-4 py-4 text-sm font-medium"
          variant={remainingSeconds <= 60 ? "destructive" : "secondary"}
        >
          {formatTime(remainingSeconds, "timer")}
        </Badge>
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
