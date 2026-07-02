# Character Atlas

A data-first project for comparing popular video game characters across popularity, franchise context, fan/community signals, visual design, clothing/style, and other analysis dimensions.

The website shell exists, but the next priority is data collection and validation. The site should be treated as a viewer for the dataset, not the source of truth.

## Current Workflow

1. Add candidate characters to `src/data/research-queue.json`.
2. Research each character using the source plan in `docs/data-collection-plan.md`.
3. Add normalized records to `src/data/characters.json`.
4. Run `npm run validate:data`.
5. Only after records pass validation, use the website to browse, compare, and summarize.

## Useful Commands

```bash
npm run validate:data
npm run export:csv
npm run dev
```

## Data Status

The current dataset is a starter seed. Many popularity signals are curated placeholders so the schema and website can work before automated source collection is added.
