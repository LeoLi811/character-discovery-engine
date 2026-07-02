import { CompareClient } from "@/components/CompareClient";
import { characters } from "@/lib/characters";

export default function ComparePage() {
  return (
    <div className="page-shell">
      <section className="page-title">
        <div>
          <h1>Compare character records.</h1>
          <p>
            Select up to four characters and compare their current catalog fields. This view is
            intentionally simple in V1 so later analysis can add richer metrics without changing
            the browsing flow.
          </p>
        </div>
      </section>
      <CompareClient characters={characters} />
    </div>
  );
}
