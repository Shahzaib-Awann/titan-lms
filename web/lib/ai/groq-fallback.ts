import Groq from "groq-sdk";

// Models are tried in order.
const AVAILABLE_GROQ_MODELS = [
  "openai/gpt-oss-120b",
  "openai/gpt-oss-20b",
  "qwen/qwen3.6-27b",
  "allam-2-7b",
];

// Get the SDK's create parameter type.
type GroqCreateParams = Parameters<Groq["chat"]["completions"]["create"]>[0];

export interface FallbackOptions {
  groq: Groq;
  params: Omit<GroqCreateParams, "model">;
}

/**
 * Iterates through a list of Groq models sequentially.
 * Switches to the next model if the current model fails (rate limits, 404s, downtime).
 * Throws a clean limit error if all candidate models are exhausted.
 */
export async function createCompletionWithModelFallback({
  groq,
  params,
}: FallbackOptions): Promise<{
  completion: Groq.Chat.Completions.ChatCompletion;
  usedModel: string;
}> {
  if (!AVAILABLE_GROQ_MODELS || AVAILABLE_GROQ_MODELS.length === 0) {
    throw new Error("No Groq models provided for execution.");
  }

  for (const model of AVAILABLE_GROQ_MODELS) {
    try {
      const requestPayload = {
        ...params,
        model,
      } as GroqCreateParams;

      const completion = (await groq.chat.completions.create(
        requestPayload,
      )) as Groq.Chat.Completions.ChatCompletion;

      return { completion, usedModel: model };
    } catch (error: unknown) {
      const err = error as {
        status?: number | string;
        error?: { message?: string };
        message?: string;
      };

      const status = err?.status ?? "UNKNOWN";
      const message = err?.error?.message ?? err?.message ?? "Request failed";

      console.warn(
        `[Groq Fallback] model=${model} status=${status} reason="${message}" action=next_model`,
      );
    }
  }

  throw new Error(
    "API Limit Exceeded: All available AI models are currently rate-limited or unavailable. Please try again later.",
  );
}
