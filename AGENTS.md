# AGENTS.md

## Project

CharacterWebsite is a data-first project for researching and comparing video game characters.

Current priority:
1. Character data and research
2. Schema consistency
3. Data validation
4. Website/UI only when explicitly requested

## Scope Rules

- Do not scan the whole repo by default.
- Only read files needed for the task.
- Ask before opening additional files.
- Ask before running broad searches or long commands.
- Do not edit files unless explicitly asked.
- When editing, modify only the files the user allows.
- Keep responses concise.
-If the user's instruction is vague, ask for clarification instead of assuming broad scope.

## Important Files

For data tasks, start with:

- `docs/schema.md`
- `docs/data-collection-plan.md`
- `src/data/discovery-characters.json`
- `src/data/research-queue.json`
- `research/characters/*.research.json`

Avoid large JSON reads unless required.

## Data Rules

- Do not invent missing character data.
- Use `null` or `needs_research` when unknown.
- Keep existing formatting when possible.
- Do not rename schema fields without approval.
- Do not reformat whole files unless asked.

## Future Data Layout

- Target structure is `src/data/games/<game-id>/` with separate `characters.json`, `images.json`, and `i18n/*.json` files.
- Do not migrate current data into the game-scoped layout unless explicitly requested.
- Keep language-neutral facts out of translation files, and keep translated display text out of fact files.
- Do not store binary images in JSON; image files belong under `public/character-images/<game-id>/`.
- Research notes should eventually live under `research/games/<game-id>/<character-id>.research.json`.

## Website Rules

- Do not build UI unless explicitly requested.
- Do not add dependencies without approval.
- Do not change `package.json`, config, or routing unless required.

## Deployment Rules

- Do not run `git push` unless explicitly asked.
- Do not deploy to Vercel unless explicitly asked.
- Do not create preview or production deployments unless explicitly asked.
- Local changes and commits are allowed only when requested.
- After changes, summarize the diff and wait for user approval.
## Default Done Summary

When finished, report only:

- Files read
- Files changed
- Short summary
- Remaining issues

## Translation and Localization Rules

When adding or modifying translations, follow these rules strictly.

### Core principle

Do not replace the original English content. Keep English as the source data, and add translations as separate localized fields.

Preferred structure:

```json
{
  "name": "Kafka",
  "summary": "A calm Stellaron Hunter known for psychological control, purple styling, and a major fan following.",
  "localized": {
    "zh-CN": {
      "name": "卡芙卡",
      "summary": "一位冷静的星核猎手，以心理控制、紫色造型和高人气著称。"
    }
  }
}
