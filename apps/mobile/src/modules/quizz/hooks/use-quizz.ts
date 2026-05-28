import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  COUNTRIES,
  type Country,
  type SupportedGeoLanguage,
} from "@geopoto/geo-data";

import { useGeoLangStore } from "@/utils/language/geo-lang-store";

import {
  createQuizz,
  type QuizzFormat,
  type QuizzOptions,
  type QuizzQuestion,
} from "../utils/quizz";

export type QuizzAnswerSubmission =
  | {
      countryCode: string;
      type: "country";
    }
  | {
      type: "text";
      value: string;
    };

export interface QuizzCurrentQuestion extends QuizzQuestion {
  country: Country;
}

export interface QuizzScore {
  answeredQuestions: number;
  bestStreak: number;
  correctAnswers: number;
  currentStreak: number;
  remainingQuestions: number;
  totalQuestions: number;
  wrongAnswers: number;
}

interface QuizzSessionState {
  bestStreak: number;
  correctAnswers: number;
  currentQuestionIndex: number;
  currentStreak: number;
  questions: readonly QuizzQuestion[];
  wrongAnswers: number;
}

interface UseQuizzParams {
  options: QuizzOptions;
  questions?: readonly QuizzQuestion[];
}

export function useQuizz({ options, questions }: UseQuizzParams) {
  const { geoLang } = useGeoLangStore();
  const sessionKey = getQuizzSessionKey({ options, questions });
  const previousSessionKeyRef = useRef(sessionKey);
  const [session, setSession] = useState(() =>
    createQuizzSessionState({ options, questions }),
  );

  useEffect(() => {
    if (previousSessionKeyRef.current === sessionKey) {
      return;
    }

    previousSessionKeyRef.current = sessionKey;
    setSession(createQuizzSessionState({ options, questions }));
  }, [options, questions, sessionKey]);

  const currentQuestion = useMemo(
    () =>
      getCurrentQuestion({
        currentQuestionIndex: session.currentQuestionIndex,
        questions: session.questions,
      }),
    [session.currentQuestionIndex, session.questions],
  );
  const score = useMemo(() => getQuizzScore({ session }), [session]);
  const isComplete = score.remainingQuestions === 0;
  const progress =
    score.totalQuestions === 0
      ? 1
      : score.answeredQuestions / score.totalQuestions;

  const submitAnswer = useCallback(
    ({ answer }: SubmitQuizzAnswerParams) => {
      setSession((previousSession) =>
        submitAnswerToSession({
          answer,
          geoLang,
          session: previousSession,
        }),
      );
    },
    [geoLang],
  );

  const restartQuizz = useCallback(() => {
    setSession(createQuizzSessionState({ options, questions }));
  }, [options, questions]);

  return {
    currentQuestion,
    isComplete,
    progress,
    restartQuizz,
    score,
    submitAnswer,
  };
}

interface SubmitQuizzAnswerParams {
  answer: QuizzAnswerSubmission;
}

interface CreateQuizzSessionStateParams {
  options: QuizzOptions;
  questions?: readonly QuizzQuestion[];
}

function createQuizzSessionState({
  options,
  questions,
}: CreateQuizzSessionStateParams): QuizzSessionState {
  return {
    bestStreak: 0,
    correctAnswers: 0,
    currentQuestionIndex: 0,
    currentStreak: 0,
    questions: questions ?? createQuizz(options),
    wrongAnswers: 0,
  };
}

interface GetCurrentQuestionParams {
  currentQuestionIndex: number;
  questions: readonly QuizzQuestion[];
}

function getCurrentQuestion({
  currentQuestionIndex,
  questions,
}: GetCurrentQuestionParams): QuizzCurrentQuestion | null {
  const question = questions.at(currentQuestionIndex);

  if (question === undefined) {
    return null;
  }

  const country = findCountryByCode({ countryCode: question.countryCode });

  if (country === null) {
    return null;
  }

  return {
    ...question,
    country,
  };
}

interface FindCountryByCodeParams {
  countryCode: string;
}

function findCountryByCode({ countryCode }: FindCountryByCodeParams) {
  return COUNTRIES.find((country) => country.code === countryCode) ?? null;
}

interface GetQuizzScoreParams {
  session: QuizzSessionState;
}

