import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { characters, getCountsBy, getSummaryStats, getTopCharacters } from "@/lib/characters";
import { localizedPath, translateCharacter, translateTerm, uiText, type Locale } from "@/lib/i18n";

export default function DashboardPage() {
  return <DashboardContent locale="en" />;
}

export function DashboardContent({ locale }: { locale: Locale }) {
  const stats = getSummaryStats();
  const topCharacters = getTopCharacters(8);
  const roleCounts = getCountsBy(characters.map((character) => character.role)).slice(0, 8);
  const franchiseCounts = getCountsBy(characters.map((character) => character.franchise)).slice(0, 8);
  const text = uiText[locale].dashboard;

  return (
    <div className="page-shell">
      <section className="page-title">
        <div>
          <h1>{text.title}</h1>
          <p>{text.body}</p>
        </div>
      </section>
      <section className="stat-row" aria-label="Summary metrics">
        <Stat label={text.characters} value={stats.characterCount} />
        <Stat label={text.franchises} value={stats.franchises} />
        <Stat label={text.citations} value={stats.citations} />
        <Stat label={text.averageScore} value={stats.averageScore} />
      </section>
      <section className="dashboard-grid">
        <div className="panel">
          <h2>{text.topScores}</h2>
          <div className="bar-list">
            {topCharacters.map((character) => (
              <div className="bar-item" key={character.slug}>
                <div className="bar-label">
                  <Link href={localizedPath(`/characters/${character.slug}`, locale)}>{translateCharacter(character, locale).name}</Link>
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
          <h2>{text.readiness}</h2>
          <p className="muted">{text.readinessBody}</p>
          <Link className="text-button" href={localizedPath("/methodology", locale)}>
            {text.viewMethod} <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
        <CountPanel title={text.roles} rows={roleCounts} locale={locale} />
        <CountPanel title={text.franchiseGroups} rows={franchiseCounts} locale={locale} />
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

function CountPanel({ title, rows, locale }: { title: string; rows: [string, number][]; locale: Locale }) {
  const max = Math.max(...rows.map(([, count]) => count));

  return (
    <div className="panel">
      <h2>{title}</h2>
      <div className="bar-list">
        {rows.map(([label, count]) => (
          <div className="bar-item" key={label}>
            <div className="bar-label">
              <span>{translateTerm(label, locale)}</span>
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
