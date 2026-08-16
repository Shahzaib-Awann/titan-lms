"use server";

import { ChatGroq } from "@langchain/groq";
import { z } from "zod";

import {
  aiQuizResponseSchema,
  generateAiQuizSchema,
} from "@/lib/zod/trainer.schema";

export type AiQuizResponse = z.infer<typeof aiQuizResponseSchema>;

type GenerateQuizQuestionsInput = z.infer<typeof generateAiQuizSchema>;

const SYSTEM_PROMPT = `
You are an expert educational quiz generator.

Generate high-quality quiz questions based only on the trainer's requested topic.

Requirements:
- Generate exactly the requested number of questions.
- Match the requested difficulty.
- Keep every question clear, accurate, and educational.
- Avoid duplicate or nearly duplicate questions.
- Use both MCQ and boolean questions when appropriate.
- MCQ questions must have exactly four options: a, b, c, d.
- Boolean questions must have exactly two options: a = True and b = False.
- correctOption must identify the correct answer.
- Do not include explanations.
- Do not include markdown.
- Do not include information unrelated to the requested topic.
- Return only the structured quiz response.
`.trim();

function validateAiQuizResponse(response: AiQuizResponse): AiQuizResponse {
  if (response.questions.length === 0) {
    throw new Error("AI generated no questions.");
  }

  for (const question of response.questions) {
    if (question.type === "boolean") {
      const optionIds = question.options.map((option) => option.id);

      if (
        question.options.length !== 2 ||
        optionIds[0] !== "a" ||
        optionIds[1] !== "b" ||
        !["a", "b"].includes(question.correctOption)
      ) {
        throw new Error("AI generated an invalid boolean question.");
      }

      continue;
    }

    const optionIds = question.options.map((option) => option.id);

    if (
      question.options.length !== 4 ||
      optionIds[0] !== "a" ||
      optionIds[1] !== "b" ||
      optionIds[2] !== "c" ||
      optionIds[3] !== "d"
    ) {
      throw new Error("AI generated an invalid multiple-choice question.");
    }
  }

  return response;
}

export async function generateQuizQuestions(
  input: GenerateQuizQuestionsInput,
): Promise<AiQuizResponse> {
  const { prompt, questionCount, difficulty } =
    generateAiQuizSchema.parse(input);

  const GROQ_API_KEY = process.env.GROQ_API_KEY?.trim();

  if (!GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not defined.");
  }

  const model = new ChatGroq({
    apiKey: GROQ_API_KEY,
    model: "openai/gpt-oss-120b",
    temperature: 0.3,
  });

  const structuredModel = model.withStructuredOutput(aiQuizResponseSchema);

  const response = await structuredModel.invoke([
    {
      role: "system",
      content: SYSTEM_PROMPT,
    },
    {
      role: "user",
      content: [
        `Generate exactly ${questionCount} quiz questions.`,
        `Difficulty: ${difficulty}.`,
        "",
        "Trainer's topic/instructions:",
        prompt,
      ].join("\n"),
    },
  ]);

  const validatedResponse = aiQuizResponseSchema.parse(response);

  return validateAiQuizResponse(validatedResponse);
}
