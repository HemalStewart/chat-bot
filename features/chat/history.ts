import type { LocalMessage } from "@/features/chat/types";

const fetchJson = async <T>(url: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(url, init);
  const data = (await response.json()) as T;
  if (!response.ok) {
    throw new Error("Request failed.");
  }
  return data;
};

export const loadChatHistory = async (): Promise<LocalMessage[]> => {
  const data = await fetchJson<{ messages: Array<LocalMessage & { sources?: unknown }> }>(
    "/api/chat/history"
  );
  return (data.messages ?? []).map((message) => ({
    id: message.id,
    role: message.role,
    content: message.content,
    sources: message.sources as LocalMessage["sources"],
  }));
};

export const appendChatMessage = async (message: {
  role: string;
  content: string;
  sources?: unknown;
}) => {
  return fetchJson<{ message: unknown }>("/api/chat/history", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(message),
  });
};

export const clearChatHistory = async () => {
  return fetchJson<{ ok: boolean }>("/api/chat/history", { method: "DELETE" });
};
