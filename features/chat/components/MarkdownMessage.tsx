import { memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export const MarkdownMessage = memo(({ content }: { content: string }) => {
  return (
    <div className="text-sm leading-6 text-foreground/80">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h3: ({ children }) => (
            <h3 className="mt-4 text-sm font-semibold text-foreground">{children}</h3>
          ),
          h4: ({ children }) => (
            <h4 className="mt-3 text-xs font-semibold uppercase tracking-[0.2em] text-foreground/60">
              {children}
            </h4>
          ),
          p: ({ children }) => <p className="mt-2 text-sm leading-6">{children}</p>,
          ul: ({ children }) => (
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">{children}</ol>
          ),
          strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
          code: ({ children }) => (
            <code className="rounded bg-slate-900/5 px-1 py-0.5 text-xs text-foreground">
              {children}
            </code>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
});

MarkdownMessage.displayName = "MarkdownMessage";
