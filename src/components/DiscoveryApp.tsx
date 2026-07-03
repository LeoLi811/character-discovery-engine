"use client";

import { useMemo, useState } from "react";
import { BrainCircuit, Check, RotateCcw, Sparkles, X } from "lucide-react";
import characterImages from "@/data/character-images.json";
import type {
  AnswerRecord,
  AnswerValue,
  DiscoveryCharacter,
  DiscoveryQuestion,
  GameRecord
} from "@/lib/discovery-types";
import {
  getAnswerLabel,
  getDiscoveryState,
  getSimilarCharacters,
  traitMatches
} from "@/lib/discovery-engine";

type CharacterImageRecord = {
  imageUrl: string | null;
  alt: string;
  source: string;
  licenseNote: string;
};

const characterImageMap = characterImages as Record<string, CharacterImageRecord>;

const answerOptions: { value: AnswerValue; label: string }[] = [
  { value: "yes", label: "Yes" },
  { value: "probably", label: "Probably" },
  { value: "not_sure", label: "Not sure" },
  { value: "probably_not", label: "Probably not" },
  { value: "no", label: "No" }
];

export function DiscoveryApp({
  characters,
  questions,
  games
}: {
  characters: DiscoveryCharacter[];
  questions: DiscoveryQuestion[];
  games: GameRecord[];
}) {
  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [feedback, setFeedback] = useState("");
  const state = useMemo(() => getDiscoveryState(characters, questions, answers), [answers, characters, questions]);
  const top = state.scores[0];
  const likelyGame = games.find((game) => game.id === state.likelyGameId);
  const shouldShowResult = state.shouldGuess || !state.nextQuestion;
  const result = top?.character;
  const similar = result ? getSimilarCharacters(result, characters) : [];

  function answerQuestion(answer: AnswerValue) {
    if (!state.nextQuestion) {
      return;
    }
    setAnswers((current) => [...current, { questionId: state.nextQuestion!.id, answer }]);
  }

  function reset() {
    setStarted(false);
    setAnswers([]);
    setFeedback("");
  }

  if (!started) {
    return (
      <section className="discovery-hero">
        <div className="hero-copy">
          <p className="eyebrow">Honkai: Star Rail first, multi-game ready</p>
          <h1>Think of a character. The engine will ask, narrow, and explain.</h1>
          <p>
            This is an adaptive character discovery system: broad questions identify the likely
            game, then HSR-specific traits narrow the final guess.
          </p>
          <button className="primary-button" type="button" onClick={() => setStarted(true)}>
            <BrainCircuit size={18} aria-hidden="true" /> Start guessing
          </button>
        </div>
        <div className="engine-card">
          <div className="engine-orbit">
            <Sparkles size={34} aria-hidden="true" />
          </div>
          <dl className="mini-stats">
            <div>
              <dt>Characters</dt>
              <dd>{characters.length}</dd>
            </div>
            <div>
              <dt>Questions</dt>
              <dd>{questions.length}</dd>
            </div>
            <div>
              <dt>Mode</dt>
              <dd>Explainable</dd>
            </div>
          </dl>
        </div>
      </section>
    );
  }

  return (
    <section className="guess-layout">
      <div className="question-panel panel">
        <div className="session-bar">
          <span>Question {state.questionCount + (shouldShowResult ? 0 : 1)}</span>
          <button className="icon-button" type="button" onClick={reset} aria-label="Reset session">
            <RotateCcw size={17} aria-hidden="true" />
          </button>
        </div>

        {shouldShowResult && result ? (
          <ResultView
            result={result}
            confidence={top.confidence}
            answers={answers}
            questions={questions}
            similar={similar.map((item) => item.character)}
            feedback={feedback}
            setFeedback={setFeedback}
            reset={reset}
          />
        ) : (
          <>
            <p className="eyebrow">{state.nextQuestion?.scope === "global" ? "General question" : "HSR-specific question"}</p>
            <h1>{state.nextQuestion?.text}</h1>
            <div className="answer-grid">
              {answerOptions.map((option) => (
                <button type="button" className="answer-button" key={option.value} onClick={() => answerQuestion(option.value)}>
                  {option.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <aside className="panel">
        <h2>Live candidates</h2>
        <p className="muted">
          {likelyGame ? `Likely game: ${likelyGame.name}` : "Still asking broad questions."}
        </p>
        <div className="candidate-list">
          {state.scores.slice(0, 6).map((score) => (
            <div className="candidate-row" key={score.character.id}>
              <span className="avatar-dot" style={{ background: score.character.color }} />
              <div>
                <strong>{score.character.name}</strong>
                <small>{Math.round(score.confidence * 100)}% confidence</small>
              </div>
              <div className="score-bar">
                <span className="score-fill" style={{ width: `${Math.max(score.confidence * 100, 4)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </aside>
    </section>
  );
}

function ResultView({
  result,
  confidence,
  answers,
  questions,
  similar,
  feedback,
  setFeedback,
  reset
}: {
  result: DiscoveryCharacter;
  confidence: number;
  answers: AnswerRecord[];
  questions: DiscoveryQuestion[];
  similar: DiscoveryCharacter[];
  feedback: string;
  setFeedback: (value: string) => void;
  reset: () => void;
}) {
  const answeredQuestions = answers
    .map((answer) => {
      const question = questions.find((candidate) => candidate.id === answer.questionId);
      return question ? { question, answer } : null;
    })
    .filter(Boolean) as { question: DiscoveryQuestion; answer: AnswerRecord }[];
  const positiveMatches = answeredQuestions.filter(({ question, answer }) => {
    const matches = traitMatches(result, question);
    return matches && ["yes", "probably"].includes(answer.answer);
  });
  const image = characterImageMap[result.id];

  return (
    <div className="result-view">
      <CharacterReveal result={result} confidence={confidence} image={image} />
      <p className="eyebrow">Final guess</p>
      <h1>{result.name}</h1>
      <p>{result.summary}</p>
      <div className="result-confidence">
        <strong>{Math.round(confidence * 100)}%</strong>
        <span>estimated confidence</span>
      </div>

      <h2>Why this guess?</h2>
      <div className="explain-list">
        {positiveMatches.slice(0, 6).map(({ question, answer }) => (
          <div className="explain-row" key={question.id}>
            <Check size={16} aria-hidden="true" />
            <span>
              {question.text} <strong>{getAnswerLabel(answer.answer)}</strong>
            </span>
          </div>
        ))}
        {positiveMatches.length === 0 ? <p className="muted">The engine used penalties and candidate gaps more than direct positive matches.</p> : null}
      </div>

      <h2>Similar characters</h2>
      <div className="pill-row">
        {similar.map((character) => (
          <span className="pill" key={character.id}>
            {character.name}
          </span>
        ))}
      </div>

      <div className="feedback-box">
        <h2>Was it wrong?</h2>
        <p className="muted">For V1 this stays in the browser as text you can use to improve the dataset later.</p>
        <textarea
          value={feedback}
          onChange={(event) => setFeedback(event.target.value)}
          placeholder="Who was it, and which answer felt wrong or missing?"
        />
      </div>

      <div className="result-actions">
        <button className="primary-button" type="button" onClick={reset}>
          <RotateCcw size={17} aria-hidden="true" /> Play again
        </button>
        <button className="text-button" type="button" onClick={() => setFeedback("")}>
          <X size={16} aria-hidden="true" /> Clear feedback
        </button>
      </div>
    </div>
  );
}

function CharacterReveal({
  result,
  confidence,
  image
}: {
  result: DiscoveryCharacter;
  confidence: number;
  image?: CharacterImageRecord;
}) {
  const path = getTraitText(result.hsr.path);
  const combatType = getTraitText(result.hsr.combatType);
  const hairColor = getTraitText(result.global.primaryHairColor);
  const outfitColor = getTraitText(result.global.primaryOutfitColor);
  const faction = getTraitText(result.hsr.faction);
  const initials = result.name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const hasImage = Boolean(image?.imageUrl);

  return (
    <figure
      style={{
        position: "relative",
        display: "grid",
        minHeight: "clamp(500px, 70vh, 760px)",
        margin: "0 -18px",
        overflow: "visible",
        isolation: "isolate",
        border: "none",
        background: `radial-gradient(circle at 50% 46%, ${result.color} 0%, rgba(23, 27, 32, 0.62) 36%, rgba(13, 15, 18, 0) 72%)`
      }}
    >
      {hasImage ? (
        <>
          <img
            aria-hidden="true"
            src={image?.imageUrl ?? ""}
            alt=""
            style={{
              position: "absolute",
              inset: "-28px",
              width: "100%",
              height: "100%",
              filter: "blur(18px)",
              objectFit: "cover",
              opacity: 0.22,
              transform: "scale(1.1)",
              zIndex: -2
            }}
          />
          <img
            src={image?.imageUrl ?? ""}
            alt={image?.alt ?? `${result.name} character artwork`}
            style={{
              position: "absolute",
              inset: 0,
              boxSizing: "border-box",
              width: "100%",
              height: "100%",
              objectFit: "contain",
              objectPosition: "center center",
              padding: "8px clamp(10px, 4vw, 38px) 72px",
              filter: "drop-shadow(0 34px 52px rgba(0,0,0,0.58))",
              transform: "scale(1.05)",
              zIndex: -1
            }}
          />
        </>
      ) : (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background:
              "repeating-linear-gradient(90deg, rgba(255,255,255,0.08) 0 1px, transparent 1px 58px), repeating-linear-gradient(0deg, rgba(255,255,255,0.045) 0 1px, transparent 1px 58px)"
          }}
        />
      )}
      <div
        style={{
          position: "absolute",
          inset: "-20px 0 0",
          background:
            "linear-gradient(180deg, rgba(8,10,12,0.58), rgba(8,10,12,0.1) 32%, rgba(8,10,12,0.18) 68%, rgba(8,10,12,0.74))",
          zIndex: 0
        }}
      />
      <div style={{ position: "relative", zIndex: 1, display: "grid", gap: 8, alignSelf: "start", width: "min(420px, 62%)", padding: "22px 28px" }}>
        <p className="eyebrow">Character reveal</p>
        <strong style={{ color: "#fff8ec", fontSize: "clamp(36px, 7vw, 72px)", lineHeight: 0.9 }}>{result.name}</strong>
        <span style={{ color: "rgba(244, 241, 234, 0.78)", fontFamily: "var(--font-geist-mono)", fontSize: 12, textTransform: "uppercase" }}>
          {faction}
        </span>
      </div>
      {!hasImage ? (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            right: "clamp(18px, 6vw, 72px)",
            top: "50%",
            display: "grid",
            width: "clamp(132px, 28vw, 240px)",
            aspectRatio: "1",
            placeItems: "center",
            border: "1px solid rgba(255,255,255,0.42)",
            borderRadius: "50%",
            background: "rgba(0,0,0,0.3)",
            boxShadow: "0 28px 80px rgba(0,0,0,0.34)",
            transform: "translateY(-50%)"
          }}
        >
          <span style={{ color: "#fff8ec", fontFamily: "var(--font-geist-mono)", fontSize: "clamp(44px, 10vw, 92px)", fontWeight: 900 }}>
            {initials}
          </span>
        </div>
      ) : null}
      <div
        aria-label={`${result.name} key traits`}
        style={{
          position: "relative",
          zIndex: 1,
          alignSelf: "end",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: 8,
          maxWidth: "min(720px, calc(100% - 180px))",
          margin: "0 auto",
          padding: "0 24px 22px"
        }}
      >
        {[path, combatType, `${hairColor} hair`, `${outfitColor} outfit`].map((trait) => (
          <span
            key={trait}
            style={{
              minHeight: 30,
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: 8,
              background: "rgba(6,8,10,0.52)",
              color: "#fff8ec",
              padding: "6px 10px",
              fontSize: 12
            }}
          >
            {trait}
          </span>
        ))}
      </div>
      <div
        style={{
          position: "absolute",
          right: 28,
          top: 24,
          zIndex: 1,
          display: "grid",
          minWidth: 86,
          border: "1px solid rgba(255,255,255,0.2)",
          borderRadius: 8,
          background: "rgba(6,8,10,0.52)",
          padding: "10px 12px",
          textAlign: "right"
        }}
      >
        <strong style={{ color: "var(--accent)", fontSize: 26, lineHeight: 1 }}>{Math.round(confidence * 100)}%</strong>
        <span style={{ color: "rgba(244, 241, 234, 0.72)", fontSize: 11, textTransform: "uppercase" }}>match</span>
      </div>
    </figure>
  );
}

function getTraitText(value: unknown) {
  if (Array.isArray(value)) {
    return value.length > 0 ? String(value[0]) : "Unknown";
  }
  if (value === null || value === undefined) {
    return "Unknown";
  }
  return String(value);
}
