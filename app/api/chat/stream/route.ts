import { NextRequest, NextResponse } from "next/server";
import type { ChatRequest, ChatMessage } from "@/features/chat/types";
import { ApiError } from "@/lib/ai/errors";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";

const jsonHeaders = { "Content-Type": "application/json" };

const normalizeGeminiModel = (model: string) => model.replace(/^models\//, "");

type GeminiContent = {
  role: "user" | "model";
  parts: { text: string }[];
};

type GeminiStreamEvent = {
  candidates?: Array<{
    finishReason?: string;
    content?: { parts?: Array<{ text?: string }> };
  }>;
  promptFeedback?: {
    blockReason?: string;
    blockReasonMessage?: string;
  };
};

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

const extractGeminiStreamText = (event: unknown): string => {
  if (!event || typeof event !== "object") return "";
  const parsed = event as GeminiStreamEvent;
  return (parsed.candidates ?? [])
    .flatMap((candidate) => candidate.content?.parts ?? [])
    .map((part) => part.text ?? "")
    .join("");
};

const extractGeminiStreamReason = (event: unknown): { message: string; status: number } | null => {
  if (!event || typeof event !== "object") return null;
  const parsed = event as GeminiStreamEvent;
  const blockReason = parsed.promptFeedback?.blockReason;
  if (blockReason) {
    return {
      message:
        parsed.promptFeedback?.blockReasonMessage ??
        `Gemini blocked this response (${blockReason}). Rephrase and try again.`,
      status: 400,
    };
  }

  const finishReason = parsed.candidates?.[0]?.finishReason;
  if (finishReason && finishReason !== "STOP") {
    return {
      message: `Gemini finished without text (${finishReason}). Try a shorter or clearer prompt.`,
      status: 502,
    };
  }
  return null;
};

const createEventStream = (
  handler: (controller: ReadableStreamDefaultController<Uint8Array>) => Promise<void>
) => {
  const encoder = new TextEncoder();
  return new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        await handler(controller);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Stream error.";
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: message, done: true })}\n\n`));
      } finally {
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      }
    },
  });
};

const streamOpenAI = async (
  payload: ChatRequest,
  controller: ReadableStreamDefaultController<Uint8Array>
) => {
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
      stream: true,
    }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    const errorMessage =
      (data as { error?: { message?: string } })?.error?.message ??
      "OpenAI request failed.";
    throw new ApiError(errorMessage, response.status);
  }

  if (!response.body) {
    throw new ApiError("OpenAI stream is not available.", 502);
  }

  const encoder = new TextEncoder();
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const data = trimmed.replace(/^data:\s*/, "").trim();
      if (!data) continue;
      if (data === "[DONE]") {
        return;
      }

      try {
        const json = JSON.parse(data) as {
          choices?: Array<{ delta?: { content?: string } }>;
        };
        const token = json.choices?.[0]?.delta?.content ?? "";
        if (token) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ token })}\n\n`));
        }
      } catch (error) {
        // Ignore malformed chunks
      }
    }
  }
};

const streamGemini = async (
  payload: ChatRequest,
  controller: ReadableStreamDefaultController<Uint8Array>
) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new ApiError("GEMINI_API_KEY is not configured.", 400);
  }

  const systemInstruction = extractSystemInstruction(payload.messages);
  const response = await fetch(
    `${GEMINI_BASE_URL}/${normalizeGeminiModel(payload.model)}:streamGenerateContent?alt=sse&key=${apiKey}`,
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

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    const errorMessage =
      (data as { error?: { message?: string } })?.error?.message ??
      "Gemini request failed.";
    throw new ApiError(errorMessage, response.status);
  }

  if (!response.body) {
    throw new ApiError("Gemini stream is not available.", 502);
  }

  const encoder = new TextEncoder();
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let emittedToken = false;
  let latestEvent: unknown = null;

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const data = trimmed.replace(/^data:\s*/, "").trim();
      if (!data) continue;
      if (data === "[DONE]") {
        return;
      }

      try {
        const json = JSON.parse(data) as GeminiStreamEvent;
        latestEvent = json;
        const token = extractGeminiStreamText(json);
        if (token) {
          emittedToken = true;
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ token })}\n\n`));
        }
      } catch (error) {
        // Ignore malformed chunks
      }
    }
  }

  if (!emittedToken) {
    const reason = extractGeminiStreamReason(latestEvent);
    throw new ApiError(
      reason?.message ?? "Gemini returned an empty stream response.",
      reason?.status ?? 502
    );
  }
};

export async function POST(request: NextRequest) {
  let payload: ChatRequest;
  try {
    payload = (await request.json()) as ChatRequest;
  } catch (error) {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  if (!payload?.provider || !payload?.model || !payload?.messages?.length) {
    return NextResponse.json(
      { error: "Missing provider, model, or messages." },
      { status: 400 }
    );
  }

  const stream = createEventStream(async (controller) => {
    if (payload.provider === "openai" || payload.provider === "claude") {
      await streamOpenAI(payload, controller);
      return;
    }

    if (payload.provider === "gemini") {
      await streamGemini(payload, controller);
      return;
    }

    throw new ApiError("Unsupported provider.", 400);
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

export const runtime = "nodejs";
