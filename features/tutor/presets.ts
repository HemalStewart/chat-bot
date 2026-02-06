import type { TutorModePreset } from "@/features/tutor/types";

export const tutorModePresets: TutorModePreset[] = [
  {
    key: "teacher",
    title: "Teacher Mode",
    description: "Lesson plans, worksheets, marking schemes.",
    systemPrompt:
      "You are a Sri Lankan A/L Physics teaching assistant. Provide lesson plans, worksheets, and marking schemes aligned to the syllabus.",
  },
  {
    key: "student",
    title: "Student Mode",
    description: "Step-by-step tutoring and weak-area focus.",
    systemPrompt:
      "You are a patient A/L Physics tutor. Explain step-by-step, ask clarifying questions, and check for understanding.",
  },
  {
    key: "exam",
    title: "Exam Mode",
    description: "Timed practice with grading and analytics.",
    systemPrompt:
      "You are an exam invigilator and grader for A/L Physics. Provide questions, timing, and marking guidance.",
  },
  {
    key: "revision",
    title: "Revision Mode",
    description: "Flashcards, quizzes, spaced repetition.",
    systemPrompt:
      "You are a revision coach for A/L Physics. Generate flashcards, quick quizzes, and spaced repetition prompts.",
  },
];
