export type Provider = "openai" | "gemini";

export type ChatMessageRole = "system" | "user" | "assistant";

export type ChatMessage = {
  role: ChatMessageRole;
  content: string;
};

export type LocalMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: Array<{ id: string; title: string; snippet: string }>;
};

export type ChatRequest = {
  provider: Provider;
  model: string;
  temperature?: number;
  maxTokens?: number;
  messages: ChatMessage[];
};

export type ChatResponse = {
  message: string;
  provider: Provider;
  model: string;
};

export type ChatError = {
  error: string;
};
