import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  COUNTRIES,
  type Country,
  type SupportedGeoLanguage,
} from "@geopoto/geo-data";

import { isAdaptiveDifficultyEnabled } from "@/modules/adaptive-difficulty/utils/adaptive-difficulty-settings-storage";
import {
  getAdaptiveHistoryEntries,
  type AdaptiveHistoryEntry,
} from "@/modules/adaptive-difficulty/utils/adaptive-history-storage";
import { useGeoLangStore } from "@/utils/language/geo-lang-store";

import {
  createWeightedRandomQuizzQuestion,
  createQuizz,
  type CountryQuestionCounts,
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
  countryQuestionCounts: CountryQuestionCounts;
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
  const isInfiniteModeSession = getIsInfiniteModeSession({
    options,
    questions,
  });
  const isAdaptiveDifficultySelectionEnabled =
    getIsAdaptiveDifficultySelectionEnabled({ questions });
  const [adaptiveHistoryEntries, setAdaptiveHistoryEntries] = useState<
    readonly AdaptiveHistoryEntry[] | null
  >(() => (isAdaptiveDifficultySelectionEnabled ? null : []));
  const isPreparingAdaptiveHistory =
    isAdaptiveDifficultySelectionEnabled && adaptiveHistoryEntries === null;
  const sessionKey = getQuizzSessionKey({ options, questions });
  const sessionStateKey = getQuizzSessionStateKey({
    adaptiveHistoryEntries,
    isAdaptiveDifficultySelectionEnabled,
    sessionKey,
  });
  const previousSessionStateKeyRef = useRef(sessionStateKey);
  const [session, setSession] = useState(() =>
    createQuizzSessionState({
      adaptiveHistoryEntries,
      isAdaptiveDifficultySelectionEnabled,
      options,
      questions,
    }),
  );

  useEffect(() => {
    let isActive = true;

    if (!isAdaptiveDifficultySelectionEnabled) {
      setAdaptiveHistoryEntries([]);

      return () => {
        isActive = false;
      };
    }

    void getAdaptiveHistoryEntries()
      .then((entries) => {
        if (!isActive) {
          return;
        }

        setAdaptiveHistoryEntries(entries);
      })
      .catch((error: unknown) => {
        console.error("Failed to load Adaptive History", error);

        if (!isActive) {
          return;
        }

        setAdaptiveHistoryEntries([]);
      });

    return () => {
      isActive = false;
    };
  }, [isAdaptiveDifficultySelectionEnabled, sessionKey]);

  useEffect(() => {
    if (previousSessionStateKeyRef.current === sessionStateKey) {
      return;
    }

    previousSessionStateKeyRef.current = sessionStateKey;
    setSession(
      createQuizzSessionState({
        adaptiveHistoryEntries,
        isAdaptiveDifficultySelectionEnabled,
        options,
        questions,
      }),
    );
  }, [
    adaptiveHistoryEntries,
    isAdaptiveDifficultySelectionEnabled,
    options,
    questions,
    sessionStateKey,
  ]);

  const currentQuestion = useMemo(
    () =>
      getCurrentQuestion({
        currentQuestionIndex: session.currentQuestionIndex,
        questions: session.questions,
      }),
    [session.currentQuestionIndex, session.questions],
  );
  const score = useMemo(() => getQuizzScore({ session }), [session]);
  const isComplete =
    !isPreparingAdaptiveHistory &&
    !isInfiniteModeSession &&
    score.remainingQuestions === 0;
  const progress =
    isInfiniteModeSession || score.totalQuestions === 0
      ? 1
      : score.answeredQuestions / score.totalQuestions;

  const submitAnswer = useCallback(
    ({ answer }: SubmitQuizzAnswerParams) => {
      setSession((previousSession) =>
        submitAnswerToSession({
          adaptiveHistoryEntries,
          answer,
          geoLang,
          isAdaptiveDifficultySelectionEnabled,
          isInfiniteModeSession,
          options,
          session: previousSession,
        }),
      );
    },
    [
      adaptiveHistoryEntries,
      geoLang,
      isAdaptiveDifficultySelectionEnabled,
      isInfiniteModeSession,
      options,
    ],
  );

  const restartQuizz = useCallback(() => {
    setSession(
      createQuizzSessionState({
        adaptiveHistoryEntries,
        isAdaptiveDifficultySelectionEnabled,
        options,
        questions,
      }),
    );
  }, [
    adaptiveHistoryEntries,
    isAdaptiveDifficultySelectionEnabled,
    options,
    questions,
  ]);

  return {
    currentQuestion,
    isComplete,
    isInfiniteModeSession,
    isPreparingAdaptiveHistory,
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
  adaptiveHistoryEntries: readonly AdaptiveHistoryEntry[] | null;
  isAdaptiveDifficultySelectionEnabled: boolean;
  options: QuizzOptions;
  questions?: readonly QuizzQuestion[];
}

function createQuizzSessionState({
  adaptiveHistoryEntries,
  isAdaptiveDifficultySelectionEnabled,
  options,
  questions,
}: CreateQuizzSessionStateParams): QuizzSessionState {
  const sessionQuestions = createQuizzSessionQuestions({
    adaptiveHistoryEntries,
    isAdaptiveDifficultySelectionEnabled,
    options,
    questions,
  });

  return {
    bestStreak: 0,
    correctAnswers: 0,
    countryQuestionCounts: getCountryQuestionCounts({
      questions: sessionQuestions,
    }),
    currentQuestionIndex: 0,
    currentStreak: 0,
    questions: sessionQuestions,
    wrongAnswers: 0,
  };
}

function createQuizzSessionQuestions({
  adaptiveHistoryEntries,
  isAdaptiveDifficultySelectionEnabled,
  options,
  questions,
}: CreateQuizzSessionStateParams): readonly QuizzQuestion[] {
  if (questions !== undefined) {
    return questions;
  }

  if (isAdaptiveDifficultySelectionEnabled && adaptiveHistoryEntries === null) {
    return [];
  }

  if (!options.isInfiniteMode) {
    return createQuizz({
      ...options,
      adaptiveHistoryEntries: adaptiveHistoryEntries ?? [],
      isAdaptiveDifficultySelectionEnabled,
    });
  }

  const firstQuestion = createWeightedRandomQuizzQuestion({
    adaptiveHistoryEntries: adaptiveHistoryEntries ?? [],
    countryQuestionCounts: {},
    isAdaptiveDifficultySelectionEnabled,
    options,
  });

  if (firstQuestion === null) {
    return [];
  }

  return [firstQuestion];
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
  adaptiveHistoryEntries: readonly AdaptiveHistoryEntry[] | null;
  answer: QuizzAnswerSubmission;
  geoLang: SupportedGeoLanguage;
  isAdaptiveDifficultySelectionEnabled: boolean;
  isInfiniteModeSession: boolean;
  options: QuizzOptions;
  session: QuizzSessionState;
}

function submitAnswerToSession({
  adaptiveHistoryEntries,
  answer,
  geoLang,
  isAdaptiveDifficultySelectionEnabled,
  isInfiniteModeSession,
  options,
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
  const nextSession = {
    ...session,
    bestStreak: Math.max(session.bestStreak, currentStreak),
    correctAnswers: session.correctAnswers + (isCorrectAnswer ? 1 : 0),
    currentQuestionIndex: session.currentQuestionIndex + 1,
    currentStreak,
    wrongAnswers: session.wrongAnswers + (isCorrectAnswer ? 0 : 1),
  };

  if (!isInfiniteModeSession) {
    return nextSession;
  }

  return appendInfiniteModeQuestion({
    adaptiveHistoryEntries,
    isAdaptiveDifficultySelectionEnabled,
    options,
    session: nextSession,
  });
}

interface AppendInfiniteModeQuestionParams {
  adaptiveHistoryEntries: readonly AdaptiveHistoryEntry[] | null;
  isAdaptiveDifficultySelectionEnabled: boolean;
  options: QuizzOptions;
  session: QuizzSessionState;
}

function appendInfiniteModeQuestion({
  adaptiveHistoryEntries,
  isAdaptiveDifficultySelectionEnabled,
  options,
  session,
}: AppendInfiniteModeQuestionParams): QuizzSessionState {
  const nextQuestion = createWeightedRandomQuizzQuestion({
    adaptiveHistoryEntries: adaptiveHistoryEntries ?? [],
    countryQuestionCounts: session.countryQuestionCounts,
    isAdaptiveDifficultySelectionEnabled,
    options,
  });

  if (nextQuestion === null) {
    return session;
  }

  return {
    ...session,
    countryQuestionCounts: addCountryQuestionCount({
      countryCode: nextQuestion.countryCode,
      countryQuestionCounts: session.countryQuestionCounts,
    }),
    questions: [...session.questions, nextQuestion],
  };
}

interface GetCountryQuestionCountsParams {
  questions: readonly QuizzQuestion[];
}

function getCountryQuestionCounts({
  questions,
}: GetCountryQuestionCountsParams): CountryQuestionCounts {
  return questions.reduce<CountryQuestionCounts>(
    (countryQuestionCounts, question) =>
      addCountryQuestionCount({
        countryCode: question.countryCode,
        countryQuestionCounts,
      }),
    {},
  );
}

interface AddCountryQuestionCountParams {
  countryCode: string;
  countryQuestionCounts: CountryQuestionCounts;
}

function addCountryQuestionCount({
  countryCode,
  countryQuestionCounts,
}: AddCountryQuestionCountParams): CountryQuestionCounts {
  const currentCount = countryQuestionCounts[countryCode] ?? 0;

  return {
    ...countryQuestionCounts,
    [countryCode]: currentCount + 1,
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
        acceptedAnswers: getAcceptedTextAnswers({
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
  acceptedAnswers: readonly string[];
}

export function isTextAnswerCorrect({
  answer,
  acceptedAnswers,
}: IsTextAnswerCorrectParams) {
  if (answer.type !== "text") {
    return false;
  }

  const normalizedValue = normalizeQuizzTextAnswer(answer.value);

  return acceptedAnswers.some(
    (acceptedAnswer) =>
      normalizeQuizzTextAnswer(acceptedAnswer) === normalizedValue,
  );
}

interface GetAcceptedTextAnswersParams {
  answerFormat: Extract<QuizzFormat, "country-capital" | "country-name">;
  country: Country;
  geoLang: SupportedGeoLanguage;
}

export function getAcceptedTextAnswers({
  answerFormat,
  country,
  geoLang,
}: GetAcceptedTextAnswersParams): readonly string[] {
  switch (answerFormat) {
    case "country-name":
      return [country.name[geoLang], ...(country.nameAliases?.[geoLang] ?? [])];
    case "country-capital":
      return [
        country.capital[geoLang],
        ...(country.capitalAliases?.[geoLang] ?? []),
      ];
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
    options.answerDifficulty,
    options.isInfiniteMode ? "infinite" : "finite",
    options.limit?.toString() ?? "no-limit",
    getQuizzQuestionsKey({ questions }),
  ].join("|");
}

interface GetQuizzSessionStateKeyParams {
  adaptiveHistoryEntries: readonly AdaptiveHistoryEntry[] | null;
  isAdaptiveDifficultySelectionEnabled: boolean;
  sessionKey: string;
}

function getQuizzSessionStateKey({
  adaptiveHistoryEntries,
  isAdaptiveDifficultySelectionEnabled,
  sessionKey,
}: GetQuizzSessionStateKeyParams): string {
  return [
    sessionKey,
    isAdaptiveDifficultySelectionEnabled ? "adaptive" : "baseline",
    getAdaptiveHistoryEntriesKey({ adaptiveHistoryEntries }),
  ].join("|");
}

interface GetAdaptiveHistoryEntriesKeyParams {
  adaptiveHistoryEntries: readonly AdaptiveHistoryEntry[] | null;
}

function getAdaptiveHistoryEntriesKey({
  adaptiveHistoryEntries,
}: GetAdaptiveHistoryEntriesKeyParams): string {
  if (adaptiveHistoryEntries === null) {
    return "loading";
  }

  return adaptiveHistoryEntries
    .map((entry) =>
      [
        entry.countryCode,
        entry.questionFormat,
        entry.answerFormat,
        entry.successCount,
        entry.failureCount,
      ].join(":"),
    )
    .join(",");
}

interface GetIsInfiniteModeSessionParams {
  options: QuizzOptions;
  questions?: readonly QuizzQuestion[];
}

function getIsInfiniteModeSession({
  options,
  questions,
}: GetIsInfiniteModeSessionParams): boolean {
  return options.isInfiniteMode && questions === undefined;
}

interface GetIsAdaptiveDifficultySelectionEnabledParams {
  questions?: readonly QuizzQuestion[];
}

function getIsAdaptiveDifficultySelectionEnabled({
  questions,
}: GetIsAdaptiveDifficultySelectionEnabledParams): boolean {
  if (questions !== undefined) {
    return false;
  }

  return isAdaptiveDifficultyEnabled();
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
