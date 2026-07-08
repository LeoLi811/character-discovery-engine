import { CompareClient } from "@/components/CompareClient";
import { characters } from "@/lib/characters";
import { uiText } from "@/lib/i18n";

export default function ComparePage() {
  const text = uiText.en.compare;

  return (
    <div className="page-shell">
      <section className="page-title">
        <div>
          <h1>{text.title}</h1>
          <p>{text.body}</p>
        </div>
      </section>
      <CompareClient characters={characters} />
    </div>
  );
}
