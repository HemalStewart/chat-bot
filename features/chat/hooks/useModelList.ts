"use client";

import { useEffect, useState } from "react";
import type { Provider } from "@/features/chat/types";

export type ModelOption = {
  id: string;
  label?: string;
};

type ModelResponse = {
  models: ModelOption[];
};

export const useModelList = (provider: Provider) => {
  const [models, setModels] = useState<ModelOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const fetchModels = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/models?provider=${provider}`);
        const data = (await response.json()) as ModelResponse | { error?: string };

        if (!response.ok) {
          throw new Error("error" in data && data.error ? data.error : "Failed to load models.");
        }

        if (!active) return;
        setModels((data as ModelResponse).models ?? []);
      } catch (err) {
        if (!active) return;
        const message = err instanceof Error ? err.message : "Failed to load models.";
        setError(message);
      } finally {
        if (!active) return;
        setIsLoading(false);
      }
    };

    fetchModels();

    return () => {
      active = false;
    };
  }, [provider]);

  return { models, isLoading, error };
};
