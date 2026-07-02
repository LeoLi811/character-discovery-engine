"use client";

import { useMemo, useState } from "react";
import { BrainCircuit, Check, RotateCcw, Sparkles, X } from "lucide-react";
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

  return (
    <div className="result-view">
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
