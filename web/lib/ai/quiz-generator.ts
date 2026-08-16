import { ChatGroq } from "@langchain/groq";
import { aiQuizResponseSchema } from "@/lib/zod/trainer.schema";
import z from "zod";

export type AiQuizResponse = z.infer<typeof aiQuizResponseSchema>;

const model = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: "openai/gpt-oss-120b",
  temperature: 0.3,
});

const structuredModel = model.withStructuredOutput(
  aiQuizResponseSchema,
);

export async function generateQuizQuestions({
  prompt,
  questionCount,
  difficulty,
}: {
  prompt: string;
  questionCount: number;
  difficulty: "easy" | "medium" | "hard";
}): Promise<AiQuizResponse> {
  const response = await structuredModel.invoke([
    [
      "system",
      `
You are an expert educational quiz generator.

Generate high-quality quiz questions based ONLY on the trainer's requested topic.

Rules:

1. Generate exactly the requested number of questions.
2. Difficulty must match the requested difficulty.
3. Questions must be clear and educational.
4. Avoid duplicate or nearly duplicate questions.
5. Use a mixture of MCQ and boolean questions when appropriate.
6. Every MCQ must have exactly four options.
7. Every boolean question must have exactly two options:
   - a = True
   - b = False
8. correctOption must always contain the correct answer.
9. Each question must have marks = 1.
10. Do not include explanations.
11. Do not include markdown.
12. Do not include anything outside the requested structured response.
      `,
    ],
    [
      "human",
      `
Generate ${questionCount} quiz questions.

Difficulty: ${difficulty}

Trainer's topic/instructions:
${prompt}
      `,
    ],
  ]);

  return response;
}