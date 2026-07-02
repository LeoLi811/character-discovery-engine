import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { characters, getCountsBy, getSummaryStats, getTopCharacters } from "@/lib/characters";

export default function DashboardPage() {
  const stats = getSummaryStats();
  const topCharacters = getTopCharacters(8);
  const roleCounts = getCountsBy(characters.map((character) => character.role)).slice(0, 8);
  const franchiseCounts = getCountsBy(characters.map((character) => character.franchise)).slice(0, 8);

  return (
    <div className="page-shell">
      <section className="page-title">
        <div>
          <h1>Catalog summary dashboard.</h1>
          <p>
            These are descriptive counts and transparent V1 scores, not final popularity rankings.
            The goal is to expose what the dataset currently contains and where it can grow.
          </p>
        </div>
      </section>
      <section className="stat-row" aria-label="Summary metrics">
        <Stat label="Characters" value={stats.characterCount} />
        <Stat label="Franchises" value={stats.franchises} />
        <Stat label="Source citations" value={stats.citations} />
        <Stat label="Avg. score" value={stats.averageScore} />
      </section>
      <section className="dashboard-grid">
        <div className="panel">
          <h2>Top V1 popularity scores</h2>
          <div className="bar-list">
            {topCharacters.map((character) => (
              <div className="bar-item" key={character.slug}>
                <div className="bar-label">
                  <Link href={`/characters/${character.slug}`}>{character.name}</Link>
                  <span>{character.popularitySignals[0].value}</span>
                </div>
                <div className="score-bar">
                  <span className="score-fill" style={{ width: `${character.popularitySignals[0].value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="panel">
          <h2>Data readiness notes</h2>
          <p className="muted">
            The catalog already stores popularity signals independently from the computed score. Later
            phases can add pageviews, search trends, social metrics, fan works, sales context, or survey
            data without rewriting the character records.
          </p>
          <Link className="text-button" href="/methodology">
            View method <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
        <CountPanel title="Roles represented" rows={roleCounts} />
        <CountPanel title="Largest franchise groups" rows={franchiseCounts} />
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="stat-card">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function CountPanel({ title, rows }: { title: string; rows: [string, number][] }) {
  const max = Math.max(...rows.map(([, count]) => count));

  return (
    <div className="panel">
      <h2>{title}</h2>
      <div className="bar-list">
        {rows.map(([label, count]) => (
          <div className="bar-item" key={label}>
            <div className="bar-label">
              <span>{label}</span>
              <span>{count}</span>
            </div>
            <div className="score-bar">
              <span className="score-fill" style={{ width: `${(count / max) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
