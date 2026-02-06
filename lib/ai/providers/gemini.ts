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
  const systemText = messages
    .filter((message) => message.role === "system")
    .map((message) => message.content.trim())
    .filter(Boolean)
    .join("\n\n");

  const nonSystemMessages = messages.filter((message) => message.role !== "system");
  let mergedMessages = nonSystemMessages;

  if (systemText) {
    if (mergedMessages.length && mergedMessages[0].role === "user") {
      mergedMessages = [
        {
          role: "user",
          content: `System instructions:\n${systemText}\n\n${mergedMessages[0].content}`,
        },
        ...mergedMessages.slice(1),
      ];
    } else {
      mergedMessages = [
        { role: "user", content: `System instructions:\n${systemText}` },
        ...mergedMessages,
      ];
    }
  }

  return mergedMessages.map((message) => ({
    role: message.role === "assistant" ? "model" : "user",
    parts: [{ text: message.content }],
  }));
};

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

  const response = await fetch(
    `${GEMINI_BASE_URL}/${normalizeGeminiModel(payload.model)}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify({
        contents: buildGeminiContents(payload.messages),
        generationConfig: {
          temperature: payload.temperature ?? 0.7,
          maxOutputTokens: payload.maxTokens ?? 512,
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
