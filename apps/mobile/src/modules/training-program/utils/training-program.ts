import type { MapRegionName } from "@geopoto/geo-data";

import { TRAINING_PROGRAM_LESSON_COUNT } from "./training-program-lessons";

export type TrainingProgramStatus = "active" | "completed";

export const TRAINING_PROGRAM_PASS_THRESHOLD = 0.95;

export interface TrainingProgramCountryStats {
  correct: number;
  wrong: number;
}

export interface TrainingProgramSnapshot {
  area: MapRegionName;
  currentLesson: number;
  status: TrainingProgramStatus;
  lastDailyTestDayIndex?: number;
  daysTrained: number;
  correctCount: number;
  wrongCount: number;
  currentStreak: number;
  bestStreak: number;
  perCountry: Record<string, TrainingProgramCountryStats>;
}

interface CreateTrainingProgramSnapshotParams {
  area: MapRegionName;
}

/**
 * Initializes a fresh Active program for the given Area. Rejects `world`, which
 * is never a valid Area for a Training Program.
 */
export function createTrainingProgramSnapshot({
  area,
}: CreateTrainingProgramSnapshotParams): TrainingProgramSnapshot {
  if (area === "world") {
    throw new Error("A training program cannot focus the world Area");
  }

  return {
    area,
    bestStreak: 0,
    correctCount: 0,
    currentLesson: 1,
    currentStreak: 0,
    daysTrained: 0,
    perCountry: {},
    status: "active",
    wrongCount: 0,
  };
}

interface IsTodaysDailyTestDoneParams {
  currentUtcDayIndex: number;
  snapshot: TrainingProgramSnapshot;
}

/**
 * Today's Daily Test is gated as done when the persisted day index matches the
 * current UTC day index, so the gate survives an app restart.
 */
export function isTodaysDailyTestDone({
  currentUtcDayIndex,
  snapshot,
}: IsTodaysDailyTestDoneParams): boolean {
  return snapshot.lastDailyTestDayIndex === currentUtcDayIndex;
}

interface RecordTrainingProgramAnswerParams {
  countryCode: string;
  isCorrectAnswer: boolean;
  snapshot: TrainingProgramSnapshot;
}

/**
 * Updates the program-scoped stats for a single answer (Daily Test or Practice).
 * Streaks persist across days and sessions: they reset to 0 on a wrong answer
 * and increment on a correct one. This does NOT touch the global Adaptive
 * History; that is a separate, distinct call in a different store.
 */
export function recordTrainingProgramAnswer({
  countryCode,
  isCorrectAnswer,
  snapshot,
}: RecordTrainingProgramAnswerParams): TrainingProgramSnapshot {
  const currentStreak = isCorrectAnswer ? snapshot.currentStreak + 1 : 0;
  const bestStreak = Math.max(snapshot.bestStreak, currentStreak);
  const previousCountryStats = snapshot.perCountry[countryCode] ?? {
    correct: 0,
    wrong: 0,
  };
  const nextCountryStats: TrainingProgramCountryStats = {
    correct: previousCountryStats.correct + (isCorrectAnswer ? 1 : 0),
    wrong: previousCountryStats.wrong + (isCorrectAnswer ? 0 : 1),
  };

  return {
    ...snapshot,
    bestStreak,
    correctCount: snapshot.correctCount + (isCorrectAnswer ? 1 : 0),
    currentStreak,
    perCountry: {
      ...snapshot.perCountry,
      [countryCode]: nextCountryStats,
    },
    wrongCount: snapshot.wrongCount + (isCorrectAnswer ? 0 : 1),
  };
}

interface CompleteDailyTestParams {
  correctCount: number;
  currentUtcDayIndex: number;
  snapshot: TrainingProgramSnapshot;
  totalCount: number;
}

/**
 * Single owner of the active -> completed transition. Given the day's
 * first-attempt score, a pass (>=95%) advances the current lesson, a fail keeps
 * it. Always records the day index and increments the days-trained counter.
 * Passing the final lesson completes the program without incrementing past it.
 */
export function completeDailyTest({
  correctCount,
  currentUtcDayIndex,
  snapshot,
  totalCount,
}: CompleteDailyTestParams): TrainingProgramSnapshot {
  const score = getDailyTestScore({ correctCount, totalCount });
  const hasPassed = score >= TRAINING_PROGRAM_PASS_THRESHOLD;
  const baseSnapshot: TrainingProgramSnapshot = {
    ...snapshot,
    daysTrained: snapshot.daysTrained + 1,
    lastDailyTestDayIndex: currentUtcDayIndex,
  };

  if (!hasPassed) {
    return baseSnapshot;
  }

  if (snapshot.currentLesson >= TRAINING_PROGRAM_LESSON_COUNT) {
    return {
      ...baseSnapshot,
      status: "completed",
    };
  }

  return {
    ...baseSnapshot,
    currentLesson: snapshot.currentLesson + 1,
  };
}

interface GetDailyTestScoreParams {
  correctCount: number;
  totalCount: number;
}

function getDailyTestScore({
  correctCount,
  totalCount,
}: GetDailyTestScoreParams): number {
  if (totalCount <= 0) {
    return 0;
  }

  return correctCount / totalCount;
}
