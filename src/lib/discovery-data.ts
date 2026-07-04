import charactersData from "@/data/games/hsr/discovery-characters.json";
import gamesData from "@/data/games/hsr/discovery-games.json";
import questionsData from "@/data/games/hsr/discovery-questions.json";
import type { DiscoveryCharacter, DiscoveryQuestion, GameRecord } from "@/lib/discovery-types";

export const discoveryCharacters = charactersData as DiscoveryCharacter[];
export const discoveryGames = gamesData as GameRecord[];
export const discoveryQuestions = questionsData as DiscoveryQuestion[];

export function getGame(gameId: string) {
  return discoveryGames.find((game) => game.id === gameId);
}

export function getQuestion(questionId: string) {
  return discoveryQuestions.find((question) => question.id === questionId);
}
