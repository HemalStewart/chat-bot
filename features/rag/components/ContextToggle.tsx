export type ContextToggleProps = {
  enabled: boolean;
  onToggle: () => void;
  count: number;
};

export const ContextToggle = ({ enabled, onToggle, count }: ContextToggleProps) => {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`liquid-hover inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold transition-spring ${
        enabled
          ? "border-blue-400/70 bg-blue-500 text-white"
          : "border-white/70 bg-white/60 text-foreground/70"
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      Context {enabled ? "On" : "Off"}
      <span className="text-[11px] opacity-70">{count}</span>
    </button>
  );
};
