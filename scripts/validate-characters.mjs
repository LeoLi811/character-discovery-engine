import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const charactersPath = path.join(root, "src", "data", "characters.json");

const allowedTiers = new Set(["Iconic", "Mainstream", "Cult", "Emerging"]);
const allowedConfidence = new Set(["high", "medium", "low"]);
const allowedSourceTypes = new Set(["official", "encyclopedia", "database", "curated"]);
const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const hexColorPattern = /^#[0-9a-fA-F]{6}$/;

const characters = JSON.parse(fs.readFileSync(charactersPath, "utf8"));
const errors = [];
const warnings = [];
const slugs = new Set();

if (!Array.isArray(characters)) {
  errors.push("characters.json must contain an array.");
} else {
  characters.forEach((character, index) => validateCharacter(character, index));
}

function validateCharacter(character, index) {
  const label = character?.name ? `${character.name} (${index})` : `record ${index}`;

  requiredString(character, "name", label);
  requiredString(character, "slug", label);
  requiredString(character, "franchise", label);
  requiredString(character, "publisher", label);
  requiredString(character, "developer", label);
  requiredString(character, "role", label);
  requiredString(character, "summary", label);

  if (typeof character.slug === "string") {
    if (!slugPattern.test(character.slug)) {
      errors.push(`${label}: slug must be lowercase kebab-case.`);
    }
    if (slugs.has(character.slug)) {
      errors.push(`${label}: duplicate slug '${character.slug}'.`);
    }
    slugs.add(character.slug);
  }

  validateStringArray(character.aliases, `${label}: aliases`, { allowEmpty: true });
  validateStringArray(character.games, `${label}: games`, { allowEmpty: false });
  validateStringArray(character.analysisNotes, `${label}: analysisNotes`, { allowEmpty: false });

  if (!allowedTiers.has(character.popularityTier)) {
    errors.push(`${label}: popularityTier must be one of ${Array.from(allowedTiers).join(", ")}.`);
  }

  validatePopularitySignals(character.popularitySignals, label);
  validateVisualTags(character.visualTags, label);
  validateCitations(character.citations, label);

  if (character.summary && character.summary.length < 40) {
    warnings.push(`${label}: summary is short; add enough context for comparison.`);
  }
}

function requiredString(record, key, label) {
  if (typeof record?.[key] !== "string" || record[key].trim() === "") {
    errors.push(`${label}: '${key}' is required.`);
  }
}

function validateStringArray(value, label, { allowEmpty }) {
  if (!Array.isArray(value)) {
    errors.push(`${label} must be an array.`);
    return;
  }
  if (!allowEmpty && value.length === 0) {
    errors.push(`${label} must include at least one value.`);
  }
  value.forEach((item, index) => {
    if (typeof item !== "string" || item.trim() === "") {
      errors.push(`${label}[${index}] must be a non-empty string.`);
    }
  });
}

function validatePopularitySignals(signals, label) {
  if (!Array.isArray(signals) || signals.length === 0) {
    errors.push(`${label}: popularitySignals must include at least one signal.`);
    return;
  }

  signals.forEach((signal, signalIndex) => {
    const signalLabel = `${label}: popularitySignals[${signalIndex}]`;
    requiredString(signal, "source", signalLabel);
    requiredString(signal, "metricType", signalLabel);
    requiredString(signal, "notes", signalLabel);
    validateDate(signal.collectedAt, `${signalLabel}.collectedAt`);

    if (typeof signal.value !== "number" || Number.isNaN(signal.value)) {
      errors.push(`${signalLabel}.value must be a number.`);
    }
    if (typeof signal.maxValue !== "number" || signal.maxValue <= 0) {
      errors.push(`${signalLabel}.maxValue must be a positive number.`);
    }
    if (typeof signal.value === "number" && typeof signal.maxValue === "number") {
      if (signal.value < 0 || signal.value > signal.maxValue) {
        errors.push(`${signalLabel}.value must be between 0 and maxValue.`);
      }
    }
    if (!allowedConfidence.has(signal.confidence)) {
      errors.push(`${signalLabel}.confidence must be high, medium, or low.`);
    }
  });
}

function validateVisualTags(tags, label) {
  if (!tags || typeof tags !== "object") {
    errors.push(`${label}: visualTags is required.`);
    return;
  }

  validateStringArray(tags.clothing, `${label}: visualTags.clothing`, { allowEmpty: false });
  validateStringArray(tags.colors, `${label}: visualTags.colors`, { allowEmpty: false });
  validateStringArray(tags.accessories, `${label}: visualTags.accessories`, { allowEmpty: false });
  requiredString(tags, "silhouette", `${label}: visualTags`);

  if (Array.isArray(tags.colors)) {
    tags.colors.forEach((color) => {
      if (!hexColorPattern.test(color)) {
        errors.push(`${label}: visualTags.colors contains invalid hex color '${color}'.`);
      }
    });
  }
}

function validateCitations(citations, label) {
  if (!Array.isArray(citations) || citations.length === 0) {
    errors.push(`${label}: citations must include at least one source.`);
    return;
  }

  citations.forEach((citation, citationIndex) => {
    const citationLabel = `${label}: citations[${citationIndex}]`;
    requiredString(citation, "title", citationLabel);
    requiredString(citation, "url", citationLabel);
    requiredString(citation, "notes", citationLabel);
    validateDate(citation.retrievedAt, `${citationLabel}.retrievedAt`);

    if (!allowedSourceTypes.has(citation.sourceType)) {
      errors.push(`${citationLabel}.sourceType must be official, encyclopedia, database, or curated.`);
    }
    try {
      new URL(citation.url);
    } catch {
      errors.push(`${citationLabel}.url must be a valid URL.`);
    }
  });
}

function validateDate(value, label) {
  if (typeof value !== "string" || !datePattern.test(value)) {
    errors.push(`${label} must use YYYY-MM-DD.`);
  }
}

if (warnings.length > 0) {
  console.warn(`Data validation warnings (${warnings.length}):`);
  warnings.forEach((warning) => console.warn(`- ${warning}`));
}

if (errors.length > 0) {
  console.error(`Data validation failed (${errors.length}):`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`Data validation passed for ${characters.length} character records.`);
