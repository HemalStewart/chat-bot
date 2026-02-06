import type { ReactNode } from "react";

const statusStyles: Record<"idle" | "loading", string> = {
  idle: "border-emerald-200/60 bg-emerald-500/10 text-emerald-700",
  loading: "border-blue-200/60 bg-blue-500/10 text-blue-700",
};

export type AppHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  isLoading: boolean;
  providerHint: string;
  latencyMs: number | null;
  trailing?: ReactNode;
};

export const AppHeader = ({
  eyebrow,
  title,
  description,
  isLoading,
  providerHint,
  latencyMs,
  trailing,
}: AppHeaderProps) => {
  return (
    <header className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
      <div className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-foreground/40">
          {eyebrow}
        </p>
        <h1 className="text-3xl font-semibold text-foreground lg:text-4xl">{title}</h1>
        <p className="max-w-2xl text-sm text-foreground/60">{description}</p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <span
          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${
            isLoading ? statusStyles.loading : statusStyles.idle
          }`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          {isLoading ? "Thinking" : "Idle"}
        </span>
        <span className="rounded-full border border-white/70 bg-white/70 px-3 py-1 text-xs font-semibold text-foreground/70">
          {providerHint} Route
        </span>
        {latencyMs !== null && (
          <span className="text-xs font-medium text-foreground/50">Last: {latencyMs} ms</span>
        )}
        {trailing}
      </div>
    </header>
  );
};
