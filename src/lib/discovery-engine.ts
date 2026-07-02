import type {
  AnswerRecord,
  AnswerValue,
  CharacterScore,
  DiscoveryCharacter,
  DiscoveryQuestion,
  DiscoveryState,
  MatchedTrait,
  TraitValue
} from "@/lib/discovery-types";

const ANSWER_MULTIPLIER: Record<AnswerValue, number> = {
  yes: 1,
  probably: 0.55,
  not_sure: 0,
  probably_not: -0.55,
  no: -1
};

const MIN_GLOBAL_ANSWERS_BEFORE_GAME_SCOPE = 2;
const GAME_CONFIDENCE_THRESHOLD = 0.68;
const GUESS_CONFIDENCE_THRESHOLD = 0.74;
const MAX_QUESTIONS = 18;
const POSITIVE_ANSWERS = new Set<AnswerValue>(["yes", "probably"]);
const CONFIDENT_ANSWERS = new Set<AnswerValue>(["yes", "probably", "probably_not", "no"]);
const POSITIVE_ANSWER_RESOLVES_TRAIT_PATHS = new Set([
  "global.game",
  "global.genderPresentation",
  "global.primaryHairColor",
  "global.primaryOutfitColor",
  "hsr.path",
  "hsr.combatType",
  "hsr.rarity"
]);

export function getTraitValue(character: DiscoveryCharacter, traitPath: string): TraitValue {
  const segments = traitPath.split(".");
  let value: unknown = character;

  for (const segment of segments) {
    if (value && typeof value === "object" && segment in value) {
      value = (value as Record<string, unknown>)[segment];
    } else {
      return null;
    }
  }

  return value as TraitValue;
}

export function traitMatches(character: DiscoveryCharacter, question: DiscoveryQuestion) {
  const value = getTraitValue(character, question.traitPath);

  if (Array.isArray(value)) {
    return value.includes(question.expectedValue as never);
  }

  return value === question.expectedValue;
}

export function scoreCharacters(
  characters: DiscoveryCharacter[],
  questions: DiscoveryQuestion[],
  answers: AnswerRecord[]
): CharacterScore[] {
  const questionMap = new Map(questions.map((question) => [question.id, question]));
  const rawScores = characters.map((character) => {
    const matched: MatchedTrait[] = [];
    const contradicted: MatchedTrait[] = [];

    const score = answers.reduce((sum, answer) => {
      const question = questionMap.get(answer.questionId);
      if (!question) {
        return sum;
      }

      const multiplier = ANSWER_MULTIPLIER[answer.answer];
      if (multiplier === 0) {
        return sum;
      }

      const matches = traitMatches(character, question);
      const impact = question.weight * (matches ? multiplier : -multiplier * 0.65);

      if (impact > 0) {
        matched.push({ question, answer: answer.answer, impact });
      } else if (impact < 0) {
        contradicted.push({ question, answer: answer.answer, impact });
      }

      return sum + impact;
    }, 0);

    return {
      character,
      score,
      confidence: 0,
      matched,
      contradicted
    };
  });

  const minScore = Math.min(...rawScores.map((item) => item.score));
  const shiftedScores = rawScores.map((item) => ({
    ...item,
    shifted: item.score - minScore + 1
  }));
  const total = shiftedScores.reduce((sum, item) => sum + item.shifted, 0);

  return shiftedScores
    .map(({ shifted, ...item }) => ({
      ...item,
      confidence: total > 0 ? shifted / total : 1 / characters.length
    }))
    .sort((a, b) => b.confidence - a.confidence);
}

export function getLikelyGameId(scores: CharacterScore[]) {
  const gameTotals = scores.reduce((map, score) => {
    map.set(score.character.gameId, (map.get(score.character.gameId) ?? 0) + score.confidence);
    return map;
  }, new Map<string, number>());

  const [topGame] = [...gameTotals.entries()].sort((a, b) => b[1] - a[1]);
  if (!topGame || topGame[1] < GAME_CONFIDENCE_THRESHOLD) {
    return null;
  }

  return topGame[0];
}

