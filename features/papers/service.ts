import type { PastPaper, PastPaperQuestion, MarkingScheme } from "@/features/papers/types";

const fetchJson = async <T>(url: string): Promise<T> => {
  const response = await fetch(url);
  const data = (await response.json()) as T;
  if (!response.ok) {
    throw new Error("Failed to load data.");
  }
  return data;
};

export const searchPastPapers = async (query: string): Promise<PastPaper[]> => {
  const data = await fetchJson<{ papers: PastPaper[] }>("/api/papers");
  const normalized = query.trim().toLowerCase();
  if (!normalized) return data.papers;

  return data.papers.filter((paper) =>
    [paper.title, paper.subject, String(paper.year)].some((value) =>
      value.toLowerCase().includes(normalized)
    )
  );
};

export const getQuestionsForPaper = async (paperId: string): Promise<PastPaperQuestion[]> => {
  const data = await fetchJson<{ questions: PastPaperQuestion[] }>(
    `/api/papers/${paperId}/questions`
  );
  return data.questions;
};

export const getMarkingScheme = async (questionId: string): Promise<MarkingScheme | null> => {
  const data = await fetchJson<{ scheme: MarkingScheme | null }>(
    `/api/papers/questions/${questionId}/scheme`
  );
  return data.scheme ?? null;
};
