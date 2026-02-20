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

export const sendChatStream = async (
  payload: ChatRequest,
  onToken: (token: string) => void
): Promise<void> => {
  const response = await fetch("/api/chat/stream", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as ChatError | null;
    throw new Error(data?.error ?? "Streaming request failed.");
  }

  if (!response.body) {
    throw new Error("Streaming is not supported in this environment.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const chunks = buffer.split("\n\n");
    buffer = chunks.pop() ?? "";

    for (const chunk of chunks) {
      const line = chunk.trim();
      if (!line.startsWith("data:")) continue;
      const data = line.replace(/^data:\s*/, "").trim();

      if (data === "[DONE]") {
        return;
      }

      try {
        const parsed = JSON.parse(data) as { token?: string; done?: boolean; error?: string };
        if (parsed.error) {
          throw new Error(parsed.error);
        }
        if (parsed.token) {
          onToken(parsed.token);
        }
        if (parsed.done) {
          return;
        }
      } catch (err) {
        if (err instanceof Error) {
          throw err;
        }
      }
    }
  }
};
