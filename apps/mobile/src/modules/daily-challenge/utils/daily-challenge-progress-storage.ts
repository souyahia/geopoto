import { useCallback, useMemo } from "react";
import { createMMKV, useMMKVString } from "react-native-mmkv";

import type { DailyChallenge } from "./daily-challenge";

const dailyChallengeProgressStorage = createMMKV({
  id: "daily-challenge-progress-storage",
});
const DAILY_CHALLENGE_PROGRESS_STORAGE_KEY = "daily-challenge-progress";
const DEFAULT_DAILY_CHALLENGE_PROGRESS_SNAPSHOT = {
  currentStreak: 0,
} satisfies DailyChallengeProgressSnapshot;

export type DailyChallengeStatus = "completed" | "failed" | "not-played";
export type DailyChallengeResultStatus = Exclude<
  DailyChallengeStatus,
  "not-played"
>;

export interface DailyChallengeProgress {
  dateKey: string;
  status: DailyChallengeStatus;
  streak: number;
}

interface DailyChallengeProgressSnapshot {
  currentStreak: number;
  lastPlayedDateKey?: string;
  lastPlayedDayIndex?: number;
  lastStatus?: DailyChallengeResultStatus;
}

interface UseDailyChallengeProgressParams {
  challenge: DailyChallenge;
}

export function useDailyChallengeProgress({
  challenge,
}: UseDailyChallengeProgressParams) {
  const [storedProgressValue, setStoredProgressValue] = useMMKVString(
    DAILY_CHALLENGE_PROGRESS_STORAGE_KEY,
    dailyChallengeProgressStorage,
  );
  const snapshot = useMemo(
    () => parseDailyChallengeProgressValue({ value: storedProgressValue }),
    [storedProgressValue],
  );
  const progress = useMemo(
    () => getDailyChallengeProgress({ challenge, snapshot }),
    [challenge, snapshot],
  );
  const completeDailyChallenge = useCallback(
    ({ isSuccessful }: CompleteDailyChallengeParams): boolean => {
      const latestSnapshot = parseDailyChallengeProgressValue({
        value: dailyChallengeProgressStorage.getString(
          DAILY_CHALLENGE_PROGRESS_STORAGE_KEY,
        ),
      });
      const latestProgress = getDailyChallengeProgress({
        challenge,
        snapshot: latestSnapshot,
      });

      if (latestProgress.status !== "not-played") {
        return false;
      }

      const nextSnapshot = getCompletedDailyChallengeSnapshot({
        challenge,
        isSuccessful,
        previousSnapshot: latestSnapshot,
      });

      setStoredProgressValue(
        getDailyChallengeProgressStorageValue({ snapshot: nextSnapshot }),
      );

      return true;
    },
    [challenge, setStoredProgressValue],
  );

  return {
    completeDailyChallenge,
    progress,
  };
}

export function getStoredPlayedDailyChallengeDateKeys(): readonly string[] {
  const snapshot = parseDailyChallengeProgressValue({
    value: dailyChallengeProgressStorage.getString(
      DAILY_CHALLENGE_PROGRESS_STORAGE_KEY,
    ),
  });

  if (snapshot.lastPlayedDateKey === undefined) {
    return [];
  }

  return [snapshot.lastPlayedDateKey];
}

interface GetStoredPendingDailyChallengeStreakParams {
  challenge: DailyChallenge;
}

export function getStoredPendingDailyChallengeStreak({
  challenge,
}: GetStoredPendingDailyChallengeStreakParams): number {
  const snapshot = parseDailyChallengeProgressValue({
    value: dailyChallengeProgressStorage.getString(
      DAILY_CHALLENGE_PROGRESS_STORAGE_KEY,
    ),
  });

  return getPendingDailyChallengeStreak({ challenge, snapshot });
}

interface CompleteDailyChallengeParams {
  isSuccessful: boolean;
}

interface GetDailyChallengeProgressParams {
  challenge: DailyChallenge;
  snapshot: DailyChallengeProgressSnapshot;
}

function getDailyChallengeProgress({
  challenge,
  snapshot,
}: GetDailyChallengeProgressParams): DailyChallengeProgress {
  if (
    snapshot.lastPlayedDateKey === challenge.dateKey &&
    snapshot.lastStatus !== undefined
  ) {
    return {
      dateKey: challenge.dateKey,
      status: snapshot.lastStatus,
      streak: snapshot.currentStreak,
    };
  }

  return {
    dateKey: challenge.dateKey,
    status: "not-played",
    streak: getPendingDailyChallengeStreak({ challenge, snapshot }),
  };
}

interface GetPendingDailyChallengeStreakParams {
  challenge: DailyChallenge;
  snapshot: DailyChallengeProgressSnapshot;
}

