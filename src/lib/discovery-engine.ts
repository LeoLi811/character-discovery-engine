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
const CONFIDENT_ANSWERS = new Set<AnswerValue>(["yes", "probably", "probably_not", "no"]);
const POSITIVE_ANSWERS = new Set<AnswerValue>(["yes", "probably"]);

const QUESTION_GROUPS: Record<string, string> = {
  "global-playable": "playability",
  "global-npc": "playability",
  "hsr-non-playable-combat": "playability",
  "global-female": "gender",
  "global-male": "gender",
  "global-variable-gender": "gender",
  "global-bright-hair": "hair-color",
  "global-purple-hair": "hair-color",
  "global-pink-hair": "hair-color",
  "global-blue-hair": "hair-color",
  "global-white-hair": "hair-color",
  "global-black-hair": "hair-color",
  "global-blond-hair": "hair-color",
  "global-red-hair": "hair-color",
  "global-purple-outfit": "outfit-color",
  "global-red-outfit": "outfit-color",
  "global-green-outfit": "outfit-color",
  "global-white-outfit": "outfit-color",
  "global-uses-weapon": "weapon-style",
  "global-gun": "weapon-style",
  "global-sword": "weapon-style",
  "global-magic-tool": "weapon-style",
  "hsr-mech": "weapon-style",
  "hsr-dragon": "weapon-style",
  "hsr-robot-companion": "weapon-style",
  "hsr-music": "weapon-style",
  "hsr-coffin": "weapon-style",
  "hsr-mechanical-arm": "weapon-style",
  "hsr-summon": "weapon-style",
  "global-mysterious": "personality",
  "global-calm": "personality",
  "global-cheerful": "personality",
  "global-main-cast": "broad-role",
  "global-avatar": "broad-role",
  "global-leader": "broad-role",
  "global-antihero": "broad-role",
  "hsr-alt-form": "broad-role",
  "hsr-mascot": "broad-role",
  "hsr-robot-character": "broad-role",
  "hsr-lore-character": "broad-role",
  "hsr-major-story-character": "broad-role",
  "hsr-antagonist": "broad-role",
  "hsr-mentor": "broad-role",
  "hsr-healer": "broad-role",
  "hsr-singer": "broad-role",
  "hsr-hacker": "broad-role",
  "hsr-gambler": "broad-role",
  "hsr-thief": "broad-role",
  "hsr-foxian": "broad-role",
  "hsr-animal-companion": "broad-role",
  "hsr-genius": "genius-society",
  "hsr-genius-society-member": "genius-society",
  "hsr-researcher": "genius-society",
  "hsr-ipc": "ipc",
  "hsr-ipc-full": "ipc",
  "hsr-ipc-executive": "ipc",
  "hsr-ten-stonehearts": "ipc-stonehearts",
  "hsr-ten-stoneheart-role": "ipc-stonehearts",
  "hsr-lord-ravager": "lord-ravager",
  "hsr-incubated-lord-ravager": "lord-ravager",
  "hsr-antimatter-legion": "antimatter-legion",
  "hsr-emanator": "emanator",
  "hsr-aeon": "aeon",
  "hsr-cosmic-entity": "aeon",
  "hsr-nihility": "hsr-path",
  "hsr-harmony": "hsr-path",
  "hsr-destruction": "hsr-path",
  "hsr-hunt": "hsr-path",
  "hsr-preservation": "hsr-path",
  "hsr-erudition": "hsr-path",
  "hsr-abundance": "hsr-path",
  "hsr-remembrance": "hsr-path",
  "hsr-elation": "hsr-path",
  "hsr-trailblaze-path": "hsr-path",
  "hsr-voracity-path": "hsr-path",
  "hsr-permanence-path": "hsr-path",
  "hsr-finality-path": "hsr-path",
  "hsr-propagation-path": "hsr-path",
  "hsr-beauty-path": "hsr-path",
  "hsr-enigmata-path": "hsr-path",
  "hsr-equilibrium-path": "hsr-path",
  "hsr-lightning": "combat-type",
  "hsr-quantum": "combat-type",
  "hsr-imaginary": "combat-type",
  "hsr-fire": "combat-type",
  "hsr-ice": "combat-type",
  "hsr-wind": "combat-type",
  "hsr-physical": "combat-type",
  "hsr-five-star": "rarity",
  "hsr-four-star": "rarity",
  "hsr-animated-short": "media",
  "hsr-character-trailer": "media",
  "hsr-meme": "fan-signal",
  "hsr-high-fan-art": "fan-signal",
  "hsr-shipping": "fan-signal",
  "hsr-meta": "fan-signal",
  "hsr-amphoreus": "story-region",
  "hsr-cosmos-region": "story-region",
  "hsr-penacony": "story-region",
  "hsr-penacony-faction": "story-region",
  "hsr-xianzhou": "story-region",
  "hsr-xianzhou-alliance": "story-region",
  "hsr-belobog": "story-region",
  "hsr-herta-space-station": "story-region",
  "hsr-yaoqing": "story-region",
  "hsr-stellaron-hunter": "faction",
  "hsr-astral-express": "faction",
  "hsr-silvermane": "faction",
  "hsr-knights-beauty": "faction",
  "hsr-ten-lords": "faction",
  "hsr-alchemy": "faction",
  "hsr-family": "faction",
  "hsr-chrysos-heir": "faction",
  "hsr-cloud-knights": "faction",
  "hsr-galaxy-ranger": "galaxy-ranger",
  "hsr-galaxy-rangers": "galaxy-ranger",
  "hsr-high-cloud-quintet": "faction",
  "hsr-memory-story-character": "penacony-lore",
  "hsr-watchmaker-legacy": "penacony-lore",
  "hsr-heliobus": "specific-lore"
};

