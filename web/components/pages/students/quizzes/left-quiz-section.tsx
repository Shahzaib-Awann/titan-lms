import { memo } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface Option {
  id: string;
  text: string;
}

interface Question {
  id: string;
  type: string;
  question: string;
  options: Option[];
  marks: number;
  orderIndex: number;
}

interface LeftQuizSectionProps {
  questions: Question[];
  answers: Record<string, string>;
  onAnswerChange: (questionId: string, answerId: string) => void;
}

const LeftQuizSection = memo(function LeftQuizSection({
  questions,
  answers,
  onAnswerChange,
}: LeftQuizSectionProps) {
  return (
    <div className="mx-auto w-full space-y-6 p-6">
      {questions.map((question) => (
        <QuestionCard
          key={question.id}
          question={question}
          selectedAnswer={answers[question.id] ?? ""}
          onAnswerChange={onAnswerChange}
        />
      ))}
    </div>
  );
});

export default LeftQuizSection;

interface QuestionCardProps {
  question: Question;
  selectedAnswer: string;
  onAnswerChange: (questionId: string, answerId: string) => void;
}

const QuestionCard = memo(function QuestionCard({
  question,
  selectedAnswer,
  onAnswerChange,
}: QuestionCardProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-base font-medium">
          Question {question.orderIndex + 1}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="flex flex-row justify-between gap-4">
          <Input
            type="text"
            readOnly
            label="Type"
            value={question.type === "mcq" ? "Multiple Choice" : question.type}
            className="w-50 min-w-0 select-none"
            onMouseDown={(e) => e.preventDefault()}
          />

          <Input
            type="number"
            readOnly
            label="Marks"
            value={question.marks}
            className="w-30 min-w-0 select-none"
            onMouseDown={(e) => e.preventDefault()}
          />
        </div>

        <Input
          readOnly
          label="Question"
          value={question.question}
          aria-label="Question"
          className="min-w-0 flex-1 select-none"
          onMouseDown={(e) => e.preventDefault()}
        />

        <div>
          <label className="mb-3 block text-sm font-medium">Options</label>

          <RadioGroup
            value={selectedAnswer}
            onValueChange={(value) => onAnswerChange(question.id, value)}
            className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-15"
          >
            {question.options.map((option) => (
              <OptionField
                key={option.id}
                questionId={question.id}
                option={option}
              />
            ))}
          </RadioGroup>
        </div>
      </CardContent>
    </Card>
  );
});

type OptionFieldProps = {
  questionId: string;
  option: Option;
};

const OptionField = memo(function OptionField({
  questionId,
  option,
}: OptionFieldProps) {
  const optionInputId = `${questionId}-${option.id}`;

  return (
    <div className="flex w-full items-center gap-5">
      <RadioGroupItem value={option.id} id={optionInputId} />

      <Input
        readOnly
        value={option.text}
        className="min-w-0 flex-1 select-none"
        wrapperClassName="w-full"
        aria-label={option.text}
        onMouseDown={(e) => e.preventDefault()}
      />
    </div>
  );
});
