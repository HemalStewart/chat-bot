export type PastPaper = {
  id: string;
  year: number;
  subject: string;
  title: string;
  source?: string;
};

export type PastPaperQuestion = {
  id: string;
  paperId: string;
  number: string;
  prompt: string;
  topics?: string[];
};

export type MarkingScheme = {
  id: string;
  questionId: string;
  scheme: string;
  marks: number;
};
