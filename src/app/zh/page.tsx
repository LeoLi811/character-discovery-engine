import { DiscoveryApp } from "@/components/DiscoveryApp";
import { discoveryCharacters, discoveryGames, discoveryQuestions } from "@/lib/discovery-data";

export default function ChineseHome() {
  return (
    <div className="page-shell">
      <DiscoveryApp characters={discoveryCharacters} questions={discoveryQuestions} games={discoveryGames} locale="zh" />
    </div>
  );
}
