"use client";

import { useEffect, useMemo, useState } from "react";
import type { RagSource } from "@/features/rag/types";

export type ContextDoc = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
};

const upsertDocAtTop = (current: ContextDoc[], next: ContextDoc) => [
  next,
  ...current.filter((doc) => doc.id !== next.id),
];

const fetchJson = async <T>(url: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(url, init);
  const text = await response.text();

  if (!response.ok) {
    throw new Error("Request failed.");
  }

  if (!text) {
    return {} as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return {} as T;
  }
};

export const useContextStore = () => {
  const [docs, setDocs] = useState<ContextDoc[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const data = await fetchJson<{ docs: ContextDoc[] }>("/api/context");
        if (!active) return;
        setDocs(data.docs ?? []);
      } catch (error) {
        // Ignore load errors for now.
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  const addDoc = async (title: string, content: string) => {
    const trimmed = content.trim();
    if (!trimmed) return undefined;

    const data = await fetchJson<{ doc: ContextDoc }>("/api/context", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content: trimmed }),
    });

    setDocs((current) => upsertDocAtTop(current, data.doc));
    return data.doc;
  };

  const uploadPdf = async (
    file: File,
    options?: { useOcr?: boolean; lang?: string }
  ) => {
    if (!file) return undefined;
    setUploading(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("ocr", String(Boolean(options?.useOcr)));
      if (options?.lang) {
        formData.append("lang", options.lang);
      }
      const response = await fetch("/api/context/upload", {
        method: "POST",
        body: formData,
      });
      const data = (await response.json()) as { doc?: ContextDoc; error?: string };
      if (!response.ok || !data.doc) {
        throw new Error(data.error ?? "PDF upload failed.");
      }
      setDocs((current) => upsertDocAtTop(current, data.doc!));
      return data.doc;
    } catch (error) {
      const message = error instanceof Error ? error.message : "PDF upload failed.";
      setUploadError(message);
      return undefined;
    } finally {
      setUploading(false);
    }
  };

  const removeDoc = async (id: string) => {
    try {
      await fetchJson<{ ok: boolean }>(`/api/context/${id}`, {
        method: "DELETE",
      });
    } catch (error) {
      // Ignore delete errors and update local state.
    }
    setDocs((current) => current.filter((doc) => doc.id !== id));
  };

  const clearDocs = async () => {
    await fetchJson<{ ok: boolean }>("/api/context", { method: "DELETE" });
    setDocs([]);
  };

  const sources = useMemo<RagSource[]>(
    () =>
      docs.map((doc) => ({
        id: doc.id,
        title: doc.title,
        snippet: doc.content.slice(0, 240),
      })),
    [docs]
  );

  return {
    docs,
    sources,
    addDoc,
    removeDoc,
    clearDocs,
    uploadPdf,
    uploading,
    uploadError,
  };
};
