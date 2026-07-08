"use client";

import { useMemo, useState } from "react";
import { GitCompareArrows } from "lucide-react";
import type { Character } from "@/lib/types";
import { getPopularityScore } from "@/lib/characters";
import { translateCharacter, uiText, type Locale } from "@/lib/i18n";

export function CompareClient({ characters, locale = "en" }: { characters: Character[]; locale?: Locale }) {
  const defaultSlugs = characters.slice(0, 4).map((character) => character.slug);
  const [selectedSlugs, setSelectedSlugs] = useState(defaultSlugs);
  const text = uiText[locale].compare;

  const selectedCharacters = useMemo(
    () => selectedSlugs.map((slug) => characters.find((character) => character.slug === slug)).filter(Boolean) as Character[],
    [characters, selectedSlugs]
  );

  function setSlot(index: number, slug: string) {
    setSelectedSlugs((current) => current.map((currentSlug, currentIndex) => (currentIndex === index ? slug : currentSlug)));
  }

  return (
    <section>
      <div className="panel">
        <h2>
          <GitCompareArrows size={18} aria-hidden="true" /> {text.select}
        </h2>
        <div className="compare-picker">
          {selectedSlugs.map((slug, index) => (
            <div className="field" key={`${slug}-${index}`}>
              <label htmlFor={`compare-${index}`}>{text.slot} {index + 1}</label>
              <select id={`compare-${index}`} value={slug} onChange={(event) => setSlot(index, event.target.value)}>
                {characters.map((character) => (
                  <option value={character.slug} key={character.slug}>
                    {translateCharacter(character, locale).name}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>

      <div className="compare-grid">
        {selectedCharacters.map((character) => {
          const translated = translateCharacter(character, locale);
          return (
          <article className="panel" key={character.slug}>
            <p className="meta">{translated.franchise}</p>
            <h2>{translated.name}</h2>
            <dl className="info-list">
              <div>
                <dt>{text.score}</dt>
                <dd>{getPopularityScore(character)} / 100</dd>
              </div>
              <div>
                <dt>{text.role}</dt>
                <dd>{translated.role}</dd>
              </div>
              <div>
                <dt>{text.tier}</dt>
                <dd>{translated.popularityTier}</dd>
              </div>
              <div>
                <dt>{text.games}</dt>
                <dd>{translated.games.join(", ")}</dd>
              </div>
              <div>
                <dt>{text.clothing}</dt>
                <dd>{translated.visualTags.clothing.join(", ")}</dd>
              </div>
              <div>
                <dt>{text.accessories}</dt>
                <dd>{translated.visualTags.accessories.join(", ")}</dd>
              </div>
            </dl>
          </article>
        );
        })}
      </div>
    </section>
  );
}
