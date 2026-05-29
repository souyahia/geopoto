import { useCallback, useMemo } from "react";
import { createMMKV, useMMKVBoolean, useMMKVString } from "react-native-mmkv";

import {
  DAILY_CHALLENGE_REMINDER_DEFAULT_HOUR,
  DAILY_CHALLENGE_REMINDER_DEFAULT_MINUTE,
  DAILY_CHALLENGE_REMINDER_TIME_STEP_MINUTES,
  type DailyChallengeReminderTime,
} from "./daily-challenge-reminder-notifications";

const dailyChallengeReminderStorage = createMMKV({
  id: "daily-challenge-reminder-storage",
});
const DAILY_CHALLENGE_REMINDER_ENABLED_STORAGE_KEY =
  "daily-challenge-reminder-enabled";
const DAILY_CHALLENGE_REMINDER_TIME_STORAGE_KEY =
  "daily-challenge-reminder-time";
const DAILY_CHALLENGE_REMINDER_TIME_STORAGE_VALUE_PATTERN = /^\d{2}:\d{2}$/;

const DEFAULT_DAILY_CHALLENGE_REMINDER_TIME = {
  hour: DAILY_CHALLENGE_REMINDER_DEFAULT_HOUR,
  minute: DAILY_CHALLENGE_REMINDER_DEFAULT_MINUTE,
} satisfies DailyChallengeReminderTime;

interface DailyChallengeReminderSettingsStorageValue {
  isStoredEnabled: boolean;
  reminderTime: DailyChallengeReminderTime;
  setStoredIsEnabled: (value: boolean) => void;
  setStoredReminderTime: (value: DailyChallengeReminderTime) => void;
}

export interface DailyChallengeReminderStoredSettings {
  isEnabled: boolean;
  reminderTime: DailyChallengeReminderTime;
}

export function useDailyChallengeReminderSettingsStorage(): DailyChallengeReminderSettingsStorageValue {
  const [isStoredEnabled = false, setStoredIsEnabled] = useMMKVBoolean(
    DAILY_CHALLENGE_REMINDER_ENABLED_STORAGE_KEY,
    dailyChallengeReminderStorage,
  );
  const [storedReminderTimeValue, setStoredReminderTimeValue] = useMMKVString(
    DAILY_CHALLENGE_REMINDER_TIME_STORAGE_KEY,
    dailyChallengeReminderStorage,
  );
  const reminderTime = useMemo(
    () =>
      parseDailyChallengeReminderTimeValue({
        value: storedReminderTimeValue,
      }),
    [storedReminderTimeValue],
  );
  const setStoredReminderTime = useCallback(
    (value: DailyChallengeReminderTime) => {
      setStoredReminderTimeValue(
        getDailyChallengeReminderTimeStorageValue({ reminderTime: value }),
      );
    },
    [setStoredReminderTimeValue],
  );

  return {
    isStoredEnabled,
    reminderTime,
    setStoredIsEnabled,
    setStoredReminderTime,
  };
}

export function getStoredDailyChallengeReminderSettings(): DailyChallengeReminderStoredSettings {
  return {
    isEnabled:
      dailyChallengeReminderStorage.getBoolean(
        DAILY_CHALLENGE_REMINDER_ENABLED_STORAGE_KEY,
      ) ?? false,
    reminderTime: parseDailyChallengeReminderTimeValue({
      value: dailyChallengeReminderStorage.getString(
        DAILY_CHALLENGE_REMINDER_TIME_STORAGE_KEY,
      ),
    }),
  };
}

interface GetDailyChallengeReminderTimeStorageValueParams {
  reminderTime: DailyChallengeReminderTime;
}

export function getDailyChallengeReminderTimeStorageValue({
  reminderTime,
}: GetDailyChallengeReminderTimeStorageValueParams): string {
  return `${getPaddedTimePart({ value: reminderTime.hour })}:${getPaddedTimePart(
    {
      value: reminderTime.minute,
    },
  )}`;
}

interface ParseDailyChallengeReminderTimeValueParams {
  value: string | undefined;
}

function parseDailyChallengeReminderTimeValue({
  value,
}: ParseDailyChallengeReminderTimeValueParams): DailyChallengeReminderTime {
  if (value === undefined) {
    return DEFAULT_DAILY_CHALLENGE_REMINDER_TIME;
  }

  if (!isDailyChallengeReminderTimeStorageValue({ value })) {
    return DEFAULT_DAILY_CHALLENGE_REMINDER_TIME;
  }

  const reminderTime = {
    hour: Number(value.slice(0, 2)),
    minute: Number(value.slice(3, 5)),
  } satisfies DailyChallengeReminderTime;

  if (!isDailyChallengeReminderTime(reminderTime)) {
    return DEFAULT_DAILY_CHALLENGE_REMINDER_TIME;
  }

  return reminderTime;
}

function isDailyChallengeReminderTime(
  value: DailyChallengeReminderTime,
): boolean {
  return (
    Number.isInteger(value.hour) &&
    Number.isInteger(value.minute) &&
    value.hour >= 0 &&
    value.hour <= 23 &&
    value.minute >= 0 &&
    value.minute <= 59 &&
    value.minute % DAILY_CHALLENGE_REMINDER_TIME_STEP_MINUTES === 0
  );
}

interface IsDailyChallengeReminderTimeStorageValueParams {
  value: string;
}

function isDailyChallengeReminderTimeStorageValue({
  value,
}: IsDailyChallengeReminderTimeStorageValueParams): boolean {
  return DAILY_CHALLENGE_REMINDER_TIME_STORAGE_VALUE_PATTERN.test(value);
}

interface GetPaddedTimePartParams {
  value: number;
}

function getPaddedTimePart({ value }: GetPaddedTimePartParams): string {
  return value.toString().padStart(2, "0");
}
