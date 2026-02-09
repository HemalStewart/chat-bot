"use client";

import { useEffect, useMemo, useState } from "react";
import type { PastPaper, PastPaperQuestion, MarkingScheme } from "@/features/papers/types";
import { getMarkingScheme, getQuestionsForPaper, searchPastPapers } from "@/features/papers/service";

export type PastPaperPanelProps = {
  onSendToChat?: (prompt: string, context?: { title: string; content: string }) => void;
};

export const PastPaperPanel = ({ onSendToChat }: PastPaperPanelProps) => {
  const [query, setQuery] = useState("");
  const [papers, setPapers] = useState<PastPaper[]>([]);
  const [selectedPaper, setSelectedPaper] = useState<PastPaper | null>(null);
  const [paperPickerOpen, setPaperPickerOpen] = useState(false);
  const [questions, setQuestions] = useState<PastPaperQuestion[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<PastPaperQuestion | null>(null);
  const [scheme, setScheme] = useState<MarkingScheme | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const results = await searchPastPapers(query);
      if (!active) return;
      setPapers(results);
      if (results.length > 0 && (!selectedPaper || !results.find((p) => p.id === selectedPaper.id))) {
        setSelectedPaper(results[0]);
        setPaperPickerOpen(false);
      }
      if (results.length === 0) {
        setPaperPickerOpen(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [query]);

  useEffect(() => {
    let active = true;
    const loadQuestions = async () => {
      if (!selectedPaper) {
        setQuestions([]);
        return;
      }
      const data = await getQuestionsForPaper(selectedPaper.id);
      if (!active) return;
      setQuestions(data);
      setSelectedQuestion(data[0] ?? null);
    };
    loadQuestions();
    return () => {
      active = false;
    };
  }, [selectedPaper]);

  useEffect(() => {
    let active = true;
    const loadScheme = async () => {
      if (!selectedQuestion) {
        setScheme(null);
        return;
      }
      const data = await getMarkingScheme(selectedQuestion.id);
      if (!active) return;
      setScheme(data);
    };
    loadScheme();
    return () => {
      active = false;
    };
  }, [selectedQuestion]);

  const paperMeta = useMemo(() => {
    if (!selectedPaper) return "";
    return `${selectedPaper.subject} · ${selectedPaper.year} · ${selectedPaper.title}`;
  }, [selectedPaper]);

  return (
    <div className="glass-panel flex h-full flex-col gap-4 overflow-y-auto rounded-3xl p-5">
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-foreground">Past Papers</h3>
        <p className="text-xs text-foreground/60">
          Search papers and open marking schemes. Sample data is included for now.
        </p>
      </div>

      <input
        className="w-full rounded-2xl border border-white/70 bg-white/70 px-3 py-2 text-xs text-foreground/80 outline-none focus:border-blue-400/60 focus:ring-2 focus:ring-blue-500/30"
        placeholder="Search by year, topic, or title"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />

      <div className="flex h-full flex-col gap-3">
        <div className="rounded-2xl border border-white/70 bg-white/60 p-3 text-xs text-foreground/70">
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-foreground/50">
            Active Paper
          </p>
          <p className="mt-1 text-sm font-semibold text-foreground">
            {paperMeta || "Select a paper"}
          </p>
          <div className="mt-3">
            <button
              type="button"
              onClick={() => setPaperPickerOpen((prev) => !prev)}
              className="flex w-full items-center justify-between rounded-2xl border border-white/70 bg-white/70 px-3 py-2 text-xs font-semibold text-foreground/80 transition-spring hover:border-blue-400/60"
            >
              <span>{selectedPaper ? `${selectedPaper.year} · ${selectedPaper.title}` : "Select a paper"}</span>
              <span className="text-[11px] text-foreground/50">{paperPickerOpen ? "▲" : "▼"}</span>
            </button>
            {paperPickerOpen && (
              <div className="mt-2 max-h-[220px] overflow-y-auto rounded-2xl border border-white/70 bg-white/70 p-2">
                {papers.length === 0 && (
                  <p className="px-2 py-2 text-xs text-foreground/50">No papers found.</p>
                )}
                {papers.map((paper) => (
                  <button
                    key={paper.id}
                    type="button"
                    onClick={() => {
                      setSelectedPaper(paper);
                      setPaperPickerOpen(false);
                    }}
                    className={`w-full rounded-xl border px-3 py-2 text-left text-xs transition-spring ${
                      selectedPaper?.id === paper.id
                        ? "border-blue-400/70 bg-blue-500 text-white"
                        : "border-white/70 bg-white/70 text-foreground/70"
                    }`}
                  >
                    <p className="text-sm font-semibold">{paper.year} · {paper.title}</p>
                    <p className="text-xs opacity-70">{paper.subject}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-3 rounded-2xl border border-white/70 bg-white/60 p-3">
          <div className="flex-1 space-y-2">
            {questions.map((question) => (
              <button
                key={question.id}
                type="button"
                onClick={() => setSelectedQuestion(question)}
                className={`w-full rounded-xl border px-3 py-2 text-left text-xs transition-spring ${
                  selectedQuestion?.id === question.id
                    ? "border-blue-400/70 bg-blue-500 text-white"
                    : "border-white/70 bg-white/70 text-foreground/70"
                }`}
              >
                <p className="text-sm font-semibold">Q{question.number}</p>
                <p className="text-xs opacity-70 line-clamp-2">{question.prompt}</p>
              </button>
            ))}
          </div>
          {selectedQuestion && (
            <div className="rounded-2xl border border-white/70 bg-white/80 p-3 text-xs text-foreground/70">
              <p className="text-sm font-semibold text-foreground">Question</p>
              <p className="mt-1 text-xs text-foreground/70">{selectedQuestion.prompt}</p>
              {scheme && (
                <div className="mt-3">
                  <p className="text-xs font-semibold text-foreground/70">
                    Marking scheme · {scheme.marks} marks
                  </p>
                  <p className="mt-1 text-xs text-foreground/70">{scheme.scheme}</p>
                </div>
              )}
              {onSendToChat && (
                <button
                  type="button"
                  onClick={() => {
                    const contextContent = [
                      `Question: ${selectedQuestion.prompt}`,
                      scheme ? `Marking Scheme: ${scheme.scheme}` : null,
                    ]
                      .filter(Boolean)
                      .join("\n\n");

                    onSendToChat(
                      `Explain and solve Q${selectedQuestion.number} from ${paperMeta}. Include key steps and marks allocation.`,
                      {
                        title: `${paperMeta} · Q${selectedQuestion.number}`,
                        content: contextContent,
                      }
                    );
                  }}
                  className="mt-4 w-full rounded-2xl bg-blue-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-600"
                >
                  Send to Chat + Add Context
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
