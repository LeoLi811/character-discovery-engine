import { notFound } from "next/navigation";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { characters, getCharacter, getCharacterColors, getInitials, getPopularityScore } from "@/lib/characters";

export function generateStaticParams() {
  return characters.map((character) => ({ slug: character.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const character = getCharacter(slug);

  return {
    title: character ? `${character.name} | Character Atlas` : "Character not found"
  };
}

export default async function CharacterPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const character = getCharacter(slug);

  if (!character) {
    notFound();
  }

  const score = getPopularityScore(character);
  const colors = getCharacterColors(character);

  return (
    <div className="page-shell">
      <section className="page-title">
        <div>
          <p className="meta">{character.franchise}</p>
          <h1>{character.name}</h1>
          <p>{character.summary}</p>
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
              {getInitials(character.name)}
            </span>
          </div>
          <dl className="info-list">
            <Info label="Aliases" value={character.aliases.length ? character.aliases.join(", ") : "None listed"} />
            <Info label="Role" value={character.role} />
            <Info label="Popularity tier" value={character.popularityTier} />
            <Info label="Publisher" value={character.publisher} />
            <Info label="Developer" value={character.developer} />
            <Info label="Games" value={character.games.join(", ")} />
            <Info label="Silhouette" value={character.visualTags.silhouette} />
            <Info label="Clothing" value={character.visualTags.clothing.join(", ")} />
            <Info label="Accessories" value={character.visualTags.accessories.join(", ")} />
          </dl>
        </div>
        <aside className="panel">
          <h2>Popularity score</h2>
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
          <h2>Popularity signals</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Source</th>
                  <th>Metric</th>
                  <th>Value</th>
                  <th>Confidence</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {character.popularitySignals.map((signal) => (
                  <tr key={`${signal.source}-${signal.metricType}`}>
                    <td>{signal.source}</td>
                    <td>{signal.metricType}</td>
                    <td>
                      {signal.value} / {signal.maxValue}
                    </td>
                    <td>{signal.confidence}</td>
                    <td>{signal.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="panel">
          <h2>Analysis notes</h2>
          <ul>
            {character.analysisNotes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
          <h3>Sources</h3>
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
