"use client";

import { useEffect, useMemo, useState } from "react";
import type { CorrectionFeedbackRecord, DiscoveryCharacter } from "@/lib/discovery-types";
import { loadCorrectionFeedback, summarizeCorrectionFeedback } from "@/lib/corrections";
import { translateDiscoveryCharacter, uiText, type Locale } from "@/lib/i18n";

export function CorrectionAnalyticsPanel({
  characters,
  locale
}: {
  characters: DiscoveryCharacter[];
  locale: Locale;
}) {
  const [records, setRecords] = useState<CorrectionFeedbackRecord[]>([]);
  const text = uiText[locale].analytics;
  const summary = useMemo(() => summarizeCorrectionFeedback(records), [records]);

  useEffect(() => {
    setRecords(loadCorrectionFeedback());
  }, []);

  return (
    <section className="panel correction-analytics">
      <div className="panel-heading">
        <div>
          <h2>{text.localFeedback}</h2>
          <p className="muted">{text.localFeedbackBody}</p>
        </div>
        <div className="stat-card compact-stat">
          <strong>{summary.total}</strong>
          <span>{text.submittedCorrections}</span>
        </div>
      </div>

      {summary.total === 0 ? (
        <p className="muted">{text.noFeedback}</p>
      ) : (
        <div className="feedback-analytics-grid">
          <FeedbackCountList
            title={text.mostCorrectedAnswers}
            rows={summary.byCorrectCharacter.slice(0, 5)}
            characters={characters}
            locale={locale}
          />
          <FeedbackCountList
            title={text.mostCommonWrongGuesses}
            rows={summary.byGuessedCharacter.slice(0, 5)}
            characters={characters}
            locale={locale}
          />
          <div>
            <h3>{text.confusedPairs}</h3>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>{text.guessed}</th>
                    <th>{text.correct}</th>
                    <th>{text.count}</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.byPair.slice(0, 6).map((row) => {
                    const [guessedId, correctId] = row.id.split("->");
                    return (
                      <tr key={row.id}>
                        <td>{getCharacterName(guessedId, characters, locale)}</td>
                        <td>{getCharacterName(correctId, characters, locale)}</td>
                        <td>{row.count}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function FeedbackCountList({
  title,
  rows,
  characters,
  locale
}: {
  title: string;
  rows: { id: string; count: number }[];
  characters: DiscoveryCharacter[];
  locale: Locale;
}) {
  const text = uiText[locale].analytics;

  return (
    <div>
      <h3>{title}</h3>
      <div className="bar-list">
        {rows.map((row) => (
          <div className="bar-item" key={row.id}>
            <div className="bar-label">
              <span>{getCharacterName(row.id, characters, locale)}</span>
              <span>
                {row.count} {text.count}
              </span>
            </div>
            <div className="score-bar">
              <span className="score-fill" style={{ width: `${Math.max(row.count * 18, 8)}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function getCharacterName(id: string, characters: DiscoveryCharacter[], locale: Locale) {
  const character = characters.find((candidate) => candidate.id === id);
  return character ? translateDiscoveryCharacter(character, locale).name : id;
}
