import charactersData from "@/data/characters.json";
import type { Character, PopularityTier } from "@/lib/types";

export const characters = charactersData as Character[];

export function getCharacter(slug: string) {
  return characters.find((character) => character.slug === slug);
}

export function getPopularityScore(character: Character) {
  const total = character.popularitySignals.reduce((sum, signal) => {
    return sum + (signal.value / signal.maxValue) * 100;
  }, 0);

  return Math.round(total / character.popularitySignals.length);
}

export function getInitials(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part.at(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function getCharacterColors(character: Character) {
  const palette = character.visualTags.colors;
  return {
    primary: palette[0] ?? "#65d48b",
    secondary: palette[1] ?? "#72b8ff"
  };
}

export function getFilterOptions() {
  const unique = (values: string[]) => Array.from(new Set(values)).sort();

  return {
    franchises: unique(characters.map((character) => character.franchise)),
    roles: unique(characters.map((character) => character.role)),
    games: unique(characters.flatMap((character) => character.games)),
    tiers: unique(characters.map((character) => character.popularityTier)) as PopularityTier[],
    styleTags: unique(
      characters.flatMap((character) => [
        ...character.visualTags.clothing,
        ...character.visualTags.colors,
        ...character.visualTags.accessories
      ])
    )
  };
}

export function getSummaryStats() {
  const scores = characters.map(getPopularityScore);
  const averageScore = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
  const franchises = new Set(characters.map((character) => character.franchise)).size;
  const games = new Set(characters.flatMap((character) => character.games)).size;
  const citations = characters.reduce((sum, character) => sum + character.citations.length, 0);

  return {
    characterCount: characters.length,
    franchises,
    games,
    averageScore,
    citations
  };
}

export function getTopCharacters(limit = 10) {
  return [...characters]
    .sort((a, b) => getPopularityScore(b) - getPopularityScore(a))
    .slice(0, limit);
}

export function getCountsBy<K extends string>(items: K[]) {
  return Array.from(
    items.reduce((map, item) => map.set(item, (map.get(item) ?? 0) + 1), new Map<K, number>())
  ).sort((a, b) => b[1] - a[1]);
}
