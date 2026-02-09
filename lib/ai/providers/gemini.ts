import type { ChatMessage, ChatRequest } from "@/features/chat/types";
import { ApiError } from "@/lib/ai/errors";

const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";
const jsonHeaders = { "Content-Type": "application/json" };

type GeminiContent = {
  role: "user" | "model";
  parts: { text: string }[];
};

const normalizeGeminiModel = (model: string) => model.replace(/^models\//, "");

const buildGeminiContents = (messages: ChatMessage[]): GeminiContent[] => {
  const nonSystemMessages = messages.filter((message) => message.role !== "system");
  return nonSystemMessages.map((message) => ({
    role: message.role === "assistant" ? "model" : "user",
    parts: [{ text: message.content }],
  }));
};

const extractSystemInstruction = (messages: ChatMessage[]) =>
  messages
    .filter((message) => message.role === "system")
    .map((message) => message.content.trim())
    .filter(Boolean)
    .join("\n\n")
    .trim();

const extractGeminiMessage = (data: unknown): string | null => {
  if (!data || typeof data !== "object") return null;
  const response = data as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  return response.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
};

export const sendGeminiChat = async (payload: ChatRequest) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new ApiError("GEMINI_API_KEY is not configured.", 400);
  }

  const systemInstruction = extractSystemInstruction(payload.messages);
  const response = await fetch(
    `${GEMINI_BASE_URL}/${normalizeGeminiModel(payload.model)}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify({
        contents: buildGeminiContents(payload.messages),
        ...(systemInstruction
          ? {
              systemInstruction: {
                parts: [{ text: systemInstruction }],
              },
            }
          : {}),
        generationConfig: {
          temperature: payload.temperature ?? 0.7,
          maxOutputTokens: payload.maxTokens ?? 2048,
        },
      }),
    }
  );

  const data = await response.json();
  if (!response.ok) {
    const errorMessage =
      (data as { error?: { message?: string } })?.error?.message ??
      "Gemini request failed.";
    throw new ApiError(errorMessage, response.status);
  }

  const message = extractGeminiMessage(data);
  if (!message) {
    throw new ApiError("Gemini response did not include a message.", 502);
  }

  return message;
};
