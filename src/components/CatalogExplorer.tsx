"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";
import { CharacterCard } from "@/components/CharacterCard";
import { translateTerm, uiText, type Locale } from "@/lib/i18n";
import type { Character, PopularityTier } from "@/lib/types";

type FilterOptions = {
  franchises: string[];
  roles: string[];
  games: string[];
  tiers: PopularityTier[];
  styleTags: string[];
};

export function CatalogExplorer({
  characters,
  filterOptions,
  locale = "en"
}: {
  characters: Character[];
  filterOptions: FilterOptions;
  locale?: Locale;
}) {
  const [query, setQuery] = useState("");
  const [franchise, setFranchise] = useState("All");
  const [role, setRole] = useState("All");
  const [game, setGame] = useState("All");
  const [tier, setTier] = useState("All");
  const [styleTag, setStyleTag] = useState("All");

  const filteredCharacters = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return characters.filter((character) => {
      const searchableText = [
        character.name,
        ...character.aliases,
        character.franchise,
        character.publisher,
        character.developer,
        character.summary,
        ...character.games,
        ...character.visualTags.clothing,
        ...character.visualTags.colors,
        ...character.visualTags.accessories
      ]
        .join(" ")
        .toLowerCase();

      return (
        (!normalizedQuery || searchableText.includes(normalizedQuery)) &&
        (franchise === "All" || character.franchise === franchise) &&
        (role === "All" || character.role === role) &&
        (game === "All" || character.games.includes(game)) &&
        (tier === "All" || character.popularityTier === tier) &&
        (styleTag === "All" ||
          character.visualTags.clothing.includes(styleTag) ||
          character.visualTags.colors.includes(styleTag) ||
          character.visualTags.accessories.includes(styleTag))
      );
    });
  }, [characters, franchise, game, query, role, styleTag, tier]);

  function resetFilters() {
    setQuery("");
    setFranchise("All");
    setRole("All");
    setGame("All");
    setTier("All");
    setStyleTag("All");
  }
  const text = uiText[locale].catalog;

  return (
    <section className="catalog-layout" aria-label="Character catalog explorer">
      <aside className="panel filter-panel">
        <h2>
          <SlidersHorizontal size={18} aria-hidden="true" /> {text.filters}
        </h2>
        <div className="field">
          <label htmlFor="catalog-search">{text.search}</label>
          <div className="search-shell">
            <Search size={16} aria-hidden="true" />
            <input
              id="catalog-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={text.searchPlaceholder}
            />
          </div>
        </div>
        <FilterSelect label={text.franchise} value={franchise} options={filterOptions.franchises} onChange={setFranchise} locale={locale} />
        <FilterSelect label={text.game} value={game} options={filterOptions.games} onChange={setGame} locale={locale} />
        <FilterSelect label={text.role} value={role} options={filterOptions.roles} onChange={setRole} locale={locale} />
        <FilterSelect label={text.popularity} value={tier} options={filterOptions.tiers} onChange={setTier} locale={locale} />
        <FilterSelect label={text.styleTag} value={styleTag} options={filterOptions.styleTags} onChange={setStyleTag} locale={locale} />
        <button className="text-button" type="button" onClick={resetFilters}>
          <X size={16} aria-hidden="true" /> {text.clearFilters}
        </button>
      </aside>
      <div>
        <p className="muted">{filteredCharacters.length} {text.matching}</p>
        <div className="card-grid">
          {filteredCharacters.map((character) => (
            <CharacterCard character={character} key={character.slug} locale={locale} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
  locale = "en"
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  locale?: Locale;
}) {
  const id = `filter-${label.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <select id={id} value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="All">{uiText[locale].catalog.all}</option>
        {options.map((option) => (
          <option value={option} key={option}>
            {translateTerm(option, locale)}
          </option>
        ))}
      </select>
    </div>
  );
}
