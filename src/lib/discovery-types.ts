export type AnswerValue = "yes" | "probably" | "not_sure" | "probably_not" | "no";

export type QuestionScope = "global" | `game:${string}`;

export type TraitValue = string | number | boolean | string[] | number[] | null;

export type TraitGroup = Record<string, TraitValue>;

export type DiscoveryCharacter = {
  id: string;
  name: string;
  aliases: string[];
  gameId: string;
  franchise: string;
  summary: string;
  color: string;
  discoveryEligible?: boolean;
  global: TraitGroup;
  hsr: TraitGroup;
  evidence: EvidenceRecord[];
};

export type GameRecord = {
  id: string;
  name: string;
  franchise: string;
  genre: string[];
  sourceType: string;
  visualStyle: string[];
  traitNamespaces: string[];
};

export type EvidenceRecord = {
  field: string;
  source: string;
  confidence: "high" | "medium" | "low";
  notes: string;
};

export type DiscoveryQuestion = {
  id: string;
  text: string;
  scope: QuestionScope;
  traitPath: string;
  expectedValue: string | number | boolean;
  category: "identity" | "visual" | "gameplay" | "story" | "media" | "fanbase";
  weight: number;
};

export type AnswerRecord = {
  questionId: string;
  answer: AnswerValue;
};

export type CorrectionSuggestion =
  | {
      type: "answer_mismatch";
      questionId: string;
    }
  | {
      type: "missing_question";
      questionId: string;
    }
  | {
      type: "confused_pair";
      guessedCharacterId: string;
      correctCharacterId: string;
    };

export type CorrectionFeedbackRecord = {
  id: string;
  createdAt: string;
  guessedCharacterId: string;
  correctCharacterId: string;
  answers: AnswerRecord[];
  topCandidates: {
    characterId: string;
    confidence: number;
  }[];
  notes: string;
  suggestions: CorrectionSuggestion[];
};

export type CharacterScore = {
  character: DiscoveryCharacter;
  score: number;
  confidence: number;
  matched: MatchedTrait[];
  contradicted: MatchedTrait[];
};

export type MatchedTrait = {
  question: DiscoveryQuestion;
  answer: AnswerValue;
  impact: number;
};

export type DiscoveryState = {
  scores: CharacterScore[];
  nextQuestion: DiscoveryQuestion | null;
  likelyGameId: string | null;
  shouldGuess: boolean;
  questionCount: number;
};
