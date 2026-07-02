"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";
import { CharacterCard } from "@/components/CharacterCard";
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
  filterOptions
}: {
  characters: Character[];
  filterOptions: FilterOptions;
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

  return (
    <section className="catalog-layout" aria-label="Character catalog explorer">
      <aside className="panel filter-panel">
        <h2>
          <SlidersHorizontal size={18} aria-hidden="true" /> Filters
        </h2>
        <div className="field">
          <label htmlFor="catalog-search">Search</label>
          <div className="search-shell">
            <Search size={16} aria-hidden="true" />
            <input
              id="catalog-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Name, franchise, clothing..."
            />
          </div>
        </div>
        <FilterSelect label="Franchise" value={franchise} options={filterOptions.franchises} onChange={setFranchise} />
        <FilterSelect label="Game" value={game} options={filterOptions.games} onChange={setGame} />
        <FilterSelect label="Role" value={role} options={filterOptions.roles} onChange={setRole} />
        <FilterSelect label="Popularity" value={tier} options={filterOptions.tiers} onChange={setTier} />
        <FilterSelect label="Style tag" value={styleTag} options={filterOptions.styleTags} onChange={setStyleTag} />
        <button className="text-button" type="button" onClick={resetFilters}>
          <X size={16} aria-hidden="true" /> Clear filters
        </button>
      </aside>
      <div>
        <p className="muted">{filteredCharacters.length} matching character records</p>
        <div className="card-grid">
          {filteredCharacters.map((character) => (
            <CharacterCard character={character} key={character.slug} />
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
  onChange
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  const id = `filter-${label.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <select id={id} value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="All">All</option>
        {options.map((option) => (
          <option value={option} key={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
