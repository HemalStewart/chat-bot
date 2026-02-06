export type TutorModeKey = "teacher" | "student" | "exam" | "revision";

export type TutorModePreset = {
  key: TutorModeKey;
  title: string;
  description: string;
  systemPrompt: string;
};
