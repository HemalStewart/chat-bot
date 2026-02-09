import { memo } from "react";
import type { FormEvent } from "react";

export type ChatComposerProps = {
  draft: string;
  onDraftChange: (value: string) => void;
  onSend: () => void;
  isLoading: boolean;
};

export const ChatComposer = memo(
  ({ draft, onDraftChange, onSend, isLoading }: ChatComposerProps) => {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSend();
  };

  return (
    <form className="glass-panel rounded-3xl p-4" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-4 md:flex-row md:items-end">
        <div className="flex-1">
          <label className="text-[11px] font-semibold uppercase tracking-[0.3em] text-foreground/50">
            Message
          </label>
          <div className="mt-2 flex items-end rounded-3xl border border-white/70 bg-white/70 px-4 py-3 shadow-sm focus-within:border-blue-400/60 focus-within:ring-2 focus-within:ring-blue-500/30">
            <textarea
              className="min-h-[64px] w-full resize-none bg-transparent text-sm text-foreground/80 outline-none"
              placeholder="Ask for a lesson plan, worksheet, marking scheme, or exam help..."
              value={draft}
              onChange={(event) => onDraftChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  onSend();
                }
              }}
            />
            <button
              type="submit"
              disabled={isLoading || draft.trim().length === 0}
              className="ml-3 h-9 rounded-full bg-blue-500 px-4 text-xs font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              Send
            </button>
          </div>
          <p className="mt-2 text-xs text-foreground/40">
            Press Enter to send, Shift + Enter for a new line.
          </p>
        </div>
      </div>
    </form>
  );
});

ChatComposer.displayName = "ChatComposer";
