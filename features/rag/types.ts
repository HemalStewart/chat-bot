export type RagSource = {
  id: string;
  title: string;
  uri?: string;
  snippet: string;
};

export type RagQuery = {
  query: string;
  scope: "page" | "library";
  topK?: number;
};

export type RagResult = {
  answer: string;
  sources: RagSource[];
};
