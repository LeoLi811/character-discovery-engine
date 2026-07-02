import Link from "next/link";
import { ArrowRight, Database } from "lucide-react";
import { getCharacterColors, getInitials, getPopularityScore } from "@/lib/characters";
import type { Character } from "@/lib/types";

export function CharacterCard({ character }: { character: Character }) {
  const score = getPopularityScore(character);
  const colors = getCharacterColors(character);

  return (
    <article className="character-card">
      <div
        className="character-art"
        style={
          {
            "--c1": colors.primary,
            "--c2": colors.secondary
          } as React.CSSProperties
        }
      >
        <span className="sigil" aria-hidden="true">
          {getInitials(character.name)}
        </span>
      </div>
      <div className="card-body">
        <div>
          <p className="meta">{character.franchise}</p>
          <h2>{character.name}</h2>
        </div>
        <p className="muted">{character.summary}</p>
        <div className="pill-row">
          <span className="pill">{character.role}</span>
          <span className="pill">{character.popularityTier}</span>
          {character.visualTags.clothing.slice(0, 2).map((tag) => (
            <span className="pill" key={tag}>
              {tag}
            </span>
          ))}
        </div>
        <div className="score" aria-label={`Popularity score ${score} out of 100`}>
          <Database size={16} aria-hidden="true" />
          <div className="score-bar">
            <span className="score-fill" style={{ width: `${score}%` }} />
          </div>
          <strong>{score}</strong>
        </div>
        <Link className="text-button" href={`/characters/${character.slug}`}>
          Open record <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