export function getNextQuestion(
  characters: DiscoveryCharacter[],
  questions: DiscoveryQuestion[],
  answers: AnswerRecord[],
  scores: CharacterScore[]
) {
  const answeredIds = new Set(answers.map((answer) => answer.questionId));
  const questionMap = new Map(questions.map((question) => [question.id, question]));
  const globalAnswerCount = answers.filter((answer) => {
    const question = questionMap.get(answer.questionId);
    return question?.scope === "global";
  }).length;
  const likelyGameId = getLikelyGameId(scores);
  const allowGameQuestions = likelyGameId !== null && globalAnswerCount >= MIN_GLOBAL_ANSWERS_BEFORE_GAME_SCOPE;
  const candidatePool = scores.slice(0, Math.min(10, scores.length)).map((score) => score.character);

  const eligibleQuestions = questions.filter((question) => {
    if (answeredIds.has(question.id)) {
      return false;
    }
    if (isQuestionRedundant(question, answers, questionMap)) {
      return false;
    }
    if (question.scope === "global") {
      return true;
    }
    return allowGameQuestions && question.scope === `game:${likelyGameId}`;
  });

  if (eligibleQuestions.length === 0) {
    return null;
  }

  const rankedQuestions = eligibleQuestions
    .map((question) => ({
      question,
      usefulness: getQuestionUsefulness(candidatePool.length > 1 ? candidatePool : characters, question)
    }))
    .filter((item) => item.usefulness > 0)
    .sort((a, b) => b.usefulness - a.usefulness);

  return rankedQuestions[0]?.question ?? null;
}

function isQuestionRedundant(
  question: DiscoveryQuestion,
  answers: AnswerRecord[],
  questionMap: Map<string, DiscoveryQuestion>
) {
  return answers.some((answer) => {
    const previousQuestion = questionMap.get(answer.questionId);
    if (!previousQuestion || previousQuestion.traitPath !== question.traitPath) {
      return false;
    }

    if (typeof question.expectedValue === "boolean" && CONFIDENT_ANSWERS.has(answer.answer)) {
      return true;
    }

    return POSITIVE_ANSWER_RESOLVES_TRAIT_PATHS.has(question.traitPath) && POSITIVE_ANSWERS.has(answer.answer);
  });
}

function getQuestionUsefulness(characters: DiscoveryCharacter[], question: DiscoveryQuestion) {
  if (characters.length === 0) {
    return 0;
  }

  const matches = characters.filter((character) => traitMatches(character, question)).length;
  if (matches === 0 || matches === characters.length) {
    return 0;
  }

  const ratio = matches / characters.length;
  const splitScore = 1 - Math.abs(0.5 - ratio) * 2;
  const scopeBoost = question.scope === "global" ? 0.08 : 0;

  return question.weight * (0.35 + splitScore) + scopeBoost;
}

export function getDiscoveryState(
  characters: DiscoveryCharacter[],
  questions: DiscoveryQuestion[],
  answers: AnswerRecord[]
): DiscoveryState {
  const scores = scoreCharacters(characters, questions, answers);
  const nextQuestion = getNextQuestion(characters, questions, answers, scores);
  const likelyGameId = getLikelyGameId(scores);
  const top = scores[0];
  const runnerUp = scores[1];
  const confidenceGap = top && runnerUp ? top.confidence - runnerUp.confidence : 1;
  const shouldGuess =
    answers.length >= 4 &&
    (top.confidence >= GUESS_CONFIDENCE_THRESHOLD || confidenceGap >= 0.32 || answers.length >= MAX_QUESTIONS);

  return {
    scores,
    nextQuestion,
    likelyGameId,
    shouldGuess,
    questionCount: answers.length
  };
}

export function getAnswerLabel(answer: AnswerValue) {
  return {
    yes: "Yes",
    probably: "Probably",
    not_sure: "Not sure",
    probably_not: "Probably not",
    no: "No"
  }[answer];
}

export function getSimilarCharacters(target: DiscoveryCharacter, characters: DiscoveryCharacter[], limit = 3) {
  return characters
    .filter((character) => character.id !== target.id)
    .map((character) => ({
      character,
      similarity: getSimilarityScore(target, character)
    }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);
}

function getSimilarityScore(a: DiscoveryCharacter, b: DiscoveryCharacter) {
  const traitPaths = [
    "global.characterType",
    "global.genderPresentation",
    "global.primaryHairColor",
    "global.weaponType",
    "global.primaryOutfitColor",
    "global.personality",
    "hsr.path",
    "hsr.combatType",
    "hsr.faction",
    "hsr.worldOrRegion",
    "hsr.fanSignals"
  ];

  return traitPaths.reduce((sum, path) => {
    const aValue = getTraitValue(a, path);
    const bValue = getTraitValue(b, path);
    return sum + getValueOverlap(aValue, bValue);
  }, 0);
}

function getValueOverlap(a: TraitValue, b: TraitValue) {
  if (Array.isArray(a) && Array.isArray(b)) {
    const bValues = new Set<unknown>(b);
    const overlap = a.filter((item) => bValues.has(item)).length;
    return overlap / Math.max(a.length, b.length, 1);
  }
  if (Array.isArray(a)) {
    return new Set<unknown>(a).has(b) ? 1 : 0;
  }
  if (Array.isArray(b)) {
    return new Set<unknown>(b).has(a) ? 1 : 0;
  }
  return a === b ? 1 : 0;
}
