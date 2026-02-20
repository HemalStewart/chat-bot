import { useMemo, useRef } from "react";
import type { ChangeEvent } from "react";
import type { ContextDoc } from "@/features/rag/store";
import type { ResponseLanguage } from "@/features/chat/components/LanguageToggle";

export type UploadPdfPanelProps = {
  docs: ContextDoc[];
  onUploadPdf: (file: File, options: { useOcr: boolean; lang: string }) => Promise<ContextDoc | undefined>;
  onUploadComplete?: (doc: ContextDoc) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
  uploading: boolean;
  uploadError: string | null;
  responseLanguage: ResponseLanguage;
};

export const UploadPdfPanel = ({
  docs,
  onUploadPdf,
  onUploadComplete,
  onRemove,
  onClear,
  uploading,
  uploadError,
  responseLanguage,
}: UploadPdfPanelProps) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const ocrLang = useMemo(() => {
    if (responseLanguage === "sinhala") return "sin";
    if (responseLanguage === "tamil") return "tam";
    return "eng";
  }, [responseLanguage]);

  const openFilePicker = () => fileInputRef.current?.click();

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const doc = await onUploadPdf(file, { useOcr: true, lang: ocrLang });
    if (doc) {
      onUploadComplete?.(doc);
    }
    event.target.value = "";
  };

  return (
    <div className="glass-panel rounded-3xl p-5">
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-foreground">Knowledge</h3>
        <p className="text-xs text-foreground/60">Upload PDF and it is auto-used in chat.</p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={handleFileChange}
      />

      <button
        type="button"
        onClick={openFilePicker}
        disabled={uploading}
        className="mt-3 flex w-full items-center justify-center rounded-2xl border border-dashed border-blue-300 bg-blue-500/10 px-4 py-4 text-sm font-semibold text-blue-700 transition-spring hover:bg-blue-500/15 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {uploading ? "Uploading PDF..." : "Upload PDF"}
      </button>

      {uploadError && (
        <p className="mt-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] text-rose-600">
          {uploadError}
        </p>
      )}

      <div className="mt-3 flex items-center justify-between text-xs text-foreground/60">
        <span>{docs.length} source{docs.length === 1 ? "" : "s"}</span>
        {docs.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="text-foreground/60 transition hover:text-foreground"
          >
            Clear all
          </button>
        )}
      </div>

      {docs.length > 0 && (
        <div className="mt-2 space-y-2">
          {docs.slice(0, 5).map((doc) => (
            <div
              key={doc.id}
              className="rounded-2xl border border-white/70 bg-white/60 px-3 py-2 text-xs text-foreground/70"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="truncate font-semibold text-foreground">{doc.title}</p>
                <button
                  type="button"
                  onClick={() => onRemove(doc.id)}
                  className="text-foreground/50 transition hover:text-foreground"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
