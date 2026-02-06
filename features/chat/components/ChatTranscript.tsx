import type { LocalMessage } from "@/features/chat/types";

export type ChatTranscriptProps = {
  messages: LocalMessage[];
  isLoading: boolean;
  error: string | null;
};

export const ChatTranscript = ({ messages, isLoading, error }: ChatTranscriptProps) => {
  const hasMessages = messages.length > 0;

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
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                message.role === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-white/80 text-foreground/80"
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
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
