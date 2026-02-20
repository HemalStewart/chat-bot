"use client";

import { useEffect, useMemo, useState } from "react";
import { sendChatRequest, sendChatStream } from "@/features/chat/api";
import { defaultMaxTokens, defaultModels, providerOptions } from "@/features/chat/constants";
import type { ChatMessage, LocalMessage, Provider } from "@/features/chat/types";
import type { TutorModePreset } from "@/features/tutor/types";
import type { ResponseLanguage } from "@/features/chat/components/LanguageToggle";
import type { RagSource } from "@/features/rag/types";
import { runLocalRag } from "@/features/rag/engine";
import type { ContextDoc } from "@/features/rag/store";
import {
  appendChatMessage,
  clearChatHistory,
  loadChatHistory,
} from "@/features/chat/history";

const createMessageId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const CALCULATION_PATTERN =
  /\b(calculate|calculation|solve|derive|derivation|equation|numerical|compute|acceleration|velocity|current|voltage|resistance|power|force|energy|momentum|units?)\b/i;
const SUMMARY_PATTERN =
  /\b(summary|summarize|summarise|brief|key points?|recap|outline|short note|bullet points?|paraphrase)\b/i;
const MATH_SYMBOL_PATTERN = /[=+\-*/^]|\\frac|\\sqrt|\d+\s?(m\/s|kg|n|j|v|a|w|ohm|%)\b/i;

const pickProviderForPrompt = (
  prompt: string,
  responseLanguage: ResponseLanguage
): Provider => {
  if (responseLanguage === "sinhala") return "gemini";
  if (CALCULATION_PATTERN.test(prompt) || MATH_SYMBOL_PATTERN.test(prompt)) return "openai";
  if (SUMMARY_PATTERN.test(prompt)) return "claude";
  return "claude";
};

