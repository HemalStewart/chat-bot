import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import type { ContextDoc } from "@/features/rag/store";
import type { ResponseLanguage } from "@/features/chat/components/LanguageToggle";

export type ContextPanelProps = {
  docs: ContextDoc[];
  onAdd: (title: string, content: string) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
  onUploadPdf: (file: File, options: { useOcr: boolean; lang: string }) => Promise<ContextDoc | undefined>;
  uploading: boolean;
  uploadError: string | null;
  responseLanguage: ResponseLanguage;
};

export const ContextPanel = ({
  docs,
  onAdd,
  onRemove,
  onClear,
  onUploadPdf,
  uploading,
  uploadError,
  responseLanguage,
}: ContextPanelProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [useOcr, setUseOcr] = useState(true);

  const ocrLang = useMemo(() => {
    if (responseLanguage === "sinhala") return "sin";
    if (responseLanguage === "tamil") return "tam";
    return "eng";
  }, [responseLanguage]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const title = String(formData.get("title") ?? "");
    const content = String(formData.get("content") ?? "");
    onAdd(title, content);
    form.reset();
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    await onUploadPdf(selectedFile, { useOcr, lang: ocrLang });
    setSelectedFile(null);
  };

  return (
    <div className="glass-panel flex flex-col gap-4 rounded-3xl p-5">
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-foreground">Context Library</h3>
        <p className="text-xs text-foreground/60">
          Paste notes, page extracts, or PDF chunks to ground the AI.
        </p>
      </div>

      <form className="space-y-3" onSubmit={handleSubmit}>
        <input
          name="title"
          className="w-full rounded-2xl border border-white/70 bg-white/70 px-3 py-2 text-xs text-foreground/80 outline-none focus:border-blue-400/60 focus:ring-2 focus:ring-blue-500/30"
          placeholder="Source title"
        />
        <textarea
          name="content"
          className="min-h-[100px] w-full rounded-2xl border border-white/70 bg-white/70 px-3 py-2 text-xs text-foreground/80 outline-none focus:border-blue-400/60 focus:ring-2 focus:ring-blue-500/30"
          placeholder="Paste a section from a lesson, paper, or textbook"
        />
        <button
          type="submit"
          className="liquid-hover rounded-2xl bg-blue-500 px-4 py-2 text-xs font-semibold text-white"
        >
          Add source
        </button>
      </form>

      <div className="rounded-2xl border border-white/70 bg-white/60 p-3 text-xs text-foreground/70">
        <p className="text-xs font-semibold text-foreground/70">Upload PDF</p>
        <p className="mt-1 text-[11px] text-foreground/50">
          Extracts text and stores it in the context library.
        </p>
        <div className="mt-3 flex flex-col gap-2">
          <input
            type="file"
            accept="application/pdf"
            onChange={(event) => {
              const file = event.target.files?.[0] ?? null;
              setSelectedFile(file);
            }}
            className="text-xs"
          />
          <label className="flex items-center gap-2 text-[11px] text-foreground/60">
            <input
              type="checkbox"
              checked={useOcr}
              onChange={(event) => setUseOcr(event.target.checked)}
            />
            Use OCR for scanned PDFs (language: {ocrLang})
          </label>
          <button
            type="button"
            disabled={!selectedFile || uploading}
            onClick={handleUpload}
            className="liquid-hover rounded-2xl bg-blue-500 px-4 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {uploading ? "Uploading..." : "Upload PDF"}
          </button>
          {uploadError && <p className="text-[11px] text-rose-500">{uploadError}</p>}
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-foreground/60">
        <span>{docs.length} sources</span>
        <button type="button" className="text-foreground/50 hover:text-foreground" onClick={onClear}>
          Clear all
        </button>
      </div>

      <div className="space-y-2">
        {docs.map((doc) => (
          <div
            key={doc.id}
            className="rounded-2xl border border-white/70 bg-white/60 px-3 py-2 text-xs text-foreground/70"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">{doc.title}</p>
              <button
                type="button"
                className="text-foreground/50 hover:text-foreground"
                onClick={() => onRemove(doc.id)}
              >
                Remove
              </button>
            </div>
            <p className="mt-1 line-clamp-3 text-xs text-foreground/60">{doc.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
