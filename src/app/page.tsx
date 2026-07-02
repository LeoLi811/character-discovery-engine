import { DiscoveryApp } from "@/components/DiscoveryApp";
import { discoveryCharacters, discoveryGames, discoveryQuestions } from "@/lib/discovery-data";

export default function Home() {
  return (
    <div className="page-shell">
      <DiscoveryApp characters={discoveryCharacters} questions={discoveryQuestions} games={discoveryGames} />
    </div>
  );
}
