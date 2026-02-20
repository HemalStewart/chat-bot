"use client";

import { AppHeader } from "@/features/ai-browser/components/AppHeader";
import { buildFocus, heroCopy, roadmapHighlights } from "@/features/ai-browser/constants";
import { ChatComposer } from "@/features/chat/components/ChatComposer";
import { ChatSidebar } from "@/features/chat/components/ChatSidebar";
import { ChatTranscript } from "@/features/chat/components/ChatTranscript";
import { LanguageToggle } from "@/features/chat/components/LanguageToggle";
import { useChatSession } from "@/features/chat/hooks/useChatSession";
import { ContextScopeToggle } from "@/features/rag/components/ContextScopeToggle";
import { ContextToggle } from "@/features/rag/components/ContextToggle";
import { UploadPdfPanel } from "@/features/rag/components/UploadPdfPanel";
import { useContextStore } from "@/features/rag/store";
import { PastPaperPanel } from "@/features/papers/components/PastPaperPanel";
import { tutorModePresets } from "@/features/tutor/presets";

export const AiBrowserAgentApp = () => {
  const {
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
  const contextStore = useContextStore();

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
            systemPrompt={systemPrompt}
            onSystemPromptChange={updateSystemPrompt}
            temperature={temperature}
            onTemperatureChange={setTemperature}
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
              onSend={() => sendMessage(contextStore.docs)}
              isLoading={isLoading}
            />
          </div>

          <div className="flex h-full flex-col gap-5 overflow-y-auto pr-1">
            <UploadPdfPanel
              docs={contextStore.docs}
              onUploadPdf={contextStore.uploadPdf}
              onUploadComplete={(doc) => {
                setUseRag(true);
                setRagScope("focused");
                setRagFocusId(doc.id);
              }}
              onRemove={contextStore.removeDoc}
              onClear={contextStore.clearDocs}
              uploading={contextStore.uploading}
              uploadError={contextStore.uploadError}
              responseLanguage={responseLanguage}
            />
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
          </div>
        </section>
      </div>
    </div>
  );
};
