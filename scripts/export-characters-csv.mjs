import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const charactersPath = path.join(root, "src", "data", "characters.json");
const outputDir = path.join(root, "exports");
const outputPath = path.join(outputDir, "characters.csv");
const characters = JSON.parse(fs.readFileSync(charactersPath, "utf8"));

const columns = [
  "name",
  "slug",
  "franchise",
  "role",
  "popularityTier",
  "games",
  "publisher",
  "developer",
  "clothing",
  "colors",
  "accessories",
  "citationCount"
];

const rows = characters.map((character) => ({
  name: character.name,
  slug: character.slug,
  franchise: character.franchise,
  role: character.role,
  popularityTier: character.popularityTier,
  games: character.games.join("|"),
  publisher: character.publisher,
  developer: character.developer,
  clothing: character.visualTags.clothing.join("|"),
  colors: character.visualTags.colors.join("|"),
  accessories: character.visualTags.accessories.join("|"),
  citationCount: character.citations.length
}));

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(outputPath, [columns.join(","), ...rows.map(toCsvRow)].join("\n"));
console.log(`Exported ${rows.length} rows to ${path.relative(root, outputPath)}.`);

function toCsvRow(row) {
  return columns.map((column) => quote(row[column])).join(",");
}

function quote(value) {
  return `"${String(value).replaceAll('"', '""')}"`;
}
