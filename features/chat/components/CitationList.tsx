import type { RagSource } from "@/features/rag/types";

export const CitationList = ({ sources }: { sources: RagSource[] }) => {
  if (!sources.length) return null;

  return (
    <div className="mt-3 rounded-2xl border border-white/70 bg-white/60 px-3 py-2 text-xs text-foreground/70">
      <p className="text-xs font-semibold text-foreground/70">Sources</p>
      <div className="mt-2 space-y-2">
        {sources.map((source, index) => (
          <div key={`${source.id}-${index}`} className="text-xs text-foreground/60">
            <p className="font-semibold text-foreground">{source.title}</p>
            <p className="text-foreground/60">{source.snippet}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
