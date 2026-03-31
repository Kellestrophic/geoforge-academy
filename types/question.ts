export type QuestionModeType = "multiple_choice" | "match" | "image" | "formula";

export type Question = {
  id: string;
  type: QuestionModeType;
category: string;
subcategory?: string[];
  topic: string;
  question: string;
  matchPairs?: { term: string; match: string }[];
  choices: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
  examRelevant: boolean;
  verifiedStatus: "verified" | "reviewed" | "unverified";
  source?: string;
  image?: string | null;
};