function getQuizzScore({ session }: GetQuizzScoreParams): QuizzScore {
  const answeredQuestions = session.currentQuestionIndex;
  const totalQuestions = session.questions.length;

  return {
    answeredQuestions,
    bestStreak: session.bestStreak,
    correctAnswers: session.correctAnswers,
    currentStreak: session.currentStreak,
    remainingQuestions: Math.max(totalQuestions - answeredQuestions, 0),
    totalQuestions,
    wrongAnswers: session.wrongAnswers,
  };
}

interface SubmitAnswerToSessionParams {
  answer: QuizzAnswerSubmission;
  geoLang: SupportedGeoLanguage;
  session: QuizzSessionState;
}

function submitAnswerToSession({
  answer,
  geoLang,
  session,
}: SubmitAnswerToSessionParams): QuizzSessionState {
  const currentQuestion = getCurrentQuestion({
    currentQuestionIndex: session.currentQuestionIndex,
    questions: session.questions,
  });

  if (currentQuestion === null) {
    return session;
  }

  const isCorrectAnswer = isQuizzAnswerCorrect({
    answer,
    geoLang,
    question: currentQuestion,
  });
  const currentStreak = isCorrectAnswer ? session.currentStreak + 1 : 0;

  return {
    ...session,
    bestStreak: Math.max(session.bestStreak, currentStreak),
    correctAnswers: session.correctAnswers + (isCorrectAnswer ? 1 : 0),
    currentQuestionIndex: session.currentQuestionIndex + 1,
    currentStreak,
    wrongAnswers: session.wrongAnswers + (isCorrectAnswer ? 0 : 1),
  };
}

interface IsQuizzAnswerCorrectParams {
  answer: QuizzAnswerSubmission;
  geoLang: SupportedGeoLanguage;
  question: QuizzCurrentQuestion;
}

function isQuizzAnswerCorrect({
  answer,
  geoLang,
  question,
}: IsQuizzAnswerCorrectParams) {
  switch (question.answerFormat) {
    case "country-name":
    case "country-capital":
      return isTextAnswerCorrect({
        answer,
        expectedAnswer: getTextAnswer({
          answerFormat: question.answerFormat,
          country: question.country,
          geoLang,
        }),
      });
    case "country-flag":
    case "country-position":
      return (
        answer.type === "country" &&
        answer.countryCode === question.country.code
      );
    default: {
      const exhaustiveFormat: never = question.answerFormat;

      return exhaustiveFormat;
    }
  }
}

interface IsTextAnswerCorrectParams {
  answer: QuizzAnswerSubmission;
  expectedAnswer: string;
}

function isTextAnswerCorrect({
  answer,
  expectedAnswer,
}: IsTextAnswerCorrectParams) {
  if (answer.type !== "text") {
    return false;
  }

  return (
    normalizeQuizzTextAnswer(answer.value) ===
    normalizeQuizzTextAnswer(expectedAnswer)
  );
}

interface GetTextAnswerParams {
  answerFormat: Extract<QuizzFormat, "country-capital" | "country-name">;
  country: Country;
  geoLang: SupportedGeoLanguage;
}

function getTextAnswer({
  answerFormat,
  country,
  geoLang,
}: GetTextAnswerParams) {
  switch (answerFormat) {
    case "country-name":
      return country.name[geoLang];
    case "country-capital":
      return country.capital[geoLang];
    default: {
      const exhaustiveFormat: never = answerFormat;

      return exhaustiveFormat;
    }
  }
}

export function normalizeQuizzTextAnswer(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase()
    .replace(/[^\p{Letter}\p{Number}]/gu, "");
}

interface GetQuizzSessionKeyParams {
  options: QuizzOptions;
  questions?: readonly QuizzQuestion[];
}

function getQuizzSessionKey({ options, questions }: GetQuizzSessionKeyParams) {
  return [
    options.regions.join(","),
    options.acceptedQuestionFormats.join(","),
    options.acceptedAnswerFormats.join(","),
    options.flagAnswerDifficulty,
    options.limit?.toString() ?? "no-limit",
    getQuizzQuestionsKey({ questions }),
  ].join("|");
}

interface GetQuizzQuestionsKeyParams {
  questions?: readonly QuizzQuestion[];
}

function getQuizzQuestionsKey({
  questions,
}: GetQuizzQuestionsKeyParams): string {
  if (questions === undefined) {
    return "generated";
  }

  return questions
    .map((question) =>
      [
        question.countryCode,
        question.questionFormat,
        question.answerFormat,
      ].join(":"),
    )
    .join(",");
}
