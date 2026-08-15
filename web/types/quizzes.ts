export type AttemptQuizData = {
  quiz: {
    id: string;
    batchId: string;
    title: string;
    description: string | null;
    durationMinutes: number;
    totalMarks: number;
    status: "draft" | "published" | "closed" | "archived";
    publishedDate: Date | null;
    questionCount: number;
  };

  attempt: {
    id: string;
    status: "in_progress";
    startedAt: Date;
    expiresAt: Date;
    submittedAt: null;
    score: null;
  };

  questions: {
    id: string;
    type: "mcq" | "boolean";
    question: string;
    options: {
      id: "a" | "b" | "c" | "d";
      text: string;
    }[];
    marks: number;
    orderIndex: number;
  }[];
};

export type AttemptQuizResponse =
  | {
      success: true;
      data: AttemptQuizData;
      message?: string;
      error?: never;
    }
  | {
      success: false;
      data: null;
      message?: string;
      error?: string;
    };