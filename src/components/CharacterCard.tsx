import Link from "next/link";
import { ArrowRight, Database } from "lucide-react";
import { getCharacterColors, getInitials, getPopularityScore } from "@/lib/characters";
import { localizedPath, translateCharacter, uiText, type Locale } from "@/lib/i18n";
import type { Character } from "@/lib/types";

export function CharacterCard({ character, locale = "en" }: { character: Character; locale?: Locale }) {
  const score = getPopularityScore(character);
  const colors = getCharacterColors(character);
  const translated = translateCharacter(character, locale);
  const text = uiText[locale].catalog;

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
          {getInitials(translated.name)}
        </span>
      </div>
      <div className="card-body">
        <div>
          <p className="meta">{translated.franchise}</p>
          <h2>{translated.name}</h2>
        </div>
        <p className="muted">{translated.summary}</p>
        <div className="pill-row">
          <span className="pill">{translated.role}</span>
          <span className="pill">{translated.popularityTier}</span>
          {translated.visualTags.clothing.slice(0, 2).map((tag) => (
            <span className="pill" key={tag}>
              {tag}
            </span>
          ))}
        </div>
        <div className="score" aria-label={`${text.popularityScore} ${score} / 100`}>
          <Database size={16} aria-hidden="true" />
          <div className="score-bar">
            <span className="score-fill" style={{ width: `${score}%` }} />
          </div>
          <strong>{score}</strong>
        </div>
        <Link className="text-button" href={localizedPath(`/characters/${character.slug}`, locale)}>
          {text.openRecord} <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
