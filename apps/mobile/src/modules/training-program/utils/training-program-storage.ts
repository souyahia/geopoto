import { useCallback, useMemo } from "react";
import { createMMKV, useMMKVString } from "react-native-mmkv";

import { isMapRegionName, type MapRegionName } from "@geopoto/geo-data";

import { recordPracticeResult } from "@/modules/adaptive-difficulty/utils/adaptive-history-storage";
import type { QuizzFormat } from "@/modules/quizz/utils/quizz";
import { getUtcDayIndex } from "@/utils/dates";

import {
  completeDailyTest,
  createTrainingProgramSnapshot,
  recordTrainingProgramAnswer,
  type TrainingProgramCountryStats,
  type TrainingProgramSnapshot,
  type TrainingProgramStatus,
} from "./training-program";
import { TRAINING_PROGRAM_LESSON_COUNT } from "./training-program-lessons";

const trainingProgramStorage = createMMKV({
  id: "training-program-storage",
});
const TRAINING_PROGRAM_STORAGE_KEY = "training-program";

export function useTrainingProgram() {
  const [storedProgramValue, setStoredProgramValue] = useMMKVString(
    TRAINING_PROGRAM_STORAGE_KEY,
    trainingProgramStorage,
  );
  const snapshot = useMemo(
    () => parseTrainingProgramValue({ value: storedProgramValue }),
    [storedProgramValue],
  );

  const createProgram = useCallback(
    ({ area }: CreateProgramParams): void => {
      setStoredProgramValue(
        getTrainingProgramStorageValue({
          snapshot: createTrainingProgramSnapshot({ area }),
        }),
      );
    },
    [setStoredProgramValue],
  );

  const cancelProgram = useCallback((): void => {
    trainingProgramStorage.remove(TRAINING_PROGRAM_STORAGE_KEY);
  }, []);

  const recordAnswer = useCallback(
    ({
      answerFormat,
      countryCode,
      isCorrectAnswer,
      questionFormat,
    }: RecordAnswerParams): void => {
      const latestSnapshot = readStoredTrainingProgramSnapshot();

      if (latestSnapshot === undefined) {
        return;
      }

      const nextSnapshot = recordTrainingProgramAnswer({
        countryCode,
        isCorrectAnswer,
        snapshot: latestSnapshot,
      });

      setStoredProgramValue(
        getTrainingProgramStorageValue({ snapshot: nextSnapshot }),
      );

      // Distinct, fire-and-forget call into the global Adaptive History store.
      void recordPracticeResult({
        answerFormat,
        countryCode,
        isCorrectAnswer,
        questionFormat,
      });
    },
    [setStoredProgramValue],
  );

  const completeTodaysDailyTest = useCallback(
    ({ correctCount, totalCount }: CompleteTodaysDailyTestParams): void => {
      const latestSnapshot = readStoredTrainingProgramSnapshot();

      if (latestSnapshot === undefined) {
        return;
      }

      const nextSnapshot = completeDailyTest({
        correctCount,
        currentUtcDayIndex: getUtcDayIndex({ date: new Date() }),
        snapshot: latestSnapshot,
        totalCount,
      });

      setStoredProgramValue(
        getTrainingProgramStorageValue({ snapshot: nextSnapshot }),
      );
    },
    [setStoredProgramValue],
  );

  return {
    cancelProgram,
    completeTodaysDailyTest,
    createProgram,
    recordAnswer,
    snapshot,
  };
}

interface CreateProgramParams {
  area: MapRegionName;
}

interface RecordAnswerParams {
  answerFormat: QuizzFormat;
  countryCode: string;
  isCorrectAnswer: boolean;
  questionFormat: QuizzFormat;
}

interface CompleteTodaysDailyTestParams {
  correctCount: number;
  totalCount: number;
}

export function getStoredTrainingProgramSnapshot():
  | TrainingProgramSnapshot
  | undefined {
  return readStoredTrainingProgramSnapshot();
}

