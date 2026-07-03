import { CompareClient } from "@/components/CompareClient";
import { characters } from "@/lib/characters";
import { uiText } from "@/lib/i18n";

export default function ChineseComparePage() {
  const text = uiText.zh.compare;

  return (
    <div className="page-shell">
      <section className="page-title">
        <div>
          <h1>{text.title}</h1>
          <p>{text.body}</p>
        </div>
      </section>
      <CompareClient characters={characters} locale="zh" />
    </div>
  );
}
