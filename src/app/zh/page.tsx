import { DiscoveryApp } from "@/components/DiscoveryApp";
import { discoveryCandidateCharacters, discoveryGames, discoveryQuestions } from "@/lib/discovery-data";

export default function ChineseHome() {
  return (
    <div className="page-shell">
      <DiscoveryApp characters={discoveryCandidateCharacters} questions={discoveryQuestions} games={discoveryGames} locale="zh" />
    </div>
  );
}
