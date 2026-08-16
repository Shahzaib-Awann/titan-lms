"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface StartQuizInstructionsDialogProps {
  handleStartQuiz: () => void;
  handleCancelQuiz: () => void;
  isStarting: boolean;
}

const StartQuizInstructionsDialog = ({
  handleStartQuiz,
  handleCancelQuiz,
  isStarting,
}: StartQuizInstructionsDialogProps) => {
  return (
    <Dialog open>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Ready to start the quiz?</DialogTitle>
          <DialogDescription>
            Please read the instructions carefully before starting.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-lg border bg-muted/50 p-4">
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Complete the quiz in one session.</li>
              <li>
                • Switching tabs or windows will submit your test and mark it as
                cheated.
              </li>
              <li>
                • Exiting fullscreen mode during the test will mark your attempt
                as cheated.
              </li>
              <li>• Do not refresh, close, or navigate away from the quiz.</li>
              <li>• Make sure you have a stable internet connection.</li>
              <li>• Submit your quiz before the timer expires.</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancelQuiz}
            disabled={isStarting}
          >
            Back
          </Button>

          <Button type="button" onClick={handleStartQuiz} disabled={isStarting}>
            {isStarting ? "Starting Quiz..." : "I Understand — Start Quiz"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StartQuizInstructionsDialog;
