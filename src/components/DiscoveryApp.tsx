"use client";

import { useEffect, useMemo, useState } from "react";
import { BrainCircuit, Check, RotateCcw, Sparkles, X } from "lucide-react";
import characterImages from "@/data/games/hsr/character-images.json";
import type {
  AnswerRecord,
  AnswerValue,
  CharacterScore,
  CorrectionFeedbackRecord,
  CorrectionSuggestion,
  DiscoveryCharacter,
  DiscoveryQuestion,
  GameRecord
} from "@/lib/discovery-types";
import {
  buildCorrectionSuggestions,
  getCharacterNameSuggestions,
  resolveCharacterId,
  saveCorrectionFeedback
} from "@/lib/corrections";
import {
  getDiscoveryState,
  getSimilarCharacters,
  traitMatches
} from "@/lib/discovery-engine";
import {
  translateAnswer,
  translateDiscoveryCharacter,
  translateQuestion,
  translateTerm,
  uiText,
  type Locale
} from "@/lib/i18n";

type CharacterImageRecord = {
  imageUrl: string | null;
  alt: string;
  source: string;
  sourceUrl?: string;
  licenseNote: string;
};

const characterImageMap = characterImages as Record<string, CharacterImageRecord>;

const answerOptions: AnswerValue[] = ["yes", "probably", "not_sure", "probably_not", "no"];

