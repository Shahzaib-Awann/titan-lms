"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import {
  attemptQuizStudent,
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
  const router = useRouter();

  /**
   * Quiz data does not exist until the student clicks
   * "I Understand — Start Quiz".
   */
  const [data, setData] = useState<AttemptQuizData | null>(null);

  const [started, setStarted] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});

  /**
   * Keeps the latest answers available to callbacks/effects
   * without forcing the timer effect to restart whenever
   * an answer changes.
   */
  const answersRef = useRef<Answers>({});

  /**
   * Prevents both manual and automatic submission
   * from submitting more than once.
   */
  const hasSubmittedRef = useRef(false);

  /**
   * Questions only exist after the quiz has actually started.
   */
  const questions = data?.questions ?? [];

  const visibleQuestions = questions.slice(
    currentQuestionIndex,
    currentQuestionIndex + QUESTIONS_PER_PAGE,
  );

  const isFirstPage = currentQuestionIndex === 0;

  const isLastPage =
    questions.length > 0 &&
    currentQuestionIndex + QUESTIONS_PER_PAGE >= questions.length;

  /**
   * ---------------------------------------------------------
   * Start Quiz
   * ---------------------------------------------------------
   *
   * This is the ONLY place where attemptQuizStudent() is called.
   *
   * Therefore:
   *
   * Page load
   *   -> no attempt
   *   -> no questions
   *
   * Start button
   *   -> create attempt
   *   -> fetch questions
   *   -> start timer
   */
  const handleStartQuiz = useCallback(async () => {
    if (started || isStarting) {
      return;
    }

    setIsStarting(true);

    try {
      const result = await attemptQuizStudent(batchId, quizId);

      /**
       * This should normally only happen if something changed
       * between the initial validation and clicking Start.
       *
       * For example, another tab may have created the attempt.
       */
      if (!result.success || !result.data) {
        console.error(result.error ?? "Unable to start quiz.", result.message);

        return;
      }

      /**
       * Store the complete attempt data returned by the server.
       */
      setData(result.data);

      /**
       * The server is authoritative for the expiration time.
       */
      const expiresAtMs = new Date(result.data.attempt.expiresAt).getTime();

      setExpiresAt(expiresAtMs);

      const remaining = Math.max(
        0,
        Math.ceil((expiresAtMs - Date.now()) / 1000),
      );

      setRemainingSeconds(remaining);

      /**
       * Try to enter fullscreen.
       *
       * Failure to enter fullscreen does not prevent
       * the quiz from starting.
       */
      try {
        await document.documentElement.requestFullscreen();
      } catch (error) {
        console.error("Unable to enter fullscreen:", error);
      }

      setStarted(true);
    } catch (error) {
      console.error("Unable to start quiz:", error);
    } finally {
      setIsStarting(false);
    }
  }, [batchId, quizId, started, isStarting]);

  /**
   * ---------------------------------------------------------
   * Cancel before quiz starts
   * ---------------------------------------------------------
   *
   * Since attemptQuizStudent() has not been called yet,
   * cancelling here creates NO quiz attempt.
   */
  const handleCancelQuiz = useCallback(async () => {
    if (isCancelling) {
      return;
    }

    setIsCancelling(true);

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error("Unable to exit fullscreen:", error);
    }

    router.back();
  }, [isCancelling, router]);

  /**
   * ---------------------------------------------------------
   * Answer change
   * ---------------------------------------------------------
   */
  const handleAnswerChange = useCallback(
    (questionId: string, answerId: string) => {
      setAnswers((previous) => {
        const nextAnswers = {
          ...previous,
          [questionId]: answerId,
        };

        answersRef.current = nextAnswers;

        return nextAnswers;
      });
    },
    [],
  );

  /**
   * ---------------------------------------------------------
   * Previous page
   * ---------------------------------------------------------
   */
  const handlePrevious = useCallback(() => {
    setCurrentQuestionIndex((previousIndex) =>
      Math.max(previousIndex - QUESTIONS_PER_PAGE, 0),
    );
  }, []);

  /**
   * ---------------------------------------------------------
   * Next page
   * ---------------------------------------------------------
   */
  const handleNext = useCallback(() => {
    setCurrentQuestionIndex((previousIndex) => {
      const nextPageStart = previousIndex + QUESTIONS_PER_PAGE;

      return nextPageStart < questions.length ? nextPageStart : previousIndex;
    });
  }, [questions.length]);

  /**
   * ---------------------------------------------------------
   * Question navigation
   * ---------------------------------------------------------
   */
  const handleQuestionNavigate = useCallback((questionIndex: number) => {
    const pageStart =
      Math.floor(questionIndex / QUESTIONS_PER_PAGE) * QUESTIONS_PER_PAGE;

    setCurrentQuestionIndex(pageStart);
  }, []);

  /**
   * ---------------------------------------------------------
   * Submit Quiz
   * ---------------------------------------------------------
   */
  const handleSubmitQuiz = useCallback(async () => {
    if (hasSubmittedRef.current || !data) {
      return;
    }

    hasSubmittedRef.current = true;
    setIsSubmitting(true);

    try {
      const submission = {
        batchId,
        attemptId: data.attempt.id,
        answers: data.questions.map((question) => ({
          questionId: question.id,
          selectedOption: answersRef.current[question.id] as
            | "a"
            | "b"
            | "c"
            | "d"
            | null,
        })),
      };

      const result = await submitQuizAttempt(submission);

      if (!result.success) {
        toast.error("Failed to submit quiz. Please try again.");

        return;
      }

      /**
       * Exit fullscreen after successful submission.
       */
      if (document.fullscreenElement) {
        try {
          await document.exitFullscreen();
        } catch (error) {
          console.error("Unable to exit fullscreen:", error);
        }
      }

      router.push(
        `/student/my-courses/${batchId}/quizzes/result/${data.attempt.id}`,
      );
    } catch (error) {
      console.error("Unable to submit quiz:", error);

      /**
       * Allow the student to try again if submission
       * failed because of a network/server error.
       */
      hasSubmittedRef.current = false;
    } finally {
      setIsSubmitting(false);
    }
  }, [data, batchId, router]);

  /**
   * ---------------------------------------------------------
   * Quiz Timer
   * ---------------------------------------------------------
   *
   * This effect does NOT depend on answers.
   *
   * Therefore changing an answer does not recreate
   * the timer interval.
   */
  useEffect(() => {
    if (!started || expiresAt === null) {
      return;
    }

    const updateTimer = () => {
      const remainingMilliseconds = expiresAt - Date.now();

      const remaining = Math.max(0, Math.ceil(remainingMilliseconds / 1000));

      setRemainingSeconds(remaining);

      if (remaining <= 0) {
        void handleSubmitQuiz();
      }
    };

    updateTimer();

    const intervalId = window.setInterval(updateTimer, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [started, expiresAt, handleSubmitQuiz]);

  /**
   * ---------------------------------------------------------
   * Instructions screen
   * ---------------------------------------------------------
   *
   * At this point:
   *
   * data === null
   * questions === []
   * attempt does not exist
   *
   * until the student clicks Start.
   */
  if (!started || !data) {
    return (
      <div className="fixed inset-0 flex min-h-screen items-center justify-center bg-background">
        <StartQuizInstructionsDialog
          batchId={batchId}
          quizId={quizId}
          handleStartQuiz={handleStartQuiz}
          handleCancelQuiz={handleCancelQuiz}
          isStarting={isStarting}
        />
      </div>
    );
  }

  /**
   * ---------------------------------------------------------
   * Quiz UI
   * ---------------------------------------------------------
   */
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
            variant="outline"
            onClick={handlePrevious}
            disabled={isFirstPage || isSubmitting}
          >
            Previous
          </Button>

          {isLastPage ? (
            <Button onClick={handleSubmitQuiz} disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Quiz"}
            </Button>
          ) : (
            <Button onClick={handleNext} disabled={isSubmitting}>
              Next
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
};

export default ClientAttemptPage;
