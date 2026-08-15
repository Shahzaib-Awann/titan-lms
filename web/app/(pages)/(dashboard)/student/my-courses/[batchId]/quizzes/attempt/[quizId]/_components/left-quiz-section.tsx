import React, { memo } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type Option = {
  id: string;
  text: string;
};

type Question = {
  id: string;
  type: string;
  question: string;
  options: Option[];
  marks: number;
  orderIndex: number;
};

type LeftQuizSectionProps = {
  questions: Question[];
  answers: Record<string, string>;
  onAnswerChange: (questionId: string, answerId: string) => void;
};

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

type QuestionCardProps = {
  question: Question;
  selectedAnswer: string;
  onAnswerChange: (questionId: string, answerId: string) => void;
};

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
            value={question.type}
            className="w-50"
          />

          <Input
            type="number"
            readOnly
            label="Marks"
            value={question.marks}
            className="w-30"
          />
        </div>

        <Input
          readOnly
          label="Question"
          value={question.question}
          aria-label="Question"
        />

        <div>
          <label className="mb-3 block text-sm font-medium">Options</label>

          <RadioGroup
            value={selectedAnswer}
            onValueChange={(value) => onAnswerChange(question.id, value)}
            className="grid grid-cols-2 gap-4"
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
    <div className="flex items-center gap-3">
      <RadioGroupItem value={option.id} id={optionInputId} />

      <Input
        readOnly
        value={option.text}
        className="flex-1"
        aria-label={option.text}
      />
    </div>
  );
});
