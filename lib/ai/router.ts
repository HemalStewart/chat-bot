import type { ChatRequest, ChatResponse } from "@/features/chat/types";
import { ApiError } from "@/lib/ai/errors";
import { sendGeminiChat } from "@/lib/ai/providers/gemini";
import { sendOpenAIChat } from "@/lib/ai/providers/openai";

export const routeChat = async (payload: ChatRequest): Promise<ChatResponse> => {
  if (!payload?.provider || !payload?.model || !payload?.messages?.length) {
    throw new ApiError("Missing provider, model, or messages.", 400);
  }

  if (payload.provider === "openai" || payload.provider === "claude") {
    const message = await sendOpenAIChat(payload);
    return { message, provider: payload.provider, model: payload.model };
  }

  if (payload.provider === "gemini") {
    const message = await sendGeminiChat(payload);
    return { message, provider: payload.provider, model: payload.model };
  }

  throw new ApiError("Unsupported provider.", 400);
};
