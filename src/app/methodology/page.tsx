import { Database, FileSearch, Scale, WandSparkles } from "lucide-react";
import { uiText } from "@/lib/i18n";

const steps = [
  {
    title: "Curated seed list",
    icon: FileSearch,
    body: "V1 starts with a cross-game list of recognizable characters so the site works immediately and can expand in controlled batches."
  },
  {
    title: "Separate signals",
    icon: Database,
    body: "Popularity inputs are stored as individual signals with source, value, confidence, and collection date instead of one hidden number."
  },
  {
    title: "Transparent scoring",
    icon: Scale,
    body: "The current score is an average of normalized signals. It is useful for sorting, but it is not a final claim about global popularity."
  },
  {
    title: "Future enrichment",
    icon: WandSparkles,
    body: "Wikidata, IGDB, RAWG, pageviews, search trends, fan content, and clothing/style classifiers can be added as new adapters later."
  }
];

export default function MethodologyPage() {
  const text = uiText.en.methodology;

  return (
    <div className="page-shell">
      <section className="page-title">
        <div>
          <h1>{text.title}</h1>
          <p>{text.body}</p>
        </div>
      </section>
      <section className="method-grid">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <article className="panel" key={step.title}>
              <Icon size={24} aria-hidden="true" />
              <h2>{step.title}</h2>
              <p className="muted">{step.body}</p>
            </article>
          );
        })}
      </section>
      <section className="panel" style={{ marginTop: 16 }}>
        <h2>{text.knownGaps}</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>{text.area}</th>
                <th>{text.current}</th>
                <th>{text.future}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Popularity</td>
                <td>Manual curated baseline plus placeholder enrichment signals.</td>
                <td>Add pageviews, search interest, community posts, awards, and survey data.</td>
              </tr>
              <tr>
                <td>Images</td>
                <td>Copyright-safe color sigils and style metadata instead of storing copyrighted artwork.</td>
                <td>Add licensed images, official media embeds, or user-provided assets with attribution.</td>
              </tr>
              <tr>
                <td>Clothing/style</td>
                <td>Manual tags for clothing, colors, accessories, and silhouette.</td>
                <td>Add a controlled taxonomy and optional computer-vision assisted tagging.</td>
              </tr>
              <tr>
                <td>External APIs</td>
                <td>Records are local JSON so the site builds without credentials.</td>
                <td>Add server-side Wikidata and IGDB ingestion scripts with cached outputs.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