const QUESTION_GROUP_COOLDOWN = 2;

// These fields can only have one primary answer for a character.
const EXCLUSIVE_TRAIT_PATHS = new Set([
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
  const topWindow = scores.slice(0, Math.min(16, scores.length));
  const lastTopScore = topWindow[topWindow.length - 1];
  const confidenceSpread = topWindow[0] && lastTopScore ? topWindow[0].confidence - lastTopScore.confidence : 0;
  const candidatePool = answers.length < 2 || confidenceSpread < 0.01 ? characters : topWindow.map((score) => score.character);

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
      usefulness: getQuestionUsefulness(candidatePool, question) * getQuestionContextMultiplier(question, answers, questionMap)
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
  if (isQuestionGroupSatisfied(question, answers, questionMap)) {
    return true;
  }

  if (isQuestionGroupRecentlyAsked(question, answers, questionMap)) {
    return true;
  }

  return answers.some((answer) => {
    const previousQuestion = questionMap.get(answer.questionId);
    if (!previousQuestion || previousQuestion.traitPath !== question.traitPath) {
      return false;
    }

    if (typeof question.expectedValue === "boolean" && CONFIDENT_ANSWERS.has(answer.answer)) {
      return true;
    }

    if (!EXCLUSIVE_TRAIT_PATHS.has(question.traitPath)) {
      return false;
    }

    return POSITIVE_ANSWERS.has(answer.answer);
  });
}

function isQuestionGroupRecentlyAsked(
  question: DiscoveryQuestion,
  answers: AnswerRecord[],
  questionMap: Map<string, DiscoveryQuestion>
) {
  const group = QUESTION_GROUPS[question.id];
  if (!group) {
    return false;
  }

  return answers.slice(-QUESTION_GROUP_COOLDOWN).some((answer) => {
    const previousQuestion = questionMap.get(answer.questionId);
    return previousQuestion ? QUESTION_GROUPS[previousQuestion.id] === group : false;
  });
}

function isQuestionGroupSatisfied(
  question: DiscoveryQuestion,
  answers: AnswerRecord[],
  questionMap: Map<string, DiscoveryQuestion>
) {
  const group = QUESTION_GROUPS[question.id];
  if (!group) {
    return false;
  }

  return answers.some((answer) => {
    if (!POSITIVE_ANSWERS.has(answer.answer)) {
      return false;
    }

    const previousQuestion = questionMap.get(answer.questionId);
    return previousQuestion ? QUESTION_GROUPS[previousQuestion.id] === group : false;
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

function getQuestionContextMultiplier(
  question: DiscoveryQuestion,
  answers: AnswerRecord[],
  questionMap: Map<string, DiscoveryQuestion>
) {
  const npcLikely = hasAnswerForExpectedValue(answers, questionMap, "global.characterType", "npc", true);
  const nonPlayableLikely = hasAnswerForExpectedValue(answers, questionMap, "hsr.combatType", "Non-playable", true);
  const aeonLikely = hasAnswerForExpectedValue(answers, questionMap, "global.characterType", "aeon", true);
  const lordRavagerLikely = hasAnswerForExpectedValue(answers, questionMap, "hsr.storyRole", "lord-ravager", true);
  const ipcLikely = hasAnswerForExpectedValue(
    answers,
    questionMap,
    "hsr.faction",
    "Interastral Peace Corporation",
    true
  );
  const geniusLikely = hasAnswerForExpectedValue(answers, questionMap, "hsr.faction", "Genius Society", true);
  const loreMode = npcLikely || nonPlayableLikely;

  if (!loreMode) {
    return 1;
  }

  if (aeonLikely) {
    if (question.traitPath === "hsr.path") {
      return 4;
    }

    if (
      question.traitPath === "global.characterType" ||
      question.traitPath === "global.genderPresentation" ||
      question.traitPath === "hsr.rarity" ||
      question.traitPath === "hsr.worldOrRegion"
    ) {
      return 0;
    }
  }

  if (lordRavagerLikely) {
    if (question.traitPath === "hsr.storyRole" || question.traitPath === "hsr.worldOrRegion") {
      return 2.1;
    }

    if (question.traitPath === "global.characterType" || question.traitPath === "hsr.rarity") {
      return 0;
    }
  }

  if (
    ipcLikely &&
    (question.id === "hsr-ten-stonehearts" ||
      question.id === "hsr-ten-stoneheart-role" ||
      question.id === "hsr-ipc-executive")
  ) {
    return 2.4;
  }

  if (geniusLikely && question.id === "hsr-amphoreus") {
    return 3.2;
  }

  if (geniusLikely && question.id === "hsr-researcher") {
    return 0;
  }

  if (geniusLikely && question.id === "hsr-genius-society-member") {
    return 0;
  }

  if (question.traitPath === "hsr.rarity") {
    return 0;
  }

  if (question.traitPath === "global.brightHair" || question.traitPath === "global.primaryHairColor") {
    return 0.18;
  }

  if (question.traitPath === "global.primaryOutfitColor") {
    return 0.22;
  }

  if (question.traitPath === "global.genderPresentation") {
    return 0.35;
  }

  if (
    question.id === "hsr-aeon" ||
    question.id === "hsr-lord-ravager" ||
    question.id === "hsr-antimatter-legion" ||
    question.id === "hsr-amphoreus" ||
    question.id === "hsr-ipc-full" ||
    question.id === "hsr-ten-stonehearts" ||
    question.id === "hsr-genius" ||
    question.id === "hsr-genius-society-member" ||
    question.id === "hsr-ipc-executive" ||
    question.id === "hsr-high-cloud-quintet" ||
    question.id === "hsr-memory-story-character" ||
    question.id === "hsr-watchmaker-legacy" ||
    question.id === "hsr-heliobus" ||
    question.id === "hsr-incubated-lord-ravager" ||
    question.id === "hsr-mascot" ||
    question.id === "hsr-robot-character" ||
    question.id === "hsr-galaxy-rangers"
  ) {
    return 2.1;
  }

  if (
    question.traitPath === "global.characterType" ||
    question.traitPath === "hsr.faction" ||
    question.traitPath === "hsr.storyRole" ||
    question.traitPath === "hsr.worldOrRegion"
  ) {
    return 1.35;
  }

  if (question.traitPath === "hsr.path") {
    return 1.15;
  }

  return 1;
}

function hasAnswerForExpectedValue(
  answers: AnswerRecord[],
  questionMap: Map<string, DiscoveryQuestion>,
  traitPath: string,
  expectedValue: DiscoveryQuestion["expectedValue"],
  positive: boolean
) {
  return answers.some((answer) => {
    const question = questionMap.get(answer.questionId);
    if (!question || question.traitPath !== traitPath || question.expectedValue !== expectedValue) {
      return false;
    }

    return positive ? POSITIVE_ANSWERS.has(answer.answer) : answer.answer === "no" || answer.answer === "probably_not";
  });
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
