import type { PastPaper, PastPaperQuestion, MarkingScheme } from "@/features/papers/types";

export const searchPastPapers = async (_query: string): Promise<PastPaper[]> => {
  return [];
};

export const getQuestionsForPaper = async (_paperId: string): Promise<PastPaperQuestion[]> => {
  return [];
};

export const getMarkingScheme = async (_questionId: string): Promise<MarkingScheme | null> => {
  return null;
};
