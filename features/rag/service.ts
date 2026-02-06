import type { RagQuery, RagResult } from "@/features/rag/types";

export const runRagQuery = async (_query: RagQuery): Promise<RagResult> => {
  throw new Error("RAG pipeline is not implemented yet.");
};
