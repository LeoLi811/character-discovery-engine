export type PopularityTier = "Iconic" | "Mainstream" | "Cult" | "Emerging";

export type PopularitySignal = {
  source: string;
  metricType: string;
  value: number;
  maxValue: number;
  collectedAt: string;
  confidence: "high" | "medium" | "low";
  notes: string;
};

export type SourceCitation = {
  title: string;
  url: string;
  sourceType: "official" | "encyclopedia" | "database" | "curated";
  retrievedAt: string;
  notes: string;
};

export type Character = {
  name: string;
  slug: string;
  aliases: string[];
  franchise: string;
  games: string[];
  publisher: string;
  developer: string;
  role: string;
  popularityTier: PopularityTier;
  summary: string;
  popularitySignals: PopularitySignal[];
  visualTags: {
    clothing: string[];
    colors: string[];
    accessories: string[];
    silhouette: string;
  };
  analysisNotes: string[];
  citations: SourceCitation[];
};
