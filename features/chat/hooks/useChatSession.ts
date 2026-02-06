"use client";

import { useEffect, useMemo, useState } from "react";
import { sendChatRequest } from "@/features/chat/api";
import { defaultModels, providerOptions } from "@/features/chat/constants";
import type { ChatMessage, LocalMessage, Provider } from "@/features/chat/types";
import type { TutorModePreset } from "@/features/tutor/types";

const STORAGE_KEY = "ai-agent-browser.session.v1";

type StoredSession = {
  provider: Provider;
  modelByProvider: Record<Provider, string>;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  messages: LocalMessage[];
  draft: string;
};

const createMessageId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const useChatSession = () => {
  const [provider, setProvider] = useState<Provider>("openai");
  const [modelByProvider, setModelByProvider] = useState<Record<Provider, string>>(
    defaultModels
  );
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(512);
  const [systemPrompt, setSystemPrompt] = useState("");
  const [selectedTutorMode, setSelectedTutorMode] = useState<TutorModePreset | null>(null);
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);

  const model = modelByProvider[provider];

  const providerHint = useMemo(() => {
    return providerOptions.find((option) => option.id === provider)?.hint ?? "";
  }, [provider]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as StoredSession;
      if (!parsed) return;
      setProvider(parsed.provider ?? "openai");
      setModelByProvider(parsed.modelByProvider ?? defaultModels);
      setTemperature(parsed.temperature ?? 0.7);
      setMaxTokens(parsed.maxTokens ?? 512);
      setSystemPrompt(parsed.systemPrompt ?? "");
      setMessages(parsed.messages ?? []);
      setDraft(parsed.draft ?? "");
    } catch (err) {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const payload: StoredSession = {
      provider,
      modelByProvider,
      temperature,
      maxTokens,
      systemPrompt,
      messages,
      draft,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [provider, modelByProvider, temperature, maxTokens, systemPrompt, messages, draft]);

  const clearSession = () => {
    setMessages([]);
    setLatencyMs(null);
    setError(null);
  };

  const updateSystemPrompt = (value: string) => {
    setSystemPrompt(value);
    setSelectedTutorMode(null);
  };

  const applyTutorMode = (mode: TutorModePreset) => {
    setSelectedTutorMode(mode);
    setSystemPrompt(mode.systemPrompt);
  };

  const sendMessage = async () => {
    const trimmed = draft.trim();
    if (!trimmed || isLoading) return;

    setError(null);
    setIsLoading(true);
    const startedAt = performance.now();

    const userMessage: LocalMessage = {
      id: createMessageId(),
      role: "user",
      content: trimmed,
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setDraft("");

    const apiMessages: ChatMessage[] = nextMessages.map((message) => ({
      role: message.role,
      content: message.content,
    }));

    const payloadMessages = systemPrompt.trim()
      ? [{ role: "system", content: systemPrompt.trim() }, ...apiMessages]
      : apiMessages;

    try {
      const response = await sendChatRequest({
        provider,
        model,
        temperature,
        maxTokens,
        messages: payloadMessages,
      });

      setMessages((current) => [
        ...current,
        { id: createMessageId(), role: "assistant", content: response.message },
      ]);
      setLatencyMs(Math.round(performance.now() - startedAt));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Request failed.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    provider,
    setProvider,
    model,
    modelByProvider,
    setModelByProvider,
    temperature,
    setTemperature,
    maxTokens,
    setMaxTokens,
    systemPrompt,
    setSystemPrompt,
    messages,
    draft,
    setDraft,
    error,
    isLoading,
    latencyMs,
    providerHint,
    selectedTutorMode,
    updateSystemPrompt,
    applyTutorMode,
    clearSession,
    sendMessage,
  };
};