export function DiscoveryApp({
  characters,
  questions,
  games,
  locale = "en"
}: {
  characters: DiscoveryCharacter[];
  questions: DiscoveryQuestion[];
  games: GameRecord[];
  locale?: Locale;
}) {
  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const state = useMemo(() => getDiscoveryState(characters, questions, answers), [answers, characters, questions]);
  const top = state.scores[0];
  const likelyGame = games.find((game) => game.id === state.likelyGameId);
  const shouldShowResult = state.shouldGuess || !state.nextQuestion;
  const result = top?.character;
  const similar = result ? getSimilarCharacters(result, characters) : [];
  const text = uiText[locale].discovery;

  function answerQuestion(answer: AnswerValue) {
    if (!state.nextQuestion) {
      return;
    }
    setAnswers((current) => [...current, { questionId: state.nextQuestion!.id, answer }]);
  }

  function reset() {
    setStarted(false);
    setAnswers([]);
  }

  if (!started) {
    return (
      <section className="discovery-hero">
        <div className="hero-copy">
          <p className="eyebrow">{text.heroEyebrow}</p>
          <h1>{text.heroTitle}</h1>
          <p>{text.heroBody}</p>
          <button className="primary-button" type="button" onClick={() => setStarted(true)}>
            <BrainCircuit size={18} aria-hidden="true" /> {text.start}
          </button>
        </div>
        <div className="engine-card">
          <div className="engine-orbit">
            <Sparkles size={34} aria-hidden="true" />
          </div>
          <dl className="mini-stats">
            <div>
              <dt>{text.characters}</dt>
              <dd>{characters.length}</dd>
            </div>
            <div>
              <dt>{text.questions}</dt>
              <dd>{questions.length}</dd>
            </div>
            <div>
              <dt>{text.mode}</dt>
              <dd>{text.explainable}</dd>
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
          <span>{text.question} {state.questionCount + (shouldShowResult ? 0 : 1)}</span>
          <button className="icon-button" type="button" onClick={reset} aria-label={text.resetSession}>
            <RotateCcw size={17} aria-hidden="true" />
          </button>
        </div>

        {shouldShowResult && result ? (
          <ResultView
            result={result}
            confidence={top.confidence}
            answers={answers}
            questions={questions}
            characters={characters}
            topCandidates={state.scores.slice(0, 6)}
            similar={similar.map((item) => item.character)}
            reset={reset}
            locale={locale}
          />
        ) : (
          <>
            <p className="eyebrow">{state.nextQuestion?.scope === "global" ? text.generalQuestion : text.hsrQuestion}</p>
            <h1>{state.nextQuestion ? translateQuestion(state.nextQuestion, locale) : ""}</h1>
            <div className="answer-grid">
              {answerOptions.map((option) => (
                <button type="button" className="answer-button" key={option} onClick={() => answerQuestion(option)}>
                  {translateAnswer(option, locale)}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <aside className="panel">
        <h2>{text.liveCandidates}</h2>
        <p className="muted">
          {likelyGame ? `${text.likelyGame}: ${translateTerm(likelyGame.name, locale)}` : text.broadQuestions}
        </p>
        <div className="candidate-list">
          {state.scores.slice(0, 6).map((score) => (
            <div className="candidate-row" key={score.character.id}>
              <span className="avatar-dot" style={{ background: score.character.color }} />
              <div>
                <strong>{translateDiscoveryCharacter(score.character, locale).name}</strong>
                <small>{Math.round(score.confidence * 100)}% {text.confidence}</small>
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
  characters,
  topCandidates,
  similar,
  reset,
  locale
}: {
  result: DiscoveryCharacter;
  confidence: number;
  answers: AnswerRecord[];
  questions: DiscoveryQuestion[];
  characters: DiscoveryCharacter[];
  topCandidates: CharacterScore[];
  similar: DiscoveryCharacter[];
  reset: () => void;
  locale: Locale;
}) {
  const text = uiText[locale].discovery;
  const [correctInput, setCorrectInput] = useState("");
  const [notes, setNotes] = useState("");
  const [savedRecord, setSavedRecord] = useState<CorrectionFeedbackRecord | null>(null);
  const [feedbackError, setFeedbackError] = useState("");
  const translatedResult = translateDiscoveryCharacter(result, locale);
  const resolvedCorrectId = useMemo(
    () => resolveCharacterId(correctInput, characters),
    [characters, correctInput]
  );
  const selectedCorrectCharacter = characters.find((character) => character.id === resolvedCorrectId);
  const nameSuggestions = useMemo(
    () => getCharacterNameSuggestions(correctInput, characters),
    [characters, correctInput]
  );
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

  function submitCorrection() {
    if (!resolvedCorrectId || !selectedCorrectCharacter) {
      setFeedbackError(text.feedbackChooseExisting);
      return;
    }
    if (resolvedCorrectId === result.id) {
      setFeedbackError(text.feedbackSameCharacter);
      return;
    }

    const suggestions = buildCorrectionSuggestions({
      guessedCharacter: result,
      correctCharacter: selectedCorrectCharacter,
      answers,
      questions
    });
    const record = saveCorrectionFeedback({
      guessedCharacterId: result.id,
      correctCharacterId: resolvedCorrectId,
      answers,
      topCandidates: topCandidates.map((candidate) => ({
        characterId: candidate.character.id,
        confidence: candidate.confidence
      })),
      notes: notes.trim(),
      suggestions
    });

    setSavedRecord(record);
    setFeedbackError("");
  }

  return (
    <div className="result-view">
      <CharacterReveal result={result} confidence={confidence} image={image} locale={locale} />
      <p className="eyebrow">{text.finalGuess}</p>
      <h1>{translatedResult.name}</h1>
      <p>{translatedResult.summary}</p>
      <div className="result-confidence">
        <strong>{Math.round(confidence * 100)}%</strong>
        <span>{text.estimatedConfidence}</span>
      </div>

      <h2>{text.why}</h2>
      <div className="explain-list">
        {positiveMatches.slice(0, 6).map(({ question, answer }) => (
          <div className="explain-row" key={question.id}>
            <Check size={16} aria-hidden="true" />
            <span>
              {translateQuestion(question, locale)} <strong>{translateAnswer(answer.answer, locale)}</strong>
            </span>
          </div>
        ))}
        {positiveMatches.length === 0 ? <p className="muted">{text.noPositiveMatches}</p> : null}
      </div>

      <h2>{text.similarCharacters}</h2>
      <div className="pill-row">
        {similar.map((character) => (
          <span className="pill" key={character.id}>
            {translateDiscoveryCharacter(character, locale).name}
          </span>
        ))}
      </div>

      <div className="feedback-box">
        <h2>{text.wrong}</h2>
        <p className="muted">{text.feedbackHelp}</p>
        <div className="field">
          <label htmlFor="correct-character">{text.correctCharacter}</label>
          <input
            id="correct-character"
            value={correctInput}
            onChange={(event) => {
              setCorrectInput(event.target.value);
              setSavedRecord(null);
              setFeedbackError("");
            }}
            placeholder={text.correctCharacterPlaceholder}
          />
        </div>
        {correctInput ? (
          <div className="feedback-suggestions">
            {nameSuggestions.map(({ character, matchedLabel }) => (
              <button
                className="text-button"
                type="button"
                key={character.id}
                onClick={() => {
                  setCorrectInput(translateDiscoveryCharacter(character, locale).name);
                  setSavedRecord(null);
                  setFeedbackError("");
                }}
              >
                {translateDiscoveryCharacter(character, locale).name}
                <span>{matchedLabel}</span>
              </button>
            ))}
          </div>
        ) : null}
        <div className="field">
          <label htmlFor="correction-note">{text.feedbackNote}</label>
          <textarea
            id="correction-note"
            value={notes}
            onChange={(event) => {
              setNotes(event.target.value);
              setSavedRecord(null);
            }}
            placeholder={text.feedbackPlaceholder}
          />
        </div>
        {selectedCorrectCharacter ? (
          <p className="muted">
            {text.feedbackResolved}: <strong>{translateDiscoveryCharacter(selectedCorrectCharacter, locale).name}</strong>
          </p>
        ) : null}
        {feedbackError ? <p className="form-error">{feedbackError}</p> : null}
        {savedRecord ? (
          <div className="feedback-saved">
            <Check size={16} aria-hidden="true" />
            <div>
              <strong>{text.feedbackSaved}</strong>
              <CorrectionSuggestionList suggestions={savedRecord.suggestions} questions={questions} characters={characters} locale={locale} />
            </div>
          </div>
        ) : null}
      </div>

      <div className="result-actions">
        <button className="primary-button" type="button" onClick={submitCorrection}>
          <Check size={17} aria-hidden="true" /> {text.submitFeedback}
        </button>
        <button className="primary-button" type="button" onClick={reset}>
          <RotateCcw size={17} aria-hidden="true" /> {text.playAgain}
        </button>
        <button className="text-button" type="button" onClick={() => {
          setCorrectInput("");
          setNotes("");
          setSavedRecord(null);
          setFeedbackError("");
        }}>
          <X size={16} aria-hidden="true" /> {text.clearFeedback}
        </button>
      </div>
    </div>
  );
}

function CorrectionSuggestionList({
  suggestions,
  questions,
  characters,
  locale
}: {
  suggestions: CorrectionSuggestion[];
  questions: DiscoveryQuestion[];
  characters: DiscoveryCharacter[];
  locale: Locale;
}) {
  const text = uiText[locale].discovery;

  return (
    <ul className="feedback-improvements">
      {suggestions.map((suggestion, index) => (
        <li key={`${suggestion.type}-${index}`}>
          {renderCorrectionSuggestion(suggestion, questions, characters, locale, text)}
        </li>
      ))}
    </ul>
  );
}

function renderCorrectionSuggestion(
  suggestion: CorrectionSuggestion,
  questions: DiscoveryQuestion[],
  characters: DiscoveryCharacter[],
  locale: Locale,
  text: {
    suggestionConfusedPair: string;
    suggestionAnswerMismatch: string;
    suggestionMissingQuestion: string;
  }
) {
  if (suggestion.type === "confused_pair") {
    const guessed = characters.find((character) => character.id === suggestion.guessedCharacterId);
    const correct = characters.find((character) => character.id === suggestion.correctCharacterId);
    const guessedName = guessed ? translateDiscoveryCharacter(guessed, locale).name : suggestion.guessedCharacterId;
    const correctName = correct ? translateDiscoveryCharacter(correct, locale).name : suggestion.correctCharacterId;
    return `${text.suggestionConfusedPair}: ${guessedName} -> ${correctName}`;
  }

  const question = questions.find((candidate) => candidate.id === suggestion.questionId);
  const questionText = question ? translateQuestion(question, locale) : suggestion.questionId;
  if (suggestion.type === "answer_mismatch") {
    return `${text.suggestionAnswerMismatch}: ${questionText}`;
  }

  return `${text.suggestionMissingQuestion}: ${questionText}`;
}

function CharacterReveal({
  result,
  confidence,
  image,
  locale
}: {
  result: DiscoveryCharacter;
  confidence: number;
  image?: CharacterImageRecord;
  locale: Locale;
}) {
  const text = uiText[locale].discovery;
  const translatedResult = translateDiscoveryCharacter(result, locale);
  const path = translateTraitText(result.hsr.path, locale);
  const combatType = translateTraitText(result.hsr.combatType, locale);
  const hairColor = translateTraitText(result.global.primaryHairColor, locale);
  const outfitColor = translateTraitText(result.global.primaryOutfitColor, locale);
  const faction = translateTraitText(result.hsr.faction, locale);
  const [imageMode, setImageMode] = useState<"local" | "source" | "none">("local");
  const fallbackImageUrl = image?.sourceUrl && image.sourceUrl !== image.imageUrl ? image.sourceUrl : "";
  const imageSrc = imageMode === "source" ? fallbackImageUrl : image?.imageUrl ?? fallbackImageUrl;
  const initials = translatedResult.name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const hasImage = imageMode !== "none" && Boolean(imageSrc);

  useEffect(() => {
    setImageMode("local");
  }, [image?.imageUrl, image?.sourceUrl]);

  function handleImageError() {
    setImageMode((current) => {
      if (current === "local" && fallbackImageUrl) {
        return "source";
      }
      return "none";
    });
  }

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
            src={imageSrc}
            alt=""
            onError={handleImageError}
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
            src={imageSrc}
            alt={image?.alt ?? `${translatedResult.name} ${text.artworkAlt}`}
            onError={handleImageError}
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
        <p className="eyebrow">{text.reveal}</p>
        <strong style={{ color: "#fff8ec", fontSize: "clamp(36px, 7vw, 72px)", lineHeight: 0.9 }}>{translatedResult.name}</strong>
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
        aria-label={`${translatedResult.name} key traits`}
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
        {[path, combatType, `${hairColor} ${text.hair}`, `${outfitColor} ${text.outfit}`].map((trait) => (
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
        <span style={{ color: "rgba(244, 241, 234, 0.72)", fontSize: 11, textTransform: "uppercase" }}>{text.match}</span>
      </div>
    </figure>
  );
}

function translateTraitText(value: unknown, locale: Locale) {
  if (Array.isArray(value)) {
    return value.length > 0 ? translateTerm(value[0], locale) : uiText[locale].discovery.unknown;
  }
  if (value === null || value === undefined) {
    return uiText[locale].discovery.unknown;
  }
  return translateTerm(value, locale);
}
