"use server";

import Groq from "groq-sdk";
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
- MCQ questions must have exactly four options with ids: "a", "b", "c", "d".
- Boolean questions must have exactly two options with ids: "a" (True) and "b" (False).
- correctOption must identify the correct answer option id ("a", "b", "c", or "d").
- Do not include explanations or markdown.

You MUST return a JSON object with this EXACT structure:
{
  "questions": [
    {
      "type": "mcq",
      "question": "Question text...",
      "options": [
        { "id": "a", "text": "Option A" },
        { "id": "b", "text": "Option B" },
        { "id": "c", "text": "Option C" },
        { "id": "d", "text": "Option D" }
      ],
      "correctOption": "a"
    }
  ]
}
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

  const rawKey = process.env.GROQ_API_KEY || "";
  const GROQ_API_KEY = rawKey.replace(/^["']|["']$/g, "").trim();

  if (!GROQ_API_KEY || !GROQ_API_KEY.startsWith("gsk_")) {
    throw new Error(
      `Invalid GROQ_API_KEY. Key must start with 'gsk_'. Received prefix: '${GROQ_API_KEY.slice(0, 4)}'`,
    );
  }

  const groq = new Groq({
    apiKey: GROQ_API_KEY,
  });

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0.3,
    response_format: { type: "json_object" },
    messages: [
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
    ],
  });

  const rawContent = completion.choices[0]?.message?.content;

  if (!rawContent) {
    throw new Error("Groq API returned an empty response.");
  }

  const parsedJson = JSON.parse(rawContent);

  // Fallback handler: normalize JSON if AI returns an array or uses an alternate root key
  let normalizedData = parsedJson;
  if (Array.isArray(parsedJson)) {
    normalizedData = { questions: parsedJson };
  } else if (parsedJson && typeof parsedJson === "object" && !parsedJson.questions) {
    const arrayKey = Object.values(parsedJson).find(Array.isArray);
    if (arrayKey) {
      normalizedData = { questions: arrayKey };
    }
  }

  const validatedResponse = aiQuizResponseSchema.parse(normalizedData);

  return validateAiQuizResponse(validatedResponse);
}