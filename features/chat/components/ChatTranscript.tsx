import { memo } from "react";
import type { LocalMessage } from "@/features/chat/types";
import { CitationList } from "@/features/chat/components/CitationList";
import { MarkdownMessage } from "@/features/chat/components/MarkdownMessage";

export type ChatTranscriptProps = {
  messages: LocalMessage[];
  isLoading: boolean;
  error: string | null;
};

type ChatMessageBubbleProps = {
  message: LocalMessage;
  isStreaming: boolean;
};

const ChatMessageBubble = memo(
  ({ message, isStreaming }: ChatMessageBubbleProps) => {
    const isUser = message.role === "user";
    const showMarkdown = message.role === "assistant" && !isStreaming;

    return (
      <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
        <div
          className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
            isUser ? "bg-blue-500 text-white" : "bg-white/90 text-foreground/80"
          }`}
        >
          {showMarkdown ? (
            <MarkdownMessage content={message.content} />
          ) : (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          )}
          {message.sources && message.sources.length > 0 && !isStreaming && (
            <CitationList sources={message.sources} />
          )}
        </div>
      </div>
    );
  },
  (prev, next) => prev.message === next.message && prev.isStreaming === next.isStreaming
);

ChatMessageBubble.displayName = "ChatMessageBubble";

export const ChatTranscript = ({ messages, isLoading, error }: ChatTranscriptProps) => {
  const hasMessages = messages.length > 0;
  const lastMessageId = messages[messages.length - 1]?.id;

  return (
    <div className="glass-panel flex flex-1 flex-col gap-4 overflow-hidden rounded-3xl p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Transcript</h2>
        <span className="text-xs text-foreground/50">{messages.length} turns</span>
      </div>
      <div className="flex-1 space-y-4 overflow-y-auto pr-2">
        {!hasMessages && (
          <div className="rounded-2xl border border-dashed border-white/70 bg-white/50 p-6 text-sm text-foreground/60">
            Send your first prompt to begin the conversation.
          </div>
        )}
        {messages.map((message) => {
          const isStreaming =
            isLoading && message.role === "assistant" && message.id === lastMessageId;
          return (
            <ChatMessageBubble
              key={message.id}
              message={message}
              isStreaming={isStreaming}
            />
          );
        })}
        {isLoading && (
          <div className="flex justify-start">
            <div className="rounded-2xl bg-white/80 px-4 py-3 text-sm text-foreground/60">
              Generating response...
            </div>
          </div>
        )}
      </div>
      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}
    </div>
  );
};