function readStoredTrainingProgramSnapshot():
  | TrainingProgramSnapshot
  | undefined {
  return parseTrainingProgramValue({
    value: trainingProgramStorage.getString(TRAINING_PROGRAM_STORAGE_KEY),
  });
}

interface GetTrainingProgramStorageValueParams {
  snapshot: TrainingProgramSnapshot;
}

function getTrainingProgramStorageValue({
  snapshot,
}: GetTrainingProgramStorageValueParams): string {
  return JSON.stringify(snapshot);
}

interface ParseTrainingProgramValueParams {
  value: string | undefined;
}

export function parseTrainingProgramValue({
  value,
}: ParseTrainingProgramValueParams): TrainingProgramSnapshot | undefined {
  if (value === undefined) {
    return undefined;
  }

  try {
    const parsedValue: unknown = JSON.parse(value);

    return parseTrainingProgramSnapshot({ value: parsedValue });
  } catch {
    return undefined;
  }
}

interface ParseTrainingProgramSnapshotParams {
  value: unknown;
}

function parseTrainingProgramSnapshot({
  value,
}: ParseTrainingProgramSnapshotParams): TrainingProgramSnapshot | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const area = parseArea({ value: value.area });
  const status = parseStatus({ value: value.status });

  if (area === undefined || status === undefined) {
    return undefined;
  }

  return {
    area,
    bestStreak: parseCount({ value: value.bestStreak }),
    correctCount: parseCount({ value: value.correctCount }),
    currentLesson: parseCurrentLesson({ value: value.currentLesson }),
    currentStreak: parseCount({ value: value.currentStreak }),
    daysTrained: parseCount({ value: value.daysTrained }),
    lastDailyTestDayIndex: parseDayIndex({
      value: value.lastDailyTestDayIndex,
    }),
    perCountry: parsePerCountry({ value: value.perCountry }),
    status,
    wrongCount: parseCount({ value: value.wrongCount }),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

interface ParseAreaParams {
  value: unknown;
}

function parseArea({ value }: ParseAreaParams): MapRegionName | undefined {
  if (!isMapRegionName(value) || value === "world") {
    return undefined;
  }

  return value;
}

interface ParseStatusParams {
  value: unknown;
}

function parseStatus({
  value,
}: ParseStatusParams): TrainingProgramStatus | undefined {
  if (value === "active" || value === "completed") {
    return value;
  }

  return undefined;
}

interface ParseCurrentLessonParams {
  value: unknown;
}

function parseCurrentLesson({ value }: ParseCurrentLessonParams): number {
  if (typeof value !== "number" || !Number.isInteger(value)) {
    return 1;
  }

  if (value < 1) {
    return 1;
  }

  if (value > TRAINING_PROGRAM_LESSON_COUNT) {
    return TRAINING_PROGRAM_LESSON_COUNT;
  }

  return value;
}

interface ParseCountParams {
  value: unknown;
}

function parseCount({ value }: ParseCountParams): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
    return 0;
  }

  return value;
}

interface ParseDayIndexParams {
  value: unknown;
}

function parseDayIndex({ value }: ParseDayIndexParams): number | undefined {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
    return undefined;
  }

  return value;
}

interface ParsePerCountryParams {
  value: unknown;
}

function parsePerCountry({
  value,
}: ParsePerCountryParams): Record<string, TrainingProgramCountryStats> {
  if (!isRecord(value)) {
    return {};
  }

  return Object.entries(value).reduce<
    Record<string, TrainingProgramCountryStats>
  >((perCountry, [countryCode, countryStats]) => {
    const parsedStats = parseCountryStats({ value: countryStats });

    if (parsedStats === undefined) {
      return perCountry;
    }

    return {
      ...perCountry,
      [countryCode]: parsedStats,
    };
  }, {});
}

interface ParseCountryStatsParams {
  value: unknown;
}

function parseCountryStats({
  value,
}: ParseCountryStatsParams): TrainingProgramCountryStats | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  return {
    correct: parseCount({ value: value.correct }),
    wrong: parseCount({ value: value.wrong }),
  };
}
