import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const characters = readJson("src/data/discovery-characters.json");
const games = readJson("src/data/discovery-games.json");
const questions = readJson("src/data/discovery-questions.json");
const errors = [];
const warnings = [];
const gameIds = new Set(games.map((game) => game.id));
const characterIds = new Set();
const questionIds = new Set();

for (const character of characters) {
  if (!character.id || characterIds.has(character.id)) {
    errors.push(`Invalid or duplicate character id: ${character.id}`);
  }
  characterIds.add(character.id);
  if (!gameIds.has(character.gameId)) {
    errors.push(`${character.id}: unknown gameId '${character.gameId}'.`);
  }
  for (const group of ["global", "hsr"]) {
    if (!character[group] || typeof character[group] !== "object") {
      errors.push(`${character.id}: missing ${group} trait group.`);
    }
  }
  for (const required of ["game", "genre", "visualStyle", "characterType", "hairColor", "primaryHairColor", "usesWeapon", "outfitColors", "primaryOutfitColor"]) {
    if (!(required in character.global)) {
      errors.push(`${character.id}: missing global.${required}.`);
    }
  }
  if (Array.isArray(character.global.hairColor) && !character.global.hairColor.includes(character.global.primaryHairColor)) {
    errors.push(`${character.id}: global.primaryHairColor must also appear in global.hairColor.`);
  }
  if (Array.isArray(character.global.outfitColors) && !character.global.outfitColors.includes(character.global.primaryOutfitColor)) {
    errors.push(`${character.id}: global.primaryOutfitColor must also appear in global.outfitColors.`);
  }
  for (const required of ["path", "combatType", "faction", "worldOrRegion", "rarity"]) {
    if (!(required in character.hsr)) {
      errors.push(`${character.id}: missing hsr.${required}.`);
    }
  }
  if (!Array.isArray(character.evidence) || character.evidence.length === 0) {
    warnings.push(`${character.id}: no evidence records.`);
  }
}

for (const question of questions) {
  if (!question.id || questionIds.has(question.id)) {
    errors.push(`Invalid or duplicate question id: ${question.id}`);
  }
  questionIds.add(question.id);
  if (question.scope !== "global") {
    const gameId = question.scope.replace("game:", "");
    if (!gameIds.has(gameId)) {
      errors.push(`${question.id}: unknown scoped game '${gameId}'.`);
    }
  }
  const supported = characters.some((character) => getTraitValue(character, question.traitPath) !== undefined);
  if (!supported) {
    errors.push(`${question.id}: traitPath '${question.traitPath}' does not exist on any character.`);
  }
  const splitCount = characters.filter((character) => traitMatches(character, question)).length;
  if (splitCount === 0) {
    warnings.push(`${question.id}: matches no characters.`);
  }
}

if (warnings.length > 0) {
  console.warn(`Discovery validation warnings (${warnings.length}):`);
  for (const warning of warnings) {
    console.warn(`- ${warning}`);
  }
}

if (errors.length > 0) {
  console.error(`Discovery validation failed (${errors.length}):`);
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(`Discovery validation passed for ${characters.length} characters and ${questions.length} questions.`);

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function getTraitValue(character, traitPath) {
  return traitPath.split(".").reduce((value, key) => {
    if (value && typeof value === "object" && key in value) {
      return value[key];
    }
    return undefined;
  }, character);
}

function traitMatches(character, question) {
  const value = getTraitValue(character, question.traitPath);
  if (Array.isArray(value)) {
    return value.includes(question.expectedValue);
  }
  return value === question.expectedValue;
}
