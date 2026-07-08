import { DiscoveryApp } from "@/components/DiscoveryApp";
import { discoveryCandidateCharacters, discoveryGames, discoveryQuestions } from "@/lib/discovery-data";

export default function Home() {
  return (
    <div className="page-shell">
      <DiscoveryApp characters={discoveryCandidateCharacters} questions={discoveryQuestions} games={discoveryGames} />
    </div>
  );
}
