import type { Provider } from "@/features/chat/types";

export const providerOptions: { id: Provider; label: string; hint: string }[] = [
  { id: "openai", label: "OpenAI", hint: "GPT" },
  { id: "gemini", label: "Gemini", hint: "Google" },
];

export const defaultModels: Record<Provider, string> = {
  openai: "gpt-4o-mini",
  gemini: "gemini-2.5-flash",
};
