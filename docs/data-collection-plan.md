# Data Collection Plan

## Goal

Build a reliable character dataset before doing deep analysis or polishing the website. Every character record should be traceable, comparable, and honest about confidence.

## V1 Collection Units

Each character should have:

- Identity: name, slug, aliases, franchise, games, publisher, developer
- Context: role, short summary, analysis notes
- Popularity signals: source, metric type, value, max value, collected date, confidence, notes
- Visual traits: clothing, colors, accessories, silhouette
- Citations: title, URL, source type, retrieval date, notes

## Source Priority

1. Official game/franchise pages for canonical names, games, publisher, developer, and official descriptions.
2. Wikidata for stable identifiers and cross-source metadata.
3. IGDB or RAWG for game database enrichment when API keys are available.
4. Wikipedia/Fandom-style pages only for exploratory notes, not final scoring.
5. Manual curated popularity signals only when labeled as curated and given confidence.

## Popularity Signal Ideas

Use separate signals instead of one hidden score:

- Recognition baseline: manual analyst estimate for V1.
- Wikidata metadata depth: existence and completeness of entity data.
- Pageview/share-of-attention: future Wikimedia pageview or search trend input.
- Cross-media presence: film, TV, animation, merchandise, or crossover visibility.
- Community signal: fan art, forum activity, subreddit scale, cosplay visibility, or meme presence.
- Franchise centrality: recurrence across games and importance to the franchise.

## Collection Rules

- Do not publish a character without at least one citation.
- Do not mix popularity signals into one number during research; keep each signal separate.
- Use confidence labels honestly: `high` for source-backed numbers, `medium` for curated estimates with clear rationale, `low` for placeholders or proxy signals.
- Store copyrighted artwork references only as cited source URLs or licensed asset metadata. Do not download copyrighted artwork into the repo.
- Record gaps as `analysisNotes` so later analysis knows what is missing.

## Batch Strategy

Start with 50-75 characters across several categories:

- Platform mascots
- RPG/JRPG protagonists and villains
- Fighting game roster anchors
- Shooter/action protagonists
- Horror/survival characters
- Live-service or multiplayer heroes
- Non-human, avatar, and non-combat characters

After the first pass, expand by franchise batches so comparisons are less random.
