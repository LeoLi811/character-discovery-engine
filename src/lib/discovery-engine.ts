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
const MIN_QUESTIONS_BEFORE_GUESS = 8;
const MAX_QUESTIONS = 18;
const CONFIDENT_ANSWERS = new Set<AnswerValue>(["yes", "probably", "probably_not", "no"]);
const POSITIVE_ANSWERS = new Set<AnswerValue>(["yes", "probably"]);
const NEGATIVE_ANSWERS = new Set<AnswerValue>(["no", "probably_not"]);

const QUESTION_GROUPS: Record<string, string> = {
  "global-playable": "playability",
  "global-npc": "playability",
  "hsr-non-playable-combat": "playability",
  "global-female": "gender",
  "global-male": "gender",
  "global-variable-gender": "gender",
  "global-bright-hair": "hair-brightness",
  "global-purple-hair": "hair-color",
  "global-pink-hair": "hair-color",
  "global-blue-hair": "hair-color",
  "global-teal-hair": "hair-color",
  "global-white-hair": "hair-color",
  "global-black-hair": "hair-color",
  "global-blond-hair": "hair-color",
  "global-red-hair": "hair-color",
  "global-purple-outfit": "outfit-color",
  "global-red-outfit": "outfit-color",
  "global-green-outfit": "outfit-color",
  "global-teal-outfit": "outfit-color",
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
  "hsr-alt-form": "alternate-form",
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
const AMBIGUITY_TOP_CANDIDATE_COUNT = 5;
const AMBIGUITY_CONFIDENCE_GAP_THRESHOLD = 0.32;
const NORMAL_GUESS_CONFIDENCE_THRESHOLD = 0.85;
const NORMAL_GUESS_GAP_THRESHOLD = 0.45;

const SEPARATOR_TRAIT_PRIORITY = [
  "hsr.faction",
  "hsr.worldOrRegion",
  "hsr.storyRole",
  "hsr.path",
  "hsr.combatType",
  "global.primaryHairColor",
  "global.weaponType",
  "global.primaryOutfitColor",
  "global.personality"
];

const MEANINGFUL_BRANCH_QUESTION_IDS = new Set([
  "global-playable",
  "global-npc",
  "hsr-non-playable-combat",
  "hsr-aeon",
  "hsr-lord-ravager",
  "hsr-chrysos-heir",
  "hsr-amphoreus",
  "hsr-penacony",
  "hsr-xianzhou",
  "hsr-belobog",
  "hsr-stellaron-hunter",
  "hsr-astral-express",
  "hsr-ipc",
  "hsr-genius",
  "hsr-genius-society",
  "hsr-genius-society-member"
]);

const EXCLUSIVE_QUESTION_GROUPS = new Set([
  "gender",
  "playability",
  "rarity",
  "combat-type",
  "hsr-path",
  "broad-role"
]);

const PLAYABLE_YES_SUPPRESSED_IDS = new Set([
  "global-npc",
  "hsr-non-playable-combat",
  "hsr-aeon",
  "hsr-cosmic-entity",
  "hsr-lord-ravager",
  "hsr-incubated-lord-ravager"
]);

const NPC_YES_SUPPRESSED_IDS = new Set(["global-playable", "hsr-character-trailer", "hsr-animated-short"]);

const NORMAL_PLAYABLE_COMBAT_IDS = new Set([
  "hsr-lightning",
  "hsr-quantum",
  "hsr-imaginary",
  "hsr-fire",
  "hsr-ice",
  "hsr-wind",
  "hsr-physical"
]);

const AEON_YES_SUPPRESSED_TRAIT_PATHS = new Set([
  "global.genderPresentation",
  "global.brightHair",
  "global.primaryHairColor",
  "global.primaryOutfitColor",
  "global.usesWeapon",
  "global.weaponType",
  "hsr.rarity",
  "hsr.combatType"
]);

const AEON_YES_SUPPRESSED_IDS = new Set(["global-playable", "global-npc"]);
const AEON_YES_SUPPRESSED_STORY_IDS = new Set([
  "hsr-lord-ravager",
  "hsr-incubated-lord-ravager",
  "hsr-antimatter-legion"
]);

const LORD_RAVAGER_ALLOWED_IDS = new Set([
  "hsr-lord-ravager",
  "hsr-incubated-lord-ravager",
  "hsr-antimatter-legion"
]);

const LORE_PRIORITY_IDS = new Set([
  "global-npc",
  "hsr-non-playable-combat",
  "hsr-aeon",
  "hsr-cosmic-entity",
  "hsr-lord-ravager",
  "hsr-antimatter-legion",
  "hsr-emanator",
  "hsr-belobog",
  "hsr-penacony",
  "hsr-xianzhou",
  "hsr-amphoreus",
  "hsr-ipc",
  "hsr-cosmos-region",
  "hsr-lore-character",
  "hsr-major-story-character",
  "hsr-antagonist",
  "hsr-ipc-full",
  "hsr-ten-stonehearts",
  "hsr-genius",
  "hsr-genius-society-member",
  "hsr-ipc-executive",
  "hsr-ten-stoneheart-role",
  "hsr-penacony",
  "hsr-penacony-faction",
  "hsr-memory-story-character",
  "hsr-watchmaker-legacy",
  "hsr-incubated-lord-ravager"
]);

const NPC_LORE_LATE_ONLY_IDS = new Set([
  "global-leader",
  "global-antihero",
  "global-mysterious",
  "global-calm",
  "global-cheerful",
  "hsr-major-story-character",
  "hsr-antagonist"
]);

const NPC_LORE_STRUCTURAL_IDS = new Set([
  "global-playable",
  "global-npc",
  "hsr-non-playable-combat",
  "hsr-aeon",
  "hsr-cosmic-entity",
  "hsr-lord-ravager",
  "hsr-emanator",
  "hsr-antimatter-legion",
  "hsr-incubated-lord-ravager",
  "hsr-lord-ravager-nihility",
  "hsr-lord-ravager-erasure",
  "hsr-lord-ravager-harmony",
  "hsr-lord-ravager-voidranger",
  "hsr-lord-ravager-elation",
  "hsr-lord-ravager-strategist",
  "hsr-lord-ravager-sun-devourer",
  "hsr-lord-ravager-leviathan",
  "hsr-lord-ravager-forger",
  "hsr-lord-ravager-legion-architect",
  "hsr-lord-ravager-anti-nous",
  "hsr-lord-ravager-scepter",
  "hsr-robot-character",
  "hsr-mascot",
  "hsr-lore-character",
  "hsr-belobog",
  "hsr-penacony",
  "hsr-xianzhou",
  "hsr-amphoreus",
  "hsr-herta-space-station",
  "hsr-cosmos-region",
  "hsr-ipc",
  "hsr-ipc-full",
  "hsr-ipc-executive",
  "hsr-ten-stonehearts",
  "hsr-ten-stoneheart-role",
  "hsr-genius",
  "hsr-genius-society-member",
  "hsr-stellaron-hunter",
  "hsr-astral-express",
  "hsr-family",
  "hsr-silvermane",
  "hsr-cloud-knights",
  "hsr-high-cloud-quintet",
  "hsr-ten-lords",
  "hsr-alchemy",
  "hsr-foxian",
  "hsr-heliobus",
  "hsr-memory-story-character",
  "hsr-watchmaker-legacy",
  "hsr-galaxy-rangers"
]);

const NPC_LORE_BROAD_REGION_IDS = [
  "hsr-amphoreus",
  "hsr-xianzhou",
  "hsr-xianzhou-luofu",
  "hsr-penacony",
  "hsr-belobog",
  "hsr-herta-space-station",
  "hsr-cosmos-region"
];

const NPC_LORE_AMPHOREUS_STRUCTURAL_IDS = [
  "hsr-amphoreus-titan",
  "hsr-coreflame-source",
  "hsr-genesis-titan",
  "hsr-intellitron",
  "hsr-zandar-vessel",
  "hsr-scepter-conspiracy",
  "hsr-amphoreus-mastermind",
  "hsr-irontomb-release-plot",
  "hsr-chrysos-heir"
];

const TITAN_ASSOCIATED_HEIR_QUESTION_PREFIX = "hsr-titan-associated-";

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
  const candidateCharacters = getDiscoveryEligibleCharacters(characters);
  if (candidateCharacters.length === 0) {
    return [];
  }

  const questionMap = new Map(questions.map((question) => [question.id, question]));
  const rawScores = candidateCharacters.map((character) => {
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
      confidence: total > 0 ? shifted / total : 1 / candidateCharacters.length
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
  const discoveryCandidates = getDiscoveryEligibleCharacters(characters);
  const questionMap = new Map(questions.map((question) => [question.id, question]));
  const activeCandidatePool = getActiveCandidatePool(discoveryCandidates, questionMap, answers);
  const activeCandidateIds = new Set(activeCandidatePool.map((character) => character.id));
  const activeScores = scores.filter((score) => activeCandidateIds.has(score.character.id));
  const topWindow = activeScores.slice(0, Math.min(16, activeScores.length));
  const lastTopScore = topWindow[topWindow.length - 1];
  const confidenceSpread = topWindow[0] && lastTopScore ? topWindow[0].confidence - lastTopScore.confidence : 0;
  const candidatePool =
    answers.length < 2 || confidenceSpread < 0.01 ? activeCandidatePool : topWindow.map((score) => score.character);
  const eligibleQuestions = getEligibleQuestions(questions, answers, scores, candidatePool);

  if (eligibleQuestions.length === 0) {
    return null;
  }

  const rankedQuestions = eligibleQuestions
    .map((question) => ({
      question,
      usefulness: getQuestionUsefulness(candidatePool, question) * getQuestionContextMultiplier(question, answers, questionMap)
    }))
    .filter((item) => item.usefulness > 0);
  const phaseQuestions = getHighestPriorityPhaseQuestions(rankedQuestions, answers, questionMap);

  return phaseQuestions.sort((a, b) => b.usefulness - a.usefulness)[0]?.question ?? null;
}

function getActiveCandidatePool(
  characters: DiscoveryCharacter[],
  questionMap: Map<string, DiscoveryQuestion>,
  answers: AnswerRecord[]
) {
  let activeCandidates = characters;

  const applyFilter = (predicate: (character: DiscoveryCharacter) => boolean) => {
    const filtered = activeCandidates.filter(predicate);
    if (filtered.length > 0) {
      activeCandidates = filtered;
    }
  };

  const playableLikely = hasAnswerForExpectedValue(answers, questionMap, "global.characterType", "playable", true);
  const playableUnlikely = hasAnswerForExpectedValue(answers, questionMap, "global.characterType", "playable", false);
  const npcLikely = hasAnswerForExpectedValue(answers, questionMap, "global.characterType", "npc", true);
  const npcUnlikely = hasAnswerForExpectedValue(answers, questionMap, "global.characterType", "npc", false);
  const aeonLikely = hasAnswerForExpectedValue(answers, questionMap, "global.characterType", "aeon", true);
  const lordRavagerLikely = hasAnswerForExpectedValue(answers, questionMap, "hsr.storyRole", "lord-ravager", true);
  const maleLikely = hasAnswerForExpectedValue(answers, questionMap, "global.genderPresentation", "male", true);
  const femaleLikely = hasAnswerForExpectedValue(answers, questionMap, "global.genderPresentation", "female", true);

  if (aeonLikely) {
    applyFilter(isAeonCandidate);
  } else if (lordRavagerLikely) {
    applyFilter(isLordRavagerCandidate);
  } else {
    if (playableLikely) {
      applyFilter(
        (character) =>
          isPlayableCandidate(character) &&
          !isNpcCandidate(character) &&
          !isAeonCandidate(character) &&
          !isLordRavagerCandidate(character) &&
          !isCosmicEntityCandidate(character) &&
          (!isNonPlayableCombatCandidate(character) || isPlayableCandidate(character))
      );
    } else if (playableUnlikely) {
      applyFilter((character) => !isPurePlayableCandidate(character));
    }

    if (npcLikely) {
      applyFilter(isNpcBranchCandidate);
    } else if (npcUnlikely) {
      applyFilter(
        (character) =>
          !isNpcCandidate(character) &&
          !isAeonCandidate(character) &&
          !isLordRavagerCandidate(character) &&
          !isNonPlayableCombatCandidate(character)
      );
    }
  }

  if (maleLikely) {
    applyFilter((character) => characterHasTraitValue(character, "global.genderPresentation", "male"));
  } else if (femaleLikely) {
    applyFilter((character) => characterHasTraitValue(character, "global.genderPresentation", "female"));
  }

  for (const answer of answers) {
    if (!CONFIDENT_ANSWERS.has(answer.answer)) {
      continue;
    }

    const question = questionMap.get(answer.questionId);
    if (!question || !shouldApplyAnswerAsCandidateFilter(question)) {
      continue;
    }

    applyFilter((character) => {
      const matchesAnswer = characterHasTraitValue(character, question.traitPath, question.expectedValue);

      if (POSITIVE_ANSWERS.has(answer.answer) && matchesAnswer) {
        return true;
      }

      if (NEGATIVE_ANSWERS.has(answer.answer)) {
        return !matchesAnswer;
      }

      return (
        !playableLikely &&
        !aeonLikely &&
        !lordRavagerLikely &&
        (question.traitPath === "hsr.path" || question.traitPath === "hsr.combatType") &&
        isLoreBranchCandidate(character) &&
        (hasVariableTraitValue(character, question.traitPath) || isNonPlayableCombatCandidate(character))
      );
    });
  }

  return activeCandidates;
}

function getDiscoveryEligibleCharacters(characters: DiscoveryCharacter[]) {
  return characters.filter(isDiscoveryEligibleCharacter);
}

function isDiscoveryEligibleCharacter(character: DiscoveryCharacter) {
  return isPlayableCandidate(character) || character.discoveryEligible !== false;
}

function shouldApplyAnswerAsCandidateFilter(question: DiscoveryQuestion) {
  if (question.id === "global-playable" || question.id === "global-npc") {
    return false;
  }

  return (
    question.traitPath === "global.characterType" ||
    question.traitPath === "global.genderPresentation" ||
    question.traitPath === "hsr.faction" ||
    question.traitPath === "hsr.worldOrRegion" ||
    question.traitPath === "hsr.storyRole" ||
    question.traitPath === "hsr.path" ||
    question.traitPath === "hsr.combatType" ||
    question.traitPath === "hsr.rarity" ||
    isFinalLayerQuestion(question)
  );
}

function characterHasTraitValue(
  character: DiscoveryCharacter,
  traitPath: string,
  expectedValue: DiscoveryQuestion["expectedValue"]
) {
  const value = getTraitValue(character, traitPath);
  return Array.isArray(value) ? value.includes(expectedValue as never) : value === expectedValue;
}

function hasVariableTraitValue(character: DiscoveryCharacter, traitPath: string) {
  return (
    characterHasTraitValue(character, traitPath, "variable") ||
    characterHasTraitValue(character, traitPath, "Variable") ||
    characterHasTraitValue(character, traitPath, "needs_research")
  );
}

function isPlayableCandidate(character: DiscoveryCharacter) {
  return characterHasTraitValue(character, "global.characterType", "playable");
}

function isNpcCandidate(character: DiscoveryCharacter) {
  return characterHasTraitValue(character, "global.characterType", "npc");
}

function isAeonCandidate(character: DiscoveryCharacter) {
  return characterHasTraitValue(character, "global.characterType", "aeon");
}

function isLordRavagerCandidate(character: DiscoveryCharacter) {
  return characterHasTraitValue(character, "hsr.storyRole", "lord-ravager");
}

function isCosmicEntityCandidate(character: DiscoveryCharacter) {
  return characterHasTraitValue(character, "global.characterType", "cosmic-entity");
}

function isNonPlayableCombatCandidate(character: DiscoveryCharacter) {
  return characterHasTraitValue(character, "hsr.combatType", "Non-playable");
}

function isLoreBranchCandidate(character: DiscoveryCharacter) {
  return (
    isNpcBranchCandidate(character) ||
    (!isPlayableCandidate(character) &&
      (characterHasTraitValue(character, "global.characterType", "lore-character") ||
        characterHasTraitValue(character, "global.characterType", "major-story-character")))
  );
}

function isNpcBranchCandidate(character: DiscoveryCharacter) {
  return (
    isNpcCandidate(character) ||
    isAeonCandidate(character) ||
    isLordRavagerCandidate(character) ||
    isCosmicEntityCandidate(character) ||
    isNonPlayableCombatCandidate(character)
  );
}

function isPurePlayableCandidate(character: DiscoveryCharacter) {
  return isPlayableCandidate(character) && !isLoreBranchCandidate(character);
}

function getHighestPriorityPhaseQuestions(
  questionItems: { question: DiscoveryQuestion; usefulness: number }[],
  answers: AnswerRecord[],
  questionMap: Map<string, DiscoveryQuestion>
) {
  if (questionItems.length === 0) {
    return questionItems;
  }

  const rankedByPhase = questionItems.map((item) => ({
    ...item,
    phase: getQuestionPhase(item.question, answers, questionMap),
    phaseRank: getQuestionPhaseRank(item.question, answers, questionMap)
  }));
  const earliestPhase = Math.min(...rankedByPhase.map((item) => item.phase));
  const phaseQuestions = rankedByPhase.filter((item) => item.phase === earliestPhase);
  const bestPhaseRank = Math.min(...phaseQuestions.map((item) => item.phaseRank));

  return phaseQuestions.filter((item) => item.phaseRank === bestPhaseRank);
}

function getQuestionPhase(
  question: DiscoveryQuestion,
  answers: AnswerRecord[],
  questionMap: Map<string, DiscoveryQuestion>
) {
  const aeonLikely = hasAnswerForExpectedValue(answers, questionMap, "global.characterType", "aeon", true);
  const lordRavagerLikely = hasAnswerForExpectedValue(answers, questionMap, "hsr.storyRole", "lord-ravager", true);
  const chrysosHeirLikely = hasAnswerForExpectedValue(answers, questionMap, "hsr.faction", "Chrysos Heirs", true);
  const npcLikely = hasAnswerForExpectedValue(answers, questionMap, "global.characterType", "npc", true);
  const nonPlayableLikely = hasAnswerForExpectedValue(answers, questionMap, "hsr.combatType", "Non-playable", true);

  if (aeonLikely && question.traitPath === "hsr.path") {
    return 2;
  }

  if (
    lordRavagerLikely &&
    (question.traitPath === "hsr.storyRole" || question.traitPath === "hsr.faction" || question.traitPath === "hsr.path")
  ) {
    return 2;
  }

  if (
    chrysosHeirLikely &&
    (question.traitPath === "hsr.worldOrRegion" ||
      question.traitPath === "hsr.faction" ||
      question.traitPath === "hsr.path" ||
      question.traitPath === "hsr.combatType")
  ) {
    return 2;
  }

  if (isScopeBranchQuestion(question)) {
    return 1;
  }

  if ((npcLikely || nonPlayableLikely) && isStructuralNpcLoreQuestion(question)) {
    return 2;
  }

  if (isBroadAffiliationQuestion(question)) {
    return 2;
  }

  if (isGameplayOrRoleQuestion(question)) {
    return 3;
  }

  if (isFinalLayerQuestion(question)) {
    return 4;
  }

  return 3;
}

function isScopeBranchQuestion(question: DiscoveryQuestion) {
  return (
    question.id === "global-hsr" ||
    question.id === "global-playable" ||
    question.id === "global-npc" ||
    question.id === "hsr-non-playable-combat" ||
    question.id === "hsr-aeon" ||
    question.id === "hsr-lord-ravager"
  );
}

function isBroadAffiliationQuestion(question: DiscoveryQuestion) {
  return (
    MEANINGFUL_BRANCH_QUESTION_IDS.has(question.id) ||
    question.traitPath === "hsr.faction" ||
    question.traitPath === "hsr.worldOrRegion"
  );
}

function isGameplayOrRoleQuestion(question: DiscoveryQuestion) {
  return question.traitPath === "hsr.path" || question.traitPath === "hsr.combatType" || question.traitPath === "hsr.rarity" || question.traitPath === "hsr.storyRole";
}

function getQuestionPhaseRank(
  question: DiscoveryQuestion,
  answers: AnswerRecord[],
  questionMap: Map<string, DiscoveryQuestion>
) {
  const playableLikely = hasAnswerForExpectedValue(answers, questionMap, "global.characterType", "playable", true);
  const npcUnlikely = hasAnswerForExpectedValue(answers, questionMap, "global.characterType", "npc", false);
  const npcLikely = hasAnswerForExpectedValue(answers, questionMap, "global.characterType", "npc", true);
  const nonPlayableLikely = hasAnswerForExpectedValue(answers, questionMap, "hsr.combatType", "Non-playable", true);
  const aeonLikely = hasAnswerForExpectedValue(answers, questionMap, "global.characterType", "aeon", true);
  const lordRavagerLikely = hasAnswerForExpectedValue(answers, questionMap, "hsr.storyRole", "lord-ravager", true);

  if (aeonLikely) {
    if (question.traitPath === "hsr.path") {
      return 0;
    }
    return 5;
  }

  if (lordRavagerLikely) {
    const lordRavagerOrder = ["hsr-antimatter-legion", "hsr-incubated-lord-ravager", "hsr-destruction"];
    const orderIndex = lordRavagerOrder.indexOf(question.id);
    if (orderIndex !== -1) {
      return orderIndex;
    }
    if (question.traitPath === "hsr.storyRole" || question.traitPath === "hsr.faction") {
      return 3;
    }
    return 5;
  }

  if (playableLikely || npcUnlikely) {
    const playableBranchOrder = [
      "hsr-chrysos-heir",
      "hsr-amphoreus",
      "hsr-astral-express",
      "hsr-stellaron-hunter",
      "hsr-ipc",
      "hsr-xianzhou",
      "hsr-belobog",
      "hsr-penacony",
      "hsr-genius",
      "hsr-genius-society-member",
      "hsr-herta-space-station",
      "hsr-cosmos-region"
    ];
    const orderIndex = playableBranchOrder.indexOf(question.id);
    if (orderIndex !== -1) {
      return orderIndex;
    }
  }

  if (npcLikely || nonPlayableLikely) {
    const loreBranchOrder = [
      "hsr-aeon",
      "hsr-cosmic-entity",
      "hsr-lord-ravager",
      "hsr-antimatter-legion",
      "hsr-emanator",
      ...NPC_LORE_BROAD_REGION_IDS,
      ...NPC_LORE_AMPHOREUS_STRUCTURAL_IDS,
      "hsr-robot-character",
      "hsr-mascot",
      "hsr-lore-character",
      "hsr-ipc",
      "hsr-ipc-full",
      "hsr-ten-stonehearts",
      "hsr-genius",
      "hsr-genius-society-member",
      "hsr-cosmos-region",
      "hsr-incubated-lord-ravager",
      "hsr-lord-ravager-nihility",
      "hsr-lord-ravager-erasure",
      "hsr-lord-ravager-harmony",
      "hsr-lord-ravager-voidranger",
      "hsr-lord-ravager-elation",
      "hsr-lord-ravager-strategist",
      "hsr-lord-ravager-sun-devourer",
      "hsr-lord-ravager-leviathan",
      "hsr-lord-ravager-forger",
      "hsr-lord-ravager-legion-architect",
      "hsr-lord-ravager-anti-nous",
      "hsr-lord-ravager-scepter"
    ];
    const orderIndex = loreBranchOrder.indexOf(question.id);
    if (orderIndex !== -1) {
      return orderIndex;
    }
    if (isTitanAssociatedHeirQuestion(question)) {
      return loreBranchOrder.length;
    }
    if (isStructuralNpcLoreQuestion(question)) {
      return loreBranchOrder.length + 1;
    }
  }

  if (MEANINGFUL_BRANCH_QUESTION_IDS.has(question.id)) {
    return 0;
  }

  if (isBroadAffiliationQuestion(question)) {
    return 1;
  }

  if (isGameplayOrRoleQuestion(question)) {
    return 2;
  }

  if (isFinalLayerQuestion(question)) {
    return 4;
  }

  return 3;
}

function isFinalLayerQuestion(question: DiscoveryQuestion) {
  return (
    question.traitPath === "global.primaryHairColor" ||
    question.traitPath === "global.hairColor" ||
    question.traitPath === "global.brightHair" ||
    question.traitPath === "global.primaryOutfitColor" ||
    question.traitPath === "global.outfitColors" ||
    question.traitPath === "global.weaponType" ||
    question.traitPath === "global.usesWeapon" ||
    question.traitPath === "global.personality"
  );
}

function getEligibleQuestions(
  questions: DiscoveryQuestion[],
  answers: AnswerRecord[],
  scores: CharacterScore[],
  candidatePool: DiscoveryCharacter[] = scores.map((score) => score.character)
) {
  const answeredIds = new Set(answers.map((answer) => answer.questionId));
  const questionMap = new Map(questions.map((question) => [question.id, question]));
  const globalAnswerCount = answers.filter((answer) => {
    const question = questionMap.get(answer.questionId);
    return question?.scope === "global";
  }).length;
  const likelyGameId = getLikelyGameId(scores);
  const hasBranchContext = hasMeaningfulBranchContext(answers, questionMap);
  const npcLoreBranch = isNpcLoreQuestionBranch(answers, questionMap, candidatePool);
  const allowGameQuestions =
    likelyGameId !== null &&
    (globalAnswerCount >= MIN_GLOBAL_ANSWERS_BEFORE_GAME_SCOPE || hasBranchContext || npcLoreBranch);

  const eligibleQuestions = questions.filter((question) => {
    if (answeredIds.has(question.id)) {
      return false;
    }
    if (isQuestionHardSuppressed(question, answers, questionMap)) {
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

  return applyNpcLoreQuestionGate(eligibleQuestions, answers, questionMap, candidatePool);
}

function applyNpcLoreQuestionGate(
  questions: DiscoveryQuestion[],
  answers: AnswerRecord[],
  questionMap: Map<string, DiscoveryQuestion>,
  candidatePool: DiscoveryCharacter[]
) {
  if (!isNpcLoreQuestionBranch(answers, questionMap, candidatePool)) {
    return questions;
  }

  const hasStructuralQuestion = questions.some(
    (question) => isStructuralNpcLoreQuestion(question) && getQuestionUsefulness(candidatePool, question) > 0
  );
  const lateTiebreakerStage = isLateTiebreakerStage(answers, candidatePool);
  const titanContextEstablished = hasTitanContext(answers, questionMap, candidatePool);

  return questions.filter((question) => {
    if (isTitanAssociatedHeirQuestion(question) && !titanContextEstablished) {
      return false;
    }

    if (!isNpcLoreLateOnlyQuestion(question)) {
      return true;
    }

    if (hasStructuralQuestion) {
      return false;
    }

    return lateTiebreakerStage && getQuestionUsefulness(candidatePool, question) > 0;
  });
}

function isTitanAssociatedHeirQuestion(question: DiscoveryQuestion) {
  return question.id.startsWith(TITAN_ASSOCIATED_HEIR_QUESTION_PREFIX);
}

function hasTitanContext(
  answers: AnswerRecord[],
  questionMap: Map<string, DiscoveryQuestion>,
  candidatePool: DiscoveryCharacter[]
) {
  if (hasAnswerForExpectedValue(answers, questionMap, "hsr.storyRole", "amphoreus-titan", true)) {
    return true;
  }

  if (candidatePool.length === 0) {
    return false;
  }

  const titanCount = candidatePool.filter((character) =>
    characterHasTraitValue(character, "hsr.storyRole", "amphoreus-titan")
  ).length;
  return titanCount / candidatePool.length >= 0.65;
}

function isNpcLoreQuestionBranch(
  answers: AnswerRecord[],
  questionMap: Map<string, DiscoveryQuestion>,
  candidatePool: DiscoveryCharacter[]
) {
  const npcLikely = hasAnswerForExpectedValue(answers, questionMap, "global.characterType", "npc", true);
  const nonPlayableLikely = hasAnswerForExpectedValue(answers, questionMap, "hsr.combatType", "Non-playable", true);

  if (npcLikely || nonPlayableLikely) {
    return true;
  }

  if (candidatePool.length === 0) {
    return false;
  }

  const npcLikeCount = candidatePool.filter(isNpcBranchCandidate).length;
  return npcLikeCount / candidatePool.length >= 0.65;
}

function isLateTiebreakerStage(answers: AnswerRecord[], candidatePool: DiscoveryCharacter[]) {
  return answers.length >= MIN_QUESTIONS_BEFORE_GUESS || candidatePool.length <= AMBIGUITY_TOP_CANDIDATE_COUNT;
}

function isNpcLoreLateOnlyQuestion(question: DiscoveryQuestion) {
  return (
    NPC_LORE_LATE_ONLY_IDS.has(question.id) ||
    question.traitPath === "global.genderPresentation" ||
    isFinalLayerQuestion(question)
  );
}

function isStructuralNpcLoreQuestion(question: DiscoveryQuestion) {
  return (
    NPC_LORE_STRUCTURAL_IDS.has(question.id) ||
    question.traitPath === "hsr.faction" ||
    question.traitPath === "hsr.worldOrRegion" ||
    (question.traitPath === "hsr.storyRole" && !NPC_LORE_LATE_ONLY_IDS.has(question.id))
  );
}

function getViableCandidates(
  characters: DiscoveryCharacter[],
  questionMap: Map<string, DiscoveryQuestion>,
  answers: AnswerRecord[]
) {
  const strongAnswers = answers.filter((answer) => CONFIDENT_ANSWERS.has(answer.answer));
  if (strongAnswers.length === 0) {
    return characters;
  }

  return characters.filter((character) =>
    strongAnswers.every((answer) => {
      const question = questionMap.get(answer.questionId);
      if (!question) {
        return true;
      }

      const matches = traitMatches(character, question);
      return POSITIVE_ANSWERS.has(answer.answer) ? matches : !matches;
    })
  );
}

function prioritizeResolvedCandidate(scores: CharacterScore[], candidate: DiscoveryCharacter) {
  const candidateScore = scores.find((score) => score.character.id === candidate.id);
  if (!candidateScore) {
    return scores;
  }

  return [candidateScore, ...scores.filter((score) => score.character.id !== candidate.id)];
}

function getAmbiguitySeparatorQuestion(
  questions: DiscoveryQuestion[],
  answers: AnswerRecord[],
  scores: CharacterScore[]
) {
  const top = scores[0];
  const runnerUp = scores[1];
  if (!top || !runnerUp) {
    return null;
  }

  const topCandidates = scores
    .slice(0, Math.min(AMBIGUITY_TOP_CANDIDATE_COUNT, scores.length))
    .map((score) => score.character);
  const eligibleQuestions = getEligibleQuestions(questions, answers, scores, topCandidates);
  const questionMap = new Map(questions.map((question) => [question.id, question]));

  const separatorQuestions = eligibleQuestions
    .map((question) => {
      const priority = getSeparatorTraitPriority(question, answers, questionMap);
      if (priority === -1) {
        return null;
      }

      const matchCount = topCandidates.filter((character) => traitMatches(character, question)).length;
      if (matchCount === 0 || matchCount === topCandidates.length) {
        return null;
      }

      const separatesTopPair = traitMatches(top.character, question) !== traitMatches(runnerUp.character, question);
      const splitScore = 1 - Math.abs(0.5 - matchCount / topCandidates.length) * 2;
      return {
        question,
        priority,
        separatesTopPair,
        splitScore
      };
    })
    .filter((item): item is {
      question: DiscoveryQuestion;
      priority: number;
      separatesTopPair: boolean;
      splitScore: number;
    } => item !== null)
    .sort((a, b) => {
      const aIsAlternateFormSeparator = isAlternateFormSeparator(a.question);
      const bIsAlternateFormSeparator = isAlternateFormSeparator(b.question);
      if (aIsAlternateFormSeparator !== bIsAlternateFormSeparator) {
        return aIsAlternateFormSeparator ? -1 : 1;
      }
      if (a.separatesTopPair !== b.separatesTopPair) {
        return a.separatesTopPair ? -1 : 1;
      }
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      if (a.splitScore !== b.splitScore) {
        return b.splitScore - a.splitScore;
      }
      return b.question.weight - a.question.weight;
    });

  return separatorQuestions[0]?.question ?? null;
}

function getSeparatorTraitPriority(
  question: DiscoveryQuestion,
  answers: AnswerRecord[],
  questionMap: Map<string, DiscoveryQuestion>
) {
  if (isAlternateFormSeparator(question)) {
    return 0;
  }

  const aeonLikely = hasAnswerForExpectedValue(answers, questionMap, "global.characterType", "aeon", true);
  const lordRavagerLikely = hasAnswerForExpectedValue(answers, questionMap, "hsr.storyRole", "lord-ravager", true);
  const chrysosHeirLikely = hasAnswerForExpectedValue(answers, questionMap, "hsr.faction", "Chrysos Heirs", true);
  const npcLikely = hasAnswerForExpectedValue(answers, questionMap, "global.characterType", "npc", true);
  const nonPlayableLikely = hasAnswerForExpectedValue(answers, questionMap, "hsr.combatType", "Non-playable", true);
  const priority = aeonLikely
    ? ["hsr.path", "hsr.faction", "hsr.storyRole", "hsr.worldOrRegion", "global.personality"]
    : lordRavagerLikely
      ? ["hsr.storyRole", "hsr.faction", "hsr.path", "hsr.worldOrRegion", "hsr.combatType"]
      : chrysosHeirLikely
        ? ["hsr.worldOrRegion", "hsr.faction", "hsr.path", "hsr.combatType", "global.primaryHairColor", "global.weaponType", "global.primaryOutfitColor", "global.personality"]
        : npcLikely || nonPlayableLikely
          ? ["global.characterType", "hsr.storyRole", "hsr.faction", "hsr.worldOrRegion", "hsr.path", "hsr.combatType", "global.weaponType", "global.personality"]
          : SEPARATOR_TRAIT_PRIORITY;

  return priority.indexOf(question.traitPath);
}

function isAlternateFormSeparator(question: DiscoveryQuestion) {
  return question.id === "hsr-alt-form";
}

function shouldRunAmbiguityGuard(
  answers: AnswerRecord[],
  questionMap: Map<string, DiscoveryQuestion>,
  top: CharacterScore,
  runnerUp: CharacterScore,
  wouldGuessNormally: boolean
) {
  if (wouldGuessNormally || answers.length >= MIN_QUESTIONS_BEFORE_GUESS || top.confidence >= GUESS_CONFIDENCE_THRESHOLD) {
    return true;
  }

  const confidenceGap = top.confidence - runnerUp.confidence;
  return confidenceGap < AMBIGUITY_CONFIDENCE_GAP_THRESHOLD && hasMeaningfulBranchContext(answers, questionMap);
}

function hasMeaningfulBranchContext(answers: AnswerRecord[], questionMap: Map<string, DiscoveryQuestion>) {
  return answers.some((answer) => {
    if (!CONFIDENT_ANSWERS.has(answer.answer)) {
      return false;
    }

    const question = questionMap.get(answer.questionId);
    return question ? MEANINGFUL_BRANCH_QUESTION_IDS.has(question.id) : false;
  });
}

function isQuestionHardSuppressed(
  question: DiscoveryQuestion,
  answers: AnswerRecord[],
  questionMap: Map<string, DiscoveryQuestion>
) {
  if (isExclusiveQuestionGroupSatisfied(question, answers, questionMap)) {
    return true;
  }

  const playableLikely = hasAnswerForExpectedValue(answers, questionMap, "global.characterType", "playable", true);
  const playableUnlikely = hasAnswerForExpectedValue(answers, questionMap, "global.characterType", "playable", false);
  const npcLikely = hasAnswerForExpectedValue(answers, questionMap, "global.characterType", "npc", true);
  const npcUnlikely = hasAnswerForExpectedValue(answers, questionMap, "global.characterType", "npc", false);
  const nonPlayableLikely = hasAnswerForExpectedValue(answers, questionMap, "hsr.combatType", "Non-playable", true);
  const aeonLikely = hasAnswerForExpectedValue(answers, questionMap, "global.characterType", "aeon", true);
  const lordRavagerLikely = hasAnswerForExpectedValue(answers, questionMap, "hsr.storyRole", "lord-ravager", true);

  if (npcUnlikely && question.id === "global-playable") {
    return true;
  }

  if (playableLikely && PLAYABLE_YES_SUPPRESSED_IDS.has(question.id)) {
    return true;
  }

  if (npcLikely && isNpcSuppressedQuestion(question)) {
    return true;
  }

  if (nonPlayableLikely && isNormalPlayableCombatQuestion(question)) {
    return true;
  }

  if (aeonLikely && isAeonSuppressedQuestion(question)) {
    return true;
  }

  if (lordRavagerLikely && isLordRavagerSuppressedQuestion(question)) {
    return true;
  }

  if (playableUnlikely && (question.traitPath === "hsr.rarity" || isNormalPlayableCombatQuestion(question))) {
    return true;
  }

  return false;
}

function isExclusiveQuestionGroupSatisfied(
  question: DiscoveryQuestion,
  answers: AnswerRecord[],
  questionMap: Map<string, DiscoveryQuestion>
) {
  const group = QUESTION_GROUPS[question.id];
  if (!group || !EXCLUSIVE_QUESTION_GROUPS.has(group)) {
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

function isNpcSuppressedQuestion(question: DiscoveryQuestion) {
  return (
    NPC_YES_SUPPRESSED_IDS.has(question.id) ||
    question.traitPath === "hsr.rarity" ||
    isNormalPlayableCombatQuestion(question)
  );
}

function isNormalPlayableCombatQuestion(question: DiscoveryQuestion) {
  return NORMAL_PLAYABLE_COMBAT_IDS.has(question.id);
}

function isAeonSuppressedQuestion(question: DiscoveryQuestion) {
  return (
    AEON_YES_SUPPRESSED_IDS.has(question.id) ||
    AEON_YES_SUPPRESSED_STORY_IDS.has(question.id) ||
    AEON_YES_SUPPRESSED_TRAIT_PATHS.has(question.traitPath)
  );
}

function isLordRavagerSuppressedQuestion(question: DiscoveryQuestion) {
  if (LORD_RAVAGER_ALLOWED_IDS.has(question.id)) {
    return false;
  }

  return (
    question.id === "global-playable" ||
    question.id === "hsr-aeon" ||
    question.id === "hsr-cosmic-entity" ||
    question.traitPath === "hsr.rarity" ||
    question.traitPath === "global.genderPresentation" ||
    question.traitPath === "global.brightHair" ||
    question.traitPath === "global.primaryHairColor" ||
    question.traitPath === "global.primaryOutfitColor" ||
    question.traitPath === "global.outfitColors" ||
    QUESTION_GROUPS[question.id] === "broad-role"
  );
}

function isQuestionRedundant(
  question: DiscoveryQuestion,
  answers: AnswerRecord[],
  questionMap: Map<string, DiscoveryQuestion>
) {
  if (isQuestionGroupSatisfied(question, answers, questionMap)) {
    return true;
  }

  if (isQuestionGroupRecentlyAsked(question, answers, questionMap) && !shouldBypassRecentGroupCooldown(question, answers, questionMap)) {
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

function shouldBypassRecentGroupCooldown(
  question: DiscoveryQuestion,
  answers: AnswerRecord[],
  questionMap: Map<string, DiscoveryQuestion>
) {
  const playableUnlikely = hasAnswerForExpectedValue(answers, questionMap, "global.characterType", "playable", false);
  return playableUnlikely && isLorePriorityQuestion(question);
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
  const answeredCategories = new Set(
    answers
      .map((answer) => questionMap.get(answer.questionId)?.category)
      .filter(Boolean)
  );
  const playableLikely = hasAnswerForExpectedValue(answers, questionMap, "global.characterType", "playable", true);
  const playableUnlikely = hasAnswerForExpectedValue(answers, questionMap, "global.characterType", "playable", false);
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
  let multiplier = 1;

  if (answers.length >= 3 && !answeredCategories.has("visual") && question.category === "visual") {
    multiplier *= 2.2;
  }

  if (answers.length >= 4 && !answeredCategories.has("gameplay") && question.category === "gameplay") {
    multiplier *= 1.8;
  }

  if (answers.length >= 4 && !answeredCategories.has("story") && question.category === "story") {
    multiplier *= 1.5;
  }

  if (!hasMeaningfulBranchContext(answers, questionMap) && answers.length < MIN_QUESTIONS_BEFORE_GUESS) {
    if (MEANINGFUL_BRANCH_QUESTION_IDS.has(question.id)) {
      return multiplier * 4.5;
    }

    if (question.category === "visual" || question.category === "fanbase") {
      return multiplier * 0.12;
    }

    if (question.category === "gameplay" || SEPARATOR_TRAIT_PRIORITY.includes(question.traitPath)) {
      return multiplier * 0.3;
    }

    if (question.category === "identity" || question.category === "story") {
      return multiplier * 1.4;
    }
  }

  if (
    playableLikely &&
    !loreMode &&
    (question.id === "hsr-aeon" ||
      question.id === "hsr-cosmic-entity" ||
      question.id === "hsr-lord-ravager" ||
      question.id === "hsr-antimatter-legion" ||
      question.id === "hsr-incubated-lord-ravager" ||
      question.id === "hsr-lore-character")
  ) {
    return 0.12;
  }

  if (aeonLikely) {
    if (question.traitPath === "hsr.path") {
      return multiplier * 4;
    }

    if (isAeonSuppressedQuestion(question)) {
      return 0;
    }
  }

  if (lordRavagerLikely) {
    if (question.traitPath === "hsr.storyRole" || question.id === "hsr-antimatter-legion") {
      return multiplier * 2.4;
    }

    if (isLordRavagerSuppressedQuestion(question)) {
      return 0;
    }
  }

  if (playableUnlikely && isLorePriorityQuestion(question)) {
    multiplier *= 2.4;
  }

  if (!loreMode) {
    return multiplier;
  }

  if (
    ipcLikely &&
    (question.id === "hsr-ten-stonehearts" ||
      question.id === "hsr-ten-stoneheart-role" ||
      question.id === "hsr-ipc-executive")
  ) {
    return multiplier * 2.4;
  }

  if (geniusLikely && question.id === "hsr-amphoreus") {
    return multiplier * 3.2;
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
    return multiplier * 0.18;
  }

  if (question.traitPath === "global.primaryOutfitColor") {
    return multiplier * 0.22;
  }

  if (question.traitPath === "global.genderPresentation") {
    return multiplier * 0.35;
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
    return multiplier * 2.1;
  }

  if (isLorePriorityQuestion(question)) {
    return multiplier * 1.8;
  }

  if (
    question.traitPath === "global.characterType" ||
    question.traitPath === "hsr.faction" ||
    question.traitPath === "hsr.storyRole" ||
    question.traitPath === "hsr.worldOrRegion"
  ) {
    return multiplier * 1.35;
  }

  if (question.traitPath === "hsr.path") {
    return multiplier * 1.15;
  }

  return multiplier;
}

function isLorePriorityQuestion(question: DiscoveryQuestion) {
  return (
    LORE_PRIORITY_IDS.has(question.id) ||
    question.traitPath === "hsr.storyRole" ||
    question.traitPath === "hsr.faction" ||
    question.traitPath === "hsr.worldOrRegion" ||
    question.traitPath === "hsr.path"
  );
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

    return positive ? POSITIVE_ANSWERS.has(answer.answer) : NEGATIVE_ANSWERS.has(answer.answer);
  });
}

export function getDiscoveryState(
  characters: DiscoveryCharacter[],
  questions: DiscoveryQuestion[],
  answers: AnswerRecord[]
): DiscoveryState {
  const discoveryCandidates = getDiscoveryEligibleCharacters(characters);
  const questionMap = new Map(questions.map((question) => [question.id, question]));
  const activeCandidatePool = getActiveCandidatePool(discoveryCandidates, questionMap, answers);
  const viableCandidates = getViableCandidates(activeCandidatePool, questionMap, answers);
  const deterministicCandidate = viableCandidates.length === 1 ? viableCandidates[0] : null;
  const scoredCandidates = scoreCharacters(activeCandidatePool, questions, answers);
  const scores = deterministicCandidate
    ? prioritizeResolvedCandidate(scoredCandidates, deterministicCandidate)
    : scoredCandidates;
  const likelyGameId = getLikelyGameId(scores);
  const top = scores[0];
  const runnerUp = scores[1];
  const confidenceGap = top && runnerUp ? top.confidence - runnerUp.confidence : 1;
  const answeredCategories = new Set(
    answers
      .filter((answer) => answer.answer !== "not_sure")
      .map((answer) => questionMap.get(answer.questionId)?.category)
      .filter(Boolean)
  );
  const hasEnoughQuestionDepth =
    answers.length >= MIN_QUESTIONS_BEFORE_GUESS &&
    answeredCategories.has("identity") &&
    answeredCategories.has("story") &&
    answeredCategories.has("visual");
  const hasConfidentNormalGuess =
    hasEnoughQuestionDepth &&
    top.confidence >= NORMAL_GUESS_CONFIDENCE_THRESHOLD &&
    confidenceGap >= NORMAL_GUESS_GAP_THRESHOLD;
  const rankedQuestion = deterministicCandidate ? null : getNextQuestion(activeCandidatePool, questions, answers, scores);
  const usefulSeparator =
    deterministicCandidate || !top || !runnerUp ? null : getAmbiguitySeparatorQuestion(questions, answers, scores);
  const ambiguitySeparator =
    !usefulSeparator || !top || !runnerUp || !shouldRunAmbiguityGuard(answers, questionMap, top, runnerUp, hasConfidentNormalGuess)
      ? null
      : usefulSeparator;
  const useAmbiguitySeparator =
    !deterministicCandidate &&
    ambiguitySeparator !== null &&
    shouldUseAmbiguitySeparator(ambiguitySeparator, rankedQuestion, answers, questionMap);
  const nextQuestion = deterministicCandidate
    ? null
    : useAmbiguitySeparator
      ? ambiguitySeparator
      : rankedQuestion;
  const shouldGuess =
    deterministicCandidate !== null || (nextQuestion === null && usefulSeparator === null && hasConfidentNormalGuess);

  return {
    scores,
    nextQuestion,
    likelyGameId,
    shouldGuess,
    questionCount: answers.length
  };
}

function shouldUseAmbiguitySeparator(
  ambiguitySeparator: DiscoveryQuestion,
  rankedQuestion: DiscoveryQuestion | null,
  answers: AnswerRecord[],
  questionMap: Map<string, DiscoveryQuestion>
) {
  if (!rankedQuestion) {
    return true;
  }

  if (isAlternateFormSeparator(ambiguitySeparator)) {
    return true;
  }

  const rankedQuestionPhase = getQuestionPhase(rankedQuestion, answers, questionMap);
  const ambiguitySeparatorPhase = getQuestionPhase(ambiguitySeparator, answers, questionMap);

  if (rankedQuestionPhase <= 1) {
    return false;
  }

  if (isCoreBranchQuestion(rankedQuestion, answers, questionMap)) {
    return false;
  }

  if (ambiguitySeparatorPhase !== rankedQuestionPhase) {
    return ambiguitySeparatorPhase < rankedQuestionPhase;
  }

  return (
    getQuestionPhaseRank(ambiguitySeparator, answers, questionMap) <=
    getQuestionPhaseRank(rankedQuestion, answers, questionMap)
  );
}

function isCoreBranchQuestion(
  question: DiscoveryQuestion,
  answers: AnswerRecord[],
  questionMap: Map<string, DiscoveryQuestion>
) {
  const playableLikely = hasAnswerForExpectedValue(answers, questionMap, "global.characterType", "playable", true);
  const npcUnlikely = hasAnswerForExpectedValue(answers, questionMap, "global.characterType", "npc", false);
  const aeonLikely = hasAnswerForExpectedValue(answers, questionMap, "global.characterType", "aeon", true);
  const lordRavagerLikely = hasAnswerForExpectedValue(answers, questionMap, "hsr.storyRole", "lord-ravager", true);

  if (aeonLikely) {
    return question.traitPath === "hsr.path";
  }

  if (lordRavagerLikely) {
    return (
      question.id === "hsr-antimatter-legion" ||
      question.id === "hsr-incubated-lord-ravager" ||
      question.id === "hsr-destruction"
    );
  }

  return (playableLikely || npcUnlikely) && (question.id === "hsr-chrysos-heir" || question.id === "hsr-amphoreus");
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