export const useChatSession = () => {
  const [provider, setProvider] = useState<Provider>("openai");
  const [modelByProvider, setModelByProvider] = useState<Record<Provider, string>>(
    defaultModels
  );
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(defaultMaxTokens);
  const [systemPrompt, setSystemPrompt] = useState("");
  const [selectedTutorMode, setSelectedTutorMode] = useState<TutorModePreset | null>(null);
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [useRag, setUseRag] = useState(true);
  const [ragSources, setRagSources] = useState<RagSource[]>([]);
  const [ragFocusId, setRagFocusId] = useState<string | null>(null);
  const [ragScope, setRagScope] = useState<"focused" | "all">("focused");
  const [responseLanguage, setResponseLanguage] = useState<ResponseLanguage>("english");
  const model = modelByProvider[provider];

  const providerHint = useMemo(() => {
    return providerOptions.find((option) => option.id === provider)?.label ?? "";
  }, [provider]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const stored = await loadChatHistory();
        if (!active) return;
        setMessages(stored);
      } catch (err) {
        // Ignore history load errors for now.
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  const clearSession = () => {
    setMessages([]);
    setLatencyMs(null);
    setError(null);
    setRagSources([]);
    setRagFocusId(null);
    clearChatHistory().catch(() => undefined);
  };

  const updateSystemPrompt = (value: string) => {
    setSystemPrompt(value);
    setSelectedTutorMode(null);
  };

  const applyTutorMode = (mode: TutorModePreset) => {
    setSelectedTutorMode(mode);
    setSystemPrompt(mode.systemPrompt);
  };

  const sendMessage = async (docs?: ContextDoc[]) => {
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

    const selectedProvider = pickProviderForPrompt(trimmed, responseLanguage);
    const selectedModel = modelByProvider[selectedProvider];
    setProvider(selectedProvider);

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setDraft("");

    appendChatMessage({ role: "user", content: trimmed }).catch(() => undefined);

    const apiMessages: ChatMessage[] = nextMessages.map((message) => ({
      role: message.role,
      content: message.content,
    }));

    const languageInstruction =
      responseLanguage === "english"
        ? "Respond in English only."
        : responseLanguage === "sinhala"
        ? "Respond in Sinhala only, using Sinhala script."
        : "Respond in Tamil only, using Tamil script.";

    const systemMessages: ChatMessage[] = [];
    if (systemPrompt.trim()) {
      systemMessages.push({ role: "system", content: systemPrompt.trim() });
    }

    let payloadMessages = [...systemMessages, ...apiMessages];

    let sources: RagSource[] = [];
    const usableDocs =
      ragScope === "focused" && ragFocusId
        ? (docs ?? []).filter((doc) => doc.id === ragFocusId)
        : docs ?? [];

    if (useRag && usableDocs.length > 0) {
      if (ragScope === "focused" && usableDocs.length === 1) {
        const focused = usableDocs[0];
        sources = [
          {
            id: focused.id,
            title: focused.title,
            snippet: focused.content.slice(0, 260),
          },
        ];
        setRagSources(sources);
        payloadMessages = [
          ...payloadMessages,
          {
            role: "system",
            content: [
              "You MUST answer using ONLY the focused context below.",
              "Do NOT say you lack access to papers or sources.",
              "Treat the focused context as sufficient for the answer.",
              "Provide a step-by-step solution and include marks allocation when available.",
              "",
              `Focused Source: ${focused.title}`,
              focused.content,
            ].join("\n"),
          },
        ];
      } else {
        const rag = runLocalRag(usableDocs, { query: trimmed, scope: "page", topK: 4 });
        sources = rag.sources;
        setRagSources(sources);
        payloadMessages = [...payloadMessages, { role: "system", content: rag.answer }];
      }
    }

    // Ensure language instruction is always last so it wins.
    payloadMessages = [...payloadMessages, { role: "system", content: languageInstruction }];

    const assistantId = createMessageId();
    setMessages((current) => [
      ...current,
      { id: assistantId, role: "assistant", content: "", sources },
    ]);

    let hasStreamed = false;
    let assistantContent = "";
    let pendingContent = "";
    let rafId: number | null = null;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const flushPending = () => {
      rafId = null;
      timeoutId = null;
      if (!pendingContent) return;
      assistantContent += pendingContent;
      pendingContent = "";
      setMessages((current) =>
        current.map((message) =>
          message.id === assistantId
            ? { ...message, content: assistantContent, sources }
            : message
        )
      );
    };

    const scheduleFlush = () => {
      if (rafId !== null || timeoutId !== null) return;
      if (typeof window !== "undefined") {
        rafId = window.requestAnimationFrame(flushPending);
      } else {
        timeoutId = setTimeout(flushPending, 16);
      }
    };

    const appendToken = (token: string) => {
      hasStreamed = true;
      pendingContent += token;
      scheduleFlush();
    };

    const finalizeStream = () => {
      if (rafId !== null) {
        if (typeof window !== "undefined") {
          window.cancelAnimationFrame(rafId);
        }
        rafId = null;
      }
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      if (pendingContent) {
        assistantContent += pendingContent;
        pendingContent = "";
        setMessages((current) =>
          current.map((message) =>
            message.id === assistantId
              ? { ...message, content: assistantContent, sources }
              : message
          )
        );
      }
    };

    try {
      await sendChatStream(
        {
          provider: selectedProvider,
          model: selectedModel,
          temperature,
          maxTokens,
          messages: payloadMessages,
        },
        appendToken
      );

      if (!hasStreamed) {
        throw new Error("Empty stream response.");
      }
      finalizeStream();

      appendChatMessage({
        role: "assistant",
        content: assistantContent,
        sources,
      }).catch(() => undefined);
      setLatencyMs(Math.round(performance.now() - startedAt));
    } catch (err) {
      if (!hasStreamed) {
        try {
          const response = await sendChatRequest({
            provider: selectedProvider,
            model: selectedModel,
            temperature,
            maxTokens,
            messages: payloadMessages,
          });

          assistantContent = response.message;
          setMessages((current) =>
            current.map((message) =>
              message.id === assistantId
                ? { ...message, content: response.message, sources }
                : message
            )
          );
          appendChatMessage({
            role: "assistant",
            content: response.message,
            sources,
          }).catch(() => undefined);
          setLatencyMs(Math.round(performance.now() - startedAt));
        } catch (fallbackError) {
          const message =
            fallbackError instanceof Error ? fallbackError.message : "Request failed.";
          setError(message);
          setMessages((current) => current.filter((message) => message.id !== assistantId));
        }
      } else {
        finalizeStream();
        const message = err instanceof Error ? err.message : "Request failed.";
        setError(message);
      }
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
    useRag,
    setUseRag,
    ragSources,
    ragFocusId,
    setRagFocusId,
    ragScope,
    setRagScope,
    responseLanguage,
    setResponseLanguage,
    selectedTutorMode,
    updateSystemPrompt,
    applyTutorMode,
    clearSession,
    sendMessage,
  };
};
