export type ResponseLanguage = "english" | "sinhala" | "tamil";

const labels: Record<ResponseLanguage, string> = {
  english: "English",
  sinhala: "සිංහල",
  tamil: "தமிழ்",
};

export const LanguageToggle = ({
  value,
  onChange,
}: {
  value: ResponseLanguage;
  onChange: (value: ResponseLanguage) => void;
}) => {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/60 p-1 text-[11px] font-semibold text-foreground/60">
      {Object.entries(labels).map(([key, label]) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key as ResponseLanguage)}
          className={`rounded-full px-3 py-1 transition-spring ${
            value === key ? "bg-blue-500 text-white" : "text-foreground/60"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
};
