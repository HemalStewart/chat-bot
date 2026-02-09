export type ContextScopeToggleProps = {
  scope: "focused" | "all";
  onChange: (value: "focused" | "all") => void;
};

export const ContextScopeToggle = ({ scope, onChange }: ContextScopeToggleProps) => {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/60 p-1 text-[11px] font-semibold text-foreground/60">
      <button
        type="button"
        onClick={() => onChange("focused")}
        className={`rounded-full px-3 py-1 transition-spring ${
          scope === "focused" ? "bg-blue-500 text-white" : "text-foreground/60"
        }`}
      >
        Latest
      </button>
      <button
        type="button"
        onClick={() => onChange("all")}
        className={`rounded-full px-3 py-1 transition-spring ${
          scope === "all" ? "bg-blue-500 text-white" : "text-foreground/60"
        }`}
      >
        All Sources
      </button>
    </div>
  );
};