function getPendingDailyChallengeStreak({
  challenge,
  snapshot,
}: GetPendingDailyChallengeStreakParams): number {
  if (snapshot.lastStatus !== "completed") {
    return 0;
  }

  if (snapshot.lastPlayedDayIndex !== challenge.dayIndex - 1) {
    return 0;
  }

  return snapshot.currentStreak;
}

interface GetCompletedDailyChallengeSnapshotParams {
  challenge: DailyChallenge;
  isSuccessful: boolean;
  previousSnapshot: DailyChallengeProgressSnapshot;
}

function getCompletedDailyChallengeSnapshot({
  challenge,
  isSuccessful,
  previousSnapshot,
}: GetCompletedDailyChallengeSnapshotParams): DailyChallengeProgressSnapshot {
  const lastStatus: DailyChallengeResultStatus = isSuccessful
    ? "completed"
    : "failed";
  const currentStreak = isSuccessful
    ? getNextSuccessfulDailyChallengeStreak({
        challenge,
        previousSnapshot,
      })
    : 0;

  return {
    currentStreak,
    lastPlayedDateKey: challenge.dateKey,
    lastPlayedDayIndex: challenge.dayIndex,
    lastStatus,
  };
}

interface GetNextSuccessfulDailyChallengeStreakParams {
  challenge: DailyChallenge;
  previousSnapshot: DailyChallengeProgressSnapshot;
}

function getNextSuccessfulDailyChallengeStreak({
  challenge,
  previousSnapshot,
}: GetNextSuccessfulDailyChallengeStreakParams): number {
  if (
    previousSnapshot.lastStatus === "completed" &&
    previousSnapshot.lastPlayedDayIndex === challenge.dayIndex - 1
  ) {
    return previousSnapshot.currentStreak + 1;
  }

  return 1;
}

interface GetDailyChallengeProgressStorageValueParams {
  snapshot: DailyChallengeProgressSnapshot;
}

function getDailyChallengeProgressStorageValue({
  snapshot,
}: GetDailyChallengeProgressStorageValueParams): string {
  return JSON.stringify(snapshot);
}

interface ParseDailyChallengeProgressValueParams {
  value: string | undefined;
}

function parseDailyChallengeProgressValue({
  value,
}: ParseDailyChallengeProgressValueParams): DailyChallengeProgressSnapshot {
  if (value === undefined) {
    return DEFAULT_DAILY_CHALLENGE_PROGRESS_SNAPSHOT;
  }

  try {
    const parsedValue: unknown = JSON.parse(value);

    return parseDailyChallengeProgressSnapshot({ value: parsedValue });
  } catch {
    return DEFAULT_DAILY_CHALLENGE_PROGRESS_SNAPSHOT;
  }
}

interface ParseDailyChallengeProgressSnapshotParams {
  value: unknown;
}

function parseDailyChallengeProgressSnapshot({
  value,
}: ParseDailyChallengeProgressSnapshotParams): DailyChallengeProgressSnapshot {
  if (!isRecord(value)) {
    return DEFAULT_DAILY_CHALLENGE_PROGRESS_SNAPSHOT;
  }

  const currentStreak = parseCurrentStreak({ value: value.currentStreak });
  const lastPlayedDateKey = parseDateKey({ value: value.lastPlayedDateKey });
  const lastPlayedDayIndex = parseDayIndex({
    value: value.lastPlayedDayIndex,
  });
  const lastStatus = parseDailyChallengeResultStatus({
    value: value.lastStatus,
  });

  if (
    lastPlayedDateKey === undefined ||
    lastPlayedDayIndex === undefined ||
    lastStatus === undefined
  ) {
    return {
      currentStreak,
    };
  }

  return {
    currentStreak,
    lastPlayedDateKey,
    lastPlayedDayIndex,
    lastStatus,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

interface ParseCurrentStreakParams {
  value: unknown;
}

function parseCurrentStreak({ value }: ParseCurrentStreakParams): number {
  if (typeof value !== "number") {
    return 0;
  }

  if (!Number.isInteger(value) || value < 0) {
    return 0;
  }

  return value;
}

interface ParseDateKeyParams {
  value: unknown;
}

function parseDateKey({ value }: ParseDateKeyParams): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return undefined;
  }

  return value;
}

interface ParseDayIndexParams {
  value: unknown;
}

function parseDayIndex({ value }: ParseDayIndexParams): number | undefined {
  if (typeof value !== "number") {
    return undefined;
  }

  if (!Number.isInteger(value) || value < 0) {
    return undefined;
  }

  return value;
}

interface ParseDailyChallengeResultStatusParams {
  value: unknown;
}

function parseDailyChallengeResultStatus({
  value,
}: ParseDailyChallengeResultStatusParams):
  | DailyChallengeResultStatus
  | undefined {
  if (value === "completed" || value === "failed") {
    return value;
  }

  return undefined;
}
