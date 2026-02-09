import type { ChatRequest } from "@/features/chat/types";
import { ApiError } from "@/lib/ai/errors";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const jsonHeaders = { "Content-Type": "application/json" };

const extractOpenAIMessage = (data: unknown): string | null => {
  if (!data || typeof data !== "object") return null;
  const response = data as { choices?: Array<{ message?: { content?: string } }> };
  return response.choices?.[0]?.message?.content ?? null;
};

export const sendOpenAIChat = async (payload: ChatRequest) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new ApiError("OPENAI_API_KEY is not configured.", 400);
  }

  const response = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      ...jsonHeaders,
    },
    body: JSON.stringify({
      model: payload.model,
      messages: payload.messages,
      temperature: payload.temperature ?? 0.7,
      max_tokens: payload.maxTokens ?? 2048,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    const errorMessage =
      (data as { error?: { message?: string } })?.error?.message ??
      "OpenAI request failed.";
    throw new ApiError(errorMessage, response.status);
  }

  const message = extractOpenAIMessage(data);
  if (!message) {
    throw new ApiError("OpenAI response did not include a message.", 502);
  }

  return message;
};
