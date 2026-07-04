import type {
  AnswerRecord,
  CorrectionFeedbackRecord,
  CorrectionSuggestion,
  DiscoveryCharacter,
  DiscoveryQuestion
} from "@/lib/discovery-types";
import { traitMatches } from "@/lib/discovery-engine";
import { getCharacterTranslation } from "@/lib/i18n";

export const correctionStorageKey = "character-discovery-corrections:v1";

export type CharacterNameMatch = {
  character: DiscoveryCharacter;
  matchedLabel: string;
};

type CorrectionInput = {
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

export function normalizeCharacterName(value: string) {
  return value
    .normalize("NFKC")
    .trim()
    .toLocaleLowerCase()
    .replace(/[\s"'`’‘“”._:;,\-–—/\\|()[\]{}<>《》「」『』（）【】·・]+/g, "");
}

export function buildCharacterNameIndex(characters: DiscoveryCharacter[]) {
  const exact = new Map<string, DiscoveryCharacter>();
  const labels: CharacterNameMatch[] = [];

  for (const character of characters) {
    const characterLabels = new Set<string>([
      character.id,
      character.id.replaceAll("-", " "),
      character.name,
      ...character.aliases
    ]);
    const zhName = getCharacterTranslation(character.id, "zh")?.name;
    if (zhName) {
      characterLabels.add(zhName);
    }

    for (const label of characterLabels) {
      const normalized = normalizeCharacterName(label);
      if (!normalized) {
        continue;
      }
      if (!exact.has(normalized)) {
        exact.set(normalized, character);
      }
      labels.push({ character, matchedLabel: label });
    }
  }

  return { exact, labels };
}

export function resolveCharacterId(input: string, characters: DiscoveryCharacter[]) {
  const normalized = normalizeCharacterName(input);
  if (!normalized) {
    return null;
  }
  return buildCharacterNameIndex(characters).exact.get(normalized)?.id ?? null;
}

export function getCharacterNameSuggestions(input: string, characters: DiscoveryCharacter[], limit = 6) {
  const normalized = normalizeCharacterName(input);
  if (!normalized) {
    return [];
  }

  const index = buildCharacterNameIndex(characters);
  const seen = new Set<string>();
  const matches: CharacterNameMatch[] = [];

  const exact = index.exact.get(normalized);
  if (exact) {
    seen.add(exact.id);
    matches.push({ character: exact, matchedLabel: input });
  }

  for (const candidate of index.labels) {
    if (seen.has(candidate.character.id)) {
      continue;
    }
    const label = normalizeCharacterName(candidate.matchedLabel);
    if (label.includes(normalized) || normalized.includes(label)) {
      seen.add(candidate.character.id);
      matches.push(candidate);
    }
    if (matches.length >= limit) {
      break;
    }
  }

  return matches;
}

export function loadCorrectionFeedback() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(correctionStorageKey);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CorrectionFeedbackRecord[]) : [];
  } catch {
    return [];
  }
}

export function saveCorrectionFeedback(input: CorrectionInput) {
  const records = loadCorrectionFeedback();
  const record: CorrectionFeedbackRecord = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    ...input
  };

  window.localStorage.setItem(correctionStorageKey, JSON.stringify([record, ...records]));
  return record;
}

export function buildCorrectionSuggestions({
  guessedCharacter,
  correctCharacter,
  answers,
  questions
}: {
  guessedCharacter: DiscoveryCharacter;
  correctCharacter: DiscoveryCharacter;
  answers: AnswerRecord[];
  questions: DiscoveryQuestion[];
}) {
  const suggestions: CorrectionSuggestion[] = [
    {
      type: "confused_pair",
      guessedCharacterId: guessedCharacter.id,
      correctCharacterId: correctCharacter.id
    }
  ];

  for (const answer of answers) {
    const question = questions.find((candidate) => candidate.id === answer.questionId);
    if (!question) {
      continue;
    }
    const correctMatches = traitMatches(correctCharacter, question);
    const positiveAnswer = answer.answer === "yes" || answer.answer === "probably";
    const negativeAnswer = answer.answer === "no" || answer.answer === "probably_not";
    if ((positiveAnswer && !correctMatches) || (negativeAnswer && correctMatches)) {
      suggestions.push({ type: "answer_mismatch", questionId: question.id });
    }
    if (suggestions.length >= 3) {
      return suggestions;
    }
  }

  const askedQuestionIds = new Set(answers.map((answer) => answer.questionId));
  for (const question of questions) {
    if (askedQuestionIds.has(question.id)) {
      continue;
    }
    if (traitMatches(correctCharacter, question) && !traitMatches(guessedCharacter, question)) {
      suggestions.push({ type: "missing_question", questionId: question.id });
    }
    if (suggestions.length >= 3) {
      break;
    }
  }

  return suggestions;
}

export function summarizeCorrectionFeedback(records: CorrectionFeedbackRecord[]) {
  const byCorrectCharacter = new Map<string, number>();
  const byGuessedCharacter = new Map<string, number>();
  const byPair = new Map<string, number>();

  for (const record of records) {
    byCorrectCharacter.set(record.correctCharacterId, (byCorrectCharacter.get(record.correctCharacterId) ?? 0) + 1);
    byGuessedCharacter.set(record.guessedCharacterId, (byGuessedCharacter.get(record.guessedCharacterId) ?? 0) + 1);
    const pairKey = `${record.guessedCharacterId}->${record.correctCharacterId}`;
    byPair.set(pairKey, (byPair.get(pairKey) ?? 0) + 1);
  }

  return {
    total: records.length,
    byCorrectCharacter: toSortedCounts(byCorrectCharacter),
    byGuessedCharacter: toSortedCounts(byGuessedCharacter),
    byPair: toSortedCounts(byPair)
  };
}

function toSortedCounts(map: Map<string, number>) {
  return Array.from(map.entries())
    .map(([id, count]) => ({ id, count }))
    .sort((a, b) => b.count - a.count || a.id.localeCompare(b.id));
}
