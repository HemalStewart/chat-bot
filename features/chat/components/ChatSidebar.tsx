import type { Provider } from "@/features/chat/types";
import { providerOptions } from "@/features/chat/constants";
import type { TutorModePreset } from "@/features/tutor/types";

export type BuildFocus = {
  title: string;
  detail: string;
};

export type ChatSidebarProps = {
  provider: Provider;
  onProviderChange: (provider: Provider) => void;
  model: string;
  onModelChange: (model: string) => void;
  systemPrompt: string;
  onSystemPromptChange: (value: string) => void;
  temperature: number;
  onTemperatureChange: (value: number) => void;
  maxTokens: number;
  onMaxTokensChange: (value: number) => void;
  onClearSession: () => void;
  tutorModes: TutorModePreset[];
  selectedTutorMode: TutorModePreset | null;
  onTutorModeSelect: (mode: TutorModePreset) => void;
  buildFocus: BuildFocus;
  roadmapHighlights: string[];
};

export const ChatSidebar = ({
  provider,
  onProviderChange,
  model,
  onModelChange,
  systemPrompt,
  onSystemPromptChange,
  temperature,
  onTemperatureChange,
  maxTokens,
  onMaxTokensChange,
  onClearSession,
  tutorModes,
  selectedTutorMode,
  onTutorModeSelect,
  buildFocus,
  roadmapHighlights,
}: ChatSidebarProps) => {
  return (
    <aside className="glass-panel flex h-full flex-col gap-6 overflow-y-auto rounded-3xl p-5">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-foreground">Session</h2>
        <p className="text-xs text-foreground/60">
          Configure routing and learning mode before sending prompts.
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-[11px] font-semibold uppercase tracking-[0.3em] text-foreground/50">
          Provider
        </label>
        <div className="grid gap-2">
          {providerOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => onProviderChange(option.id)}
              className={`liquid-hover flex items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm transition-spring ${
                provider === option.id
                  ? "border-blue-400/70 bg-blue-500 text-white"
                  : "border-white/70 bg-white/60 text-foreground/70 hover:text-foreground"
              }`}
            >
              <span className="font-semibold">{option.label}</span>
              <span className="text-xs opacity-70">{option.hint}</span>
            </button>
          ))}
        </div>
      </div>

      <details className="rounded-2xl border border-white/70 bg-white/60 p-4">
        <summary className="cursor-pointer list-none text-sm font-semibold text-foreground">
          Advanced settings
        </summary>
        <p className="mt-2 text-xs text-foreground/60">
          Keep defaults unless you need custom routing or prompt control.
        </p>
        <div className="mt-4 space-y-4">
          <div className="space-y-2">
            <label className="text-[11px] font-semibold uppercase tracking-[0.3em] text-foreground/50">
              Model
            </label>
            <input
              className="w-full rounded-2xl border border-white/70 bg-white/70 px-4 py-3 text-sm text-foreground/80 outline-none transition-smooth focus:border-blue-400/60 focus:ring-2 focus:ring-blue-500/30"
              value={model}
              onChange={(event) => onModelChange(event.target.value)}
              placeholder="Model id"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-semibold uppercase tracking-[0.3em] text-foreground/50">
              System Prompt
            </label>
            <textarea
              className="min-h-[120px] w-full rounded-2xl border border-white/70 bg-white/70 px-4 py-3 text-sm text-foreground/80 outline-none transition-smooth focus:border-blue-400/60 focus:ring-2 focus:ring-blue-500/30"
              placeholder="Optional instructions (e.g., align to A/L Physics syllabus)"
              value={systemPrompt}
              onChange={(event) => onSystemPromptChange(event.target.value)}
            />
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.3em] text-foreground/50">
                Temperature
                <span className="text-xs font-medium text-foreground/60">
                  {temperature.toFixed(1)}
                </span>
              </label>
              <input
                className="w-full"
                type="range"
                min={0}
                max={1.2}
                step={0.1}
                value={temperature}
                onChange={(event) => onTemperatureChange(Number(event.target.value))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-semibold uppercase tracking-[0.3em] text-foreground/50">
                Max Tokens
              </label>
              <input
                type="number"
                min={64}
                max={4096}
                step={64}
                value={maxTokens}
                onChange={(event) => onMaxTokensChange(Number(event.target.value))}
                className="w-full rounded-2xl border border-white/70 bg-white/70 px-4 py-3 text-sm text-foreground/80 outline-none transition-smooth focus:border-blue-400/60 focus:ring-2 focus:ring-blue-500/30"
              />
            </div>
          </div>
        </div>
      </details>

      <div className="flex flex-col gap-3">
        <button
          type="button"
          className="liquid-hover rounded-2xl border border-white/70 bg-white/60 px-4 py-3 text-sm font-semibold text-foreground/70 transition-spring"
          onClick={onClearSession}
        >
          Clear session
        </button>
        <p className="text-xs text-foreground/50">
          Add your API keys in `.env.local` before sending a prompt.
        </p>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Tutor Modes</h3>
        <div className="space-y-2">
          {tutorModes.map((mode) => (
            <button
              key={mode.title}
              type="button"
              onClick={() => onTutorModeSelect(mode)}
              className={`liquid-hover w-full rounded-2xl border px-3 py-2 text-left text-xs transition-spring ${
                selectedTutorMode?.key === mode.key
                  ? "border-blue-400/70 bg-blue-500 text-white"
                  : "border-white/70 bg-white/60 text-foreground/70"
              }`}
            >
              <p className="text-sm font-semibold">{mode.title}</p>
              <p className="text-xs opacity-70">{mode.description}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Build Focus</h3>
        <div className="rounded-2xl border border-white/70 bg-white/60 px-3 py-3 text-xs text-foreground/70">
          <p className="text-sm font-semibold text-foreground">{buildFocus.title}</p>
          <p className="text-xs text-foreground/60">{buildFocus.detail}</p>
        </div>
        <div className="space-y-2">
          {roadmapHighlights.map((item) => (
            <div
              key={item}
              className="rounded-xl border border-white/70 bg-white/60 px-3 py-2 text-xs text-foreground/60"
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};
