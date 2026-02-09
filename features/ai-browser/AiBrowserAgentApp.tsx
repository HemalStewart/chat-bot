"use client";

import { useState } from "react";
import { AppHeader } from "@/features/ai-browser/components/AppHeader";
import { buildFocus, heroCopy, roadmapHighlights } from "@/features/ai-browser/constants";
import { ChatComposer } from "@/features/chat/components/ChatComposer";
import { ChatSidebar } from "@/features/chat/components/ChatSidebar";
import { ChatTranscript } from "@/features/chat/components/ChatTranscript";
import { LanguageToggle } from "@/features/chat/components/LanguageToggle";
import { useChatSession } from "@/features/chat/hooks/useChatSession";
import { useModelList } from "@/features/chat/hooks/useModelList";
import { ContextPanel } from "@/features/rag/components/ContextPanel";
import { ContextScopeToggle } from "@/features/rag/components/ContextScopeToggle";
import { ContextToggle } from "@/features/rag/components/ContextToggle";
import { useContextStore } from "@/features/rag/store";
import { PastPaperPanel } from "@/features/papers/components/PastPaperPanel";
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
    messages,
    draft,
    setDraft,
    error,
    isLoading,
    latencyMs,
    providerHint,
    useRag,
    setUseRag,
    ragScope,
    setRagScope,
    setRagFocusId,
    selectedTutorMode,
    applyTutorMode,
    clearSession,
    sendMessage,
    responseLanguage,
    setResponseLanguage,
  } = useChatSession();
  const modelList = useModelList(provider);
  const contextStore = useContextStore();
  const [rightPanelTab, setRightPanelTab] = useState<"context" | "papers">("context");

  return (
    <div className="h-screen w-screen p-6 text-foreground">
      <div className="flex h-full w-full flex-col gap-6">
        <div className="glass-panel rounded-3xl p-6">
          <AppHeader
            eyebrow={heroCopy.eyebrow}
            title={heroCopy.title}
            description={heroCopy.description}
            isLoading={isLoading}
            providerHint={providerHint}
            latencyMs={latencyMs}
            trailing={
            <div className="flex items-center gap-2">
              <LanguageToggle value={responseLanguage} onChange={setResponseLanguage} />
              <ContextScopeToggle scope={ragScope} onChange={setRagScope} />
              <ContextToggle
                enabled={useRag}
                onToggle={() => setUseRag((prev) => !prev)}
                count={contextStore.docs.length}
              />
            </div>
          }
        />
        </div>

        <section className="grid flex-1 gap-6 overflow-hidden lg:grid-cols-[320px_1fr_320px]">
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
            onClearSession={clearSession}
            tutorModes={tutorModePresets}
            selectedTutorMode={selectedTutorMode}
            onTutorModeSelect={applyTutorMode}
            modelOptions={modelList.models}
            modelLoading={modelList.isLoading}
            modelError={modelList.error}
            buildFocus={buildFocus}
            roadmapHighlights={roadmapHighlights}
          />

          <div className="flex h-full flex-col gap-5 overflow-hidden">
            <ChatTranscript messages={messages} isLoading={isLoading} error={error} />
            <ChatComposer
              draft={draft}
              onDraftChange={setDraft}
              onSend={() => sendMessage(contextStore.docs)}
              isLoading={isLoading}
            />
          </div>

          <div className="flex h-full flex-col gap-5 overflow-y-auto pr-1">
            <div className="glass-panel sticky top-0 z-10 flex items-center justify-between rounded-3xl p-3 text-xs text-foreground/70">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setRightPanelTab("context")}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition-spring ${
                    rightPanelTab === "context"
                      ? "bg-blue-500 text-white"
                      : "bg-white/60 text-foreground/70"
                  }`}
                >
                  Context
                </button>
                <button
                  type="button"
                  onClick={() => setRightPanelTab("papers")}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition-spring ${
                    rightPanelTab === "papers"
                      ? "bg-blue-500 text-white"
                      : "bg-white/60 text-foreground/70"
                  }`}
                >
                  Past Papers
                </button>
              </div>
            </div>

            {rightPanelTab === "context" ? (
              <ContextPanel
                docs={contextStore.docs}
                onAdd={contextStore.addDoc}
                onRemove={contextStore.removeDoc}
                onClear={contextStore.clearDocs}
                onUploadPdf={contextStore.uploadPdf}
                uploading={contextStore.uploading}
                uploadError={contextStore.uploadError}
                responseLanguage={responseLanguage}
              />
            ) : (
              <PastPaperPanel
                onSendToChat={async (prompt, context) => {
                  setDraft(prompt);
                  setUseRag(true);
                  setRagScope("focused");
                  if (context) {
                    const doc = await contextStore.addDoc(context.title, context.content);
                    if (doc?.id) {
                      setRagFocusId(doc.id);
                    }
                  }
                }}
              />
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
