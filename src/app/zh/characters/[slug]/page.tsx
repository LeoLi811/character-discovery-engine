import { notFound } from "next/navigation";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { characters, getCharacter, getCharacterColors, getInitials, getPopularityScore } from "@/lib/characters";
import { translateCharacter, translateTerm, uiText } from "@/lib/i18n";

export function generateStaticParams() {
  return characters.map((character) => ({ slug: character.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const character = getCharacter(slug);
  const translated = character ? translateCharacter(character, "zh") : null;

  return {
    title: translated ? `${translated.name} | 角色发现引擎` : uiText.zh.detail.notFoundTitle
  };
}

export default async function ChineseCharacterPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const character = getCharacter(slug);

  if (!character) {
    notFound();
  }

  const text = uiText.zh.detail;
  const translated = translateCharacter(character, "zh");
  const score = getPopularityScore(character);
  const colors = getCharacterColors(character);

  return (
    <div className="page-shell">
      <section className="page-title">
        <div>
          <p className="meta">{translated.franchise}</p>
          <h1>{translated.name}</h1>
          <p>{translated.summary}</p>
        </div>
      </section>
      <section className="detail-grid">
        <div className="panel">
          <div
            className="character-art"
            style={
              {
                "--c1": colors.primary,
                "--c2": colors.secondary,
                borderRadius: 8,
                marginBottom: 16
              } as React.CSSProperties
            }
          >
            <span className="sigil" aria-hidden="true">
              {getInitials(translated.name)}
            </span>
          </div>
          <dl className="info-list">
            <Info label={text.aliases} value={character.aliases.length ? character.aliases.join(", ") : text.noneListed} />
            <Info label={text.role} value={translated.role} />
            <Info label={text.popularityTier} value={translated.popularityTier} />
            <Info label={text.publisher} value={character.publisher} />
            <Info label={text.developer} value={character.developer} />
            <Info label={text.games} value={translated.games.join(", ")} />
            <Info label={text.silhouette} value={translated.visualTags.silhouette} />
            <Info label={text.clothing} value={translated.visualTags.clothing.join(", ")} />
            <Info label={text.accessories} value={translated.visualTags.accessories.join(", ")} />
          </dl>
        </div>
        <aside className="panel">
          <h2>{text.popularityScore}</h2>
          <div className="score" style={{ margin: "14px 0" }}>
            <div className="score-bar">
              <span className="score-fill" style={{ width: `${score}%` }} />
            </div>
            <strong>{score}</strong>
          </div>
          <div className="pill-row">
            {character.visualTags.colors.map((color) => (
              <span className="pill" key={color}>
                <span
                  aria-hidden="true"
                  style={{
                    display: "inline-block",
                    width: 12,
                    height: 12,
                    borderRadius: 999,
                    background: color,
                    marginRight: 6
                  }}
                />
                {color}
              </span>
            ))}
          </div>
        </aside>
      </section>
      <section className="detail-grid" style={{ marginTop: 16 }}>
        <div className="panel">
          <h2>{text.popularitySignals}</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>{text.source}</th>
                  <th>{text.metric}</th>
                  <th>{text.value}</th>
                  <th>{text.confidence}</th>
                  <th>{text.notes}</th>
                </tr>
              </thead>
              <tbody>
                {character.popularitySignals.map((signal) => (
                  <tr key={`${signal.source}-${signal.metricType}`}>
                    <td>{signal.source}</td>
                    <td>{translateTerm(signal.metricType, "zh")}</td>
                    <td>
                      {signal.value} / {signal.maxValue}
                    </td>
                    <td>{translateTerm(signal.confidence, "zh")}</td>
                    <td>{signal.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="panel">
          <h2>{text.analysisNotes}</h2>
          <ul>
            {character.analysisNotes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
          <h3>{text.sources}</h3>
          <ul>
            {character.citations.map((citation) => (
              <li key={citation.url}>
                <Link href={citation.url} target="_blank" rel="noreferrer">
                  {citation.title} <ExternalLink size={14} aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
