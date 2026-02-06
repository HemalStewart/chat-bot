import type { ChatRequest, ChatResponse, ChatError } from "@/features/chat/types";

export const sendChatRequest = async (payload: ChatRequest): Promise<ChatResponse> => {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = (await response.json()) as ChatResponse | ChatError;
  if (!response.ok) {
    throw new Error("error" in data ? data.error : "Unexpected response from the server.");
  }

  if (!("message" in data) || !data.message) {
    throw new Error("Unexpected response from the server.");
  }

  return data;
};
