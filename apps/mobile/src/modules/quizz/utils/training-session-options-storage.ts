import { useCallback, useMemo } from "react";
import { createMMKV, useMMKVString } from "react-native-mmkv";

import { isMapRegionName, type MapRegionName } from "@geopoto/geo-data";

import {
  hasQuizzFormatConflict,
  isQuizzFormat,
  QUIZZ_ANSWER_FORMATS,
  QUIZZ_FORMATS,
  type QuizzFormat,
  type QuizzOptions,
} from "./quizz";

const trainingSessionOptionsStorage = createMMKV({
  id: "training-session-options-storage",
});
const TRAINING_SESSION_OPTIONS_STORAGE_KEY = "last-training-session-options";
const DEFAULT_TRAINING_SESSION_REGION: MapRegionName = "world";

const DEFAULT_TRAINING_SESSION_OPTIONS = {
  acceptedAnswerFormats: QUIZZ_ANSWER_FORMATS,
  acceptedQuestionFormats: QUIZZ_FORMATS,
  regions: [DEFAULT_TRAINING_SESSION_REGION],
} satisfies QuizzOptions;

interface TrainingSessionOptionsSnapshot {
  acceptedAnswerFormats: readonly QuizzFormat[];
  acceptedQuestionFormats: readonly QuizzFormat[];
  limit?: number;
  regions: readonly MapRegionName[];
}

interface GetTrainingSessionOptionsStorageValueParams {
  options: QuizzOptions;
}

export function getTrainingSessionOptionsStorageValue({
  options,
}: GetTrainingSessionOptionsStorageValueParams): string {
  const snapshot = {
    acceptedAnswerFormats: options.acceptedAnswerFormats,
    acceptedQuestionFormats: options.acceptedQuestionFormats,
    limit: options.limit,
    regions: options.regions,
  } satisfies TrainingSessionOptionsSnapshot;

  return JSON.stringify(snapshot);
}

interface SaveTrainingSessionOptionsParams {
  options: QuizzOptions;
}

interface SaveTrainingSessionOptionsValueParams {
  value: string;
}

export function saveTrainingSessionOptionsValue({
  value,
}: SaveTrainingSessionOptionsValueParams): void {
  trainingSessionOptionsStorage.set(
    TRAINING_SESSION_OPTIONS_STORAGE_KEY,
    value,
  );
}

export function useStoredTrainingSessionOptions() {
  const [
    storedTrainingSessionOptionsValue,
    setStoredTrainingSessionOptionsValue,
  ] = useMMKVString(
    TRAINING_SESSION_OPTIONS_STORAGE_KEY,
    trainingSessionOptionsStorage,
  );
  const storedTrainingSessionOptions = useMemo(
    () =>
      parseTrainingSessionOptionsValue({
        value: storedTrainingSessionOptionsValue,
      }),
    [storedTrainingSessionOptionsValue],
  );
  const saveStoredTrainingSessionOptions = useCallback(
    ({ options }: SaveTrainingSessionOptionsParams) => {
      setStoredTrainingSessionOptionsValue(
        getTrainingSessionOptionsStorageValue({ options }),
      );
    },
    [setStoredTrainingSessionOptionsValue],
  );

  return {
    storedTrainingSessionOptions,
    saveStoredTrainingSessionOptions,
  };
}

interface ParseTrainingSessionOptionsValueParams {
  value: string | undefined;
}

function parseTrainingSessionOptionsValue({
  value,
}: ParseTrainingSessionOptionsValueParams): QuizzOptions {
  if (value === undefined) {
    return DEFAULT_TRAINING_SESSION_OPTIONS;
  }

  try {
    const parsedValue: unknown = JSON.parse(value);

    return parseTrainingSessionOptions({ value: parsedValue });
  } catch {
    return DEFAULT_TRAINING_SESSION_OPTIONS;
  }
}

interface ParseTrainingSessionOptionsParams {
  value: unknown;
}

function parseTrainingSessionOptions({
  value,
}: ParseTrainingSessionOptionsParams): QuizzOptions {
  if (!isRecord(value)) {
    return DEFAULT_TRAINING_SESSION_OPTIONS;
  }

  const parsedOptions = {
    acceptedAnswerFormats: parseQuizzFormats({
      allowedFormats: QUIZZ_ANSWER_FORMATS,
      fallbackFormats: QUIZZ_ANSWER_FORMATS,
      value: value.acceptedAnswerFormats,
    }),
    acceptedQuestionFormats: parseQuizzFormats({
      allowedFormats: QUIZZ_FORMATS,
      fallbackFormats: QUIZZ_FORMATS,
      value: value.acceptedQuestionFormats,
    }),
    limit: parseLimit({ value: value.limit }),
    regions: parseRegions({ value: value.regions }),
  } satisfies QuizzOptions;

  if (!hasQuizzFormatConflict(parsedOptions)) {
    return parsedOptions;
  }

  return {
    ...parsedOptions,
    acceptedAnswerFormats: QUIZZ_ANSWER_FORMATS,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

interface ParseRegionsParams {
  value: unknown;
}

function parseRegions({ value }: ParseRegionsParams): MapRegionName[] {
  if (!Array.isArray(value)) {
    return [DEFAULT_TRAINING_SESSION_REGION];
  }

  const regions = value.filter(isMapRegionName);

  if (regions.length === 0) {
    return [DEFAULT_TRAINING_SESSION_REGION];
  }

  return regions;
}

interface ParseQuizzFormatsParams {
  allowedFormats: readonly QuizzFormat[];
  fallbackFormats: readonly QuizzFormat[];
  value: unknown;
}

function parseQuizzFormats({
  allowedFormats,
  fallbackFormats,
  value,
}: ParseQuizzFormatsParams): readonly QuizzFormat[] {
  if (!Array.isArray(value)) {
    return fallbackFormats;
  }

  const formats = value
    .filter(isQuizzFormat)
    .filter((format) => allowedFormats.includes(format));

  if (formats.length === 0) {
    return fallbackFormats;
  }

  return formats;
}

interface ParseLimitParams {
  value: unknown;
}

function parseLimit({ value }: ParseLimitParams): number | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== "number") {
    return undefined;
  }

  if (!Number.isInteger(value) || value <= 0) {
    return undefined;
  }

  return value;
}
