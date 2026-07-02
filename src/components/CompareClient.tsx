"use client";

import { useMemo, useState } from "react";
import { GitCompareArrows } from "lucide-react";
import type { Character } from "@/lib/types";
import { getPopularityScore } from "@/lib/characters";

export function CompareClient({ characters }: { characters: Character[] }) {
  const defaultSlugs = characters.slice(0, 4).map((character) => character.slug);
  const [selectedSlugs, setSelectedSlugs] = useState(defaultSlugs);

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
          <GitCompareArrows size={18} aria-hidden="true" /> Select 2-4 characters
        </h2>
        <div className="compare-picker">
          {selectedSlugs.map((slug, index) => (
            <div className="field" key={`${slug}-${index}`}>
              <label htmlFor={`compare-${index}`}>Slot {index + 1}</label>
              <select id={`compare-${index}`} value={slug} onChange={(event) => setSlot(index, event.target.value)}>
                {characters.map((character) => (
                  <option value={character.slug} key={character.slug}>
                    {character.name}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>

      <div className="compare-grid">
        {selectedCharacters.map((character) => (
          <article className="panel" key={character.slug}>
            <p className="meta">{character.franchise}</p>
            <h2>{character.name}</h2>
            <dl className="info-list">
              <div>
                <dt>Score</dt>
                <dd>{getPopularityScore(character)} / 100</dd>
              </div>
              <div>
                <dt>Role</dt>
                <dd>{character.role}</dd>
              </div>
              <div>
                <dt>Tier</dt>
                <dd>{character.popularityTier}</dd>
              </div>
              <div>
                <dt>Games</dt>
                <dd>{character.games.join(", ")}</dd>
              </div>
              <div>
                <dt>Clothing</dt>
                <dd>{character.visualTags.clothing.join(", ")}</dd>
              </div>
              <div>
                <dt>Accessories</dt>
                <dd>{character.visualTags.accessories.join(", ")}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}
