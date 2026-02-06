"use client";

import { AppHeader } from "@/features/ai-browser/components/AppHeader";
import { buildFocus, heroCopy, roadmapHighlights } from "@/features/ai-browser/constants";
import { ChatComposer } from "@/features/chat/components/ChatComposer";
import { ChatSidebar } from "@/features/chat/components/ChatSidebar";
import { ChatTranscript } from "@/features/chat/components/ChatTranscript";
import { useChatSession } from "@/features/chat/hooks/useChatSession";
import { tutorModePresets } from "@/features/tutor/presets";

export const AiBrowserAgentApp = () => {
  const {
    provider,
    setProvider,
    model,
    setModelByProvider,
    systemPrompt,
    updateSystemPrompt,
    temperature,
    setTemperature,
    maxTokens,
    setMaxTokens,
    messages,
    draft,
    setDraft,
    error,
    isLoading,
    latencyMs,
    providerHint,
    selectedTutorMode,
    applyTutorMode,
    clearSession,
    sendMessage,
  } = useChatSession();

  return (
    <div className="h-screen w-screen p-6 text-foreground">
      <div className="glass-ultra transition-smooth flex h-full w-full flex-col gap-6 rounded-[32px] border border-white/70 p-6">
        <AppHeader
          eyebrow={heroCopy.eyebrow}
          title={heroCopy.title}
          description={heroCopy.description}
          isLoading={isLoading}
          providerHint={providerHint}
          latencyMs={latencyMs}
        />

        <section className="grid flex-1 gap-6 overflow-hidden lg:grid-cols-[320px_1fr]">
          <ChatSidebar
            provider={provider}
            onProviderChange={setProvider}
            model={model}
            onModelChange={(value) =>
              setModelByProvider((current) => ({
                ...current,
                [provider]: value,
              }))
            }
            systemPrompt={systemPrompt}
            onSystemPromptChange={updateSystemPrompt}
            temperature={temperature}
            onTemperatureChange={setTemperature}
            maxTokens={maxTokens}
            onMaxTokensChange={(value) => {
              if (Number.isNaN(value) || value < 1) return;
              setMaxTokens(value);
            }}
            onClearSession={clearSession}
            tutorModes={tutorModePresets}
            selectedTutorMode={selectedTutorMode}
            onTutorModeSelect={applyTutorMode}
            buildFocus={buildFocus}
            roadmapHighlights={roadmapHighlights}
          />

          <div className="flex h-full flex-col gap-5 overflow-hidden">
            <ChatTranscript messages={messages} isLoading={isLoading} error={error} />
            <ChatComposer
              draft={draft}
              onDraftChange={setDraft}
              onSend={sendMessage}
              isLoading={isLoading}
            />
          </div>
        </section>
      </div>
    </div>
  );
};
