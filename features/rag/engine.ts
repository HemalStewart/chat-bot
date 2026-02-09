import type { RagQuery, RagResult, RagSource } from "@/features/rag/types";
import type { ContextDoc } from "@/features/rag/store";

const tokenize = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

const scoreChunk = (queryTokens: string[], chunkTokens: string[]) => {
  const chunkSet = new Set(chunkTokens);
  let score = 0;
  for (const token of queryTokens) {
    if (chunkSet.has(token)) score += 1;
  }
  return score;
};

const chunkText = (text: string, size = 800, overlap = 120) => {
  const chunks: string[] = [];
  let index = 0;
  while (index < text.length) {
    const chunk = text.slice(index, index + size).trim();
    if (chunk) chunks.push(chunk);
    index += size - overlap;
  }
  return chunks;
};

export const runLocalRag = (docs: ContextDoc[], query: RagQuery): RagResult => {
  const queryTokens = tokenize(query.query);
  const scored: Array<{ score: number; chunk: string; doc: ContextDoc }> = [];

  for (const doc of docs) {
    const chunks = chunkText(doc.content);
    for (const chunk of chunks) {
      const score = scoreChunk(queryTokens, tokenize(chunk));
      if (score > 0) {
        scored.push({ score, chunk, doc });
      }
    }
  }

  scored.sort((a, b) => b.score - a.score);
  const top = scored.slice(0, query.topK ?? 4);

  const sources: RagSource[] = top.map((item, index) => ({
    id: item.doc.id,
    title: item.doc.title,
    snippet: item.chunk.slice(0, 260),
  }));

  const combined = top.map((item, index) => `Source ${index + 1}: ${item.chunk}`).join("\n\n");
  const answer = combined
    ? [
        "You MUST answer using ONLY the context below.",
        "Do NOT say you lack access to papers or sources.",
        "If the context is insufficient, ask the user to add more sources.",
        "Provide a clear, step-by-step solution with headings and bullet points.",
        "Keep units and show final answers clearly.",
        "",
        combined,
      ].join("\n")
    : "No context matched. Ask the user to add more sources.";

  return { answer, sources };
};
