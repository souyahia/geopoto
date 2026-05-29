import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import { getDailyChallenge } from "@/modules/daily-challenge/utils/daily-challenge";
import {
  getStoredPendingDailyChallengeStreak,
  getStoredPlayedDailyChallengeDateKeys,
} from "@/modules/daily-challenge/utils/daily-challenge-progress-storage";

import { getDailyChallengeReminderNotificationBody } from "./daily-challenge-reminder-copy";

export const DAILY_CHALLENGE_REMINDER_DEFAULT_HOUR = 10;
export const DAILY_CHALLENGE_REMINDER_DEFAULT_MINUTE = 0;
export const DAILY_CHALLENGE_REMINDER_TIME_STEP_MINUTES = 5;

const DAILY_CHALLENGE_REMINDER_CHANNEL_ID = "daily-challenge-reminders";
const DAILY_CHALLENGE_REMINDER_NOTIFICATION_ID = "daily-challenge-reminder";
const DAILY_CHALLENGE_REMINDER_QUEUE_SIZE = 2;
const DAILY_CHALLENGE_REMINDER_CANDIDATE_LIMIT = 14;
export const DAILY_CHALLENGE_REMINDER_NOTIFICATION_TYPE =
  "daily-challenge-reminder";

export interface DailyChallengeReminderTime {
  hour: number;
  minute: number;
}

export type DailyChallengeReminderPermissionStatus =
  | "denied"
  | "granted"
  | "undetermined";

export interface DailyChallengeReminderNotificationContent {
  body: string;
  channelName: string;
  title: string;
}

export interface DailyChallengeReminderPlanItem {
  date: Date;
  dateKey: string;
  identifier: string;
  streak: number;
}

interface GetNextDailyChallengeReminderDateParams {
  now: Date;
  reminderTime: DailyChallengeReminderTime;
}

export function getNextDailyChallengeReminderDate({
  now,
  reminderTime,
}: GetNextDailyChallengeReminderDateParams): Date {
  const nextDate = new Date(now);
  nextDate.setHours(reminderTime.hour, reminderTime.minute, 0, 0);

  if (nextDate.getTime() <= now.getTime()) {
    nextDate.setDate(nextDate.getDate() + 1);
  }

  return nextDate;
}

interface GetDailyChallengeReminderQueuePlanParams {
  now: Date;
  playedDateKeys: readonly string[];
  reminderTime: DailyChallengeReminderTime;
}

export function getDailyChallengeReminderQueuePlan({
  now,
  playedDateKeys,
  reminderTime,
}: GetDailyChallengeReminderQueuePlanParams): readonly DailyChallengeReminderPlanItem[] {
  return getDailyChallengeReminderCandidates({
    now,
    reminderTime,
  })
    .filter((candidate) => !playedDateKeys.includes(candidate.dateKey))
    .slice(0, DAILY_CHALLENGE_REMINDER_QUEUE_SIZE);
}

interface GetDailyChallengeReminderCandidatesParams {
  now: Date;
  reminderTime: DailyChallengeReminderTime;
}

function getDailyChallengeReminderCandidates({
  now,
  reminderTime,
}: GetDailyChallengeReminderCandidatesParams): readonly DailyChallengeReminderPlanItem[] {
  const firstReminderDate = getNextDailyChallengeReminderDate({
    now,
    reminderTime,
  });

  return Array.from(
    { length: DAILY_CHALLENGE_REMINDER_CANDIDATE_LIMIT },
    (_value, index) => {
      const date = new Date(firstReminderDate);
      date.setDate(firstReminderDate.getDate() + index);

      const challenge = getDailyChallenge({ now: date });

      return {
        date,
        dateKey: challenge.dateKey,
        identifier: getDailyChallengeReminderNotificationIdentifier({
          dateKey: challenge.dateKey,
        }),
        streak: getStoredPendingDailyChallengeStreak({ challenge }),
      };
    },
  );
}

interface GetDailyChallengeReminderNotificationIdentifierParams {
  dateKey: string;
}

function getDailyChallengeReminderNotificationIdentifier({
  dateKey,
}: GetDailyChallengeReminderNotificationIdentifierParams): string {
  return `${DAILY_CHALLENGE_REMINDER_NOTIFICATION_ID}:${dateKey}`;
}

export async function getDailyChallengeReminderPermissionStatus(): Promise<DailyChallengeReminderPermissionStatus> {
  const permissions = await Notifications.getPermissionsAsync();

  return getReminderPermissionStatus({ permissions });
}

export async function requestDailyChallengeReminderPermission(): Promise<DailyChallengeReminderPermissionStatus> {
  const permissions = await Notifications.requestPermissionsAsync({
    android: {},
    ios: {
      allowAlert: true,
      allowBadge: false,
      allowSound: true,
    },
  });

  return getReminderPermissionStatus({ permissions });
}

interface ScheduleDailyChallengeReminderQueueParams {
  content: DailyChallengeReminderNotificationContent;
  reminderTime: DailyChallengeReminderTime;
}

export async function scheduleDailyChallengeReminderQueue({
  content,
  reminderTime,
}: ScheduleDailyChallengeReminderQueueParams): Promise<void> {
  await cancelDailyChallengeReminders();
  await ensureDailyChallengeReminderChannel({
    channelName: content.channelName,
  });

  const reminderPlan = getDailyChallengeReminderQueuePlan({
    now: new Date(),
    playedDateKeys: getStoredPlayedDailyChallengeDateKeys(),
    reminderTime,
  });

  await Promise.all(
    reminderPlan.map((reminder) =>
      Notifications.scheduleNotificationAsync({
        content: {
          body: getDailyChallengeReminderNotificationBody({
            dateKey: reminder.dateKey,
            streak: reminder.streak,
          }),
          data: {
            dateKey: reminder.dateKey,
            type: DAILY_CHALLENGE_REMINDER_NOTIFICATION_TYPE,
          },
          sound: "default",
          title: content.title,
        },
        identifier: reminder.identifier,
        trigger: {
          channelId: DAILY_CHALLENGE_REMINDER_CHANNEL_ID,
          date: reminder.date,
          type: Notifications.SchedulableTriggerInputTypes.DATE,
        },
      }),
    ),
  );
}

export async function cancelDailyChallengeReminders(): Promise<void> {
  const scheduledNotifications =
    await Notifications.getAllScheduledNotificationsAsync();
  const notificationIdentifiers = [
    ...new Set([
      DAILY_CHALLENGE_REMINDER_NOTIFICATION_ID,
      ...scheduledNotifications
        .filter((notification) =>
          hasCancellableDailyChallengeReminderRequest({
            request: notification,
          }),
        )
        .map((notification) => notification.identifier),
    ]),
  ];

  await Promise.all(
    notificationIdentifiers.map((identifier) =>
      Notifications.cancelScheduledNotificationAsync(identifier),
    ),
  );
}

export async function clearDeliveredDailyChallengeReminders(): Promise<void> {
  const deliveredNotifications =
    await Notifications.getPresentedNotificationsAsync();
  const notificationIdentifiers = [
    ...new Set(
      deliveredNotifications
        .filter((notification) =>
          hasDailyChallengeReminderRequest({ request: notification.request }),
        )
        .map((notification) => notification.request.identifier),
    ),
  ];

  await Promise.all(
    notificationIdentifiers.map((identifier) =>
      Notifications.dismissNotificationAsync(identifier),
    ),
  );
}

interface EnsureDailyChallengeReminderChannelParams {
  channelName: string;
}

async function ensureDailyChallengeReminderChannel({
  channelName,
}: EnsureDailyChallengeReminderChannelParams): Promise<void> {
  if (Platform.OS !== "android") {
    return;
  }

  await Notifications.setNotificationChannelAsync(
    DAILY_CHALLENGE_REMINDER_CHANNEL_ID,
    {
      importance: Notifications.AndroidImportance.DEFAULT,
      name: channelName,
    },
  );
}

interface GetReminderPermissionStatusParams {
  permissions: Notifications.NotificationPermissionsStatus;
}

function getReminderPermissionStatus({
  permissions,
}: GetReminderPermissionStatusParams): DailyChallengeReminderPermissionStatus {
  if (permissions.granted) {
    return "granted";
  }

  if (permissions.status === Notifications.PermissionStatus.DENIED) {
    return "denied";
  }

  return "undetermined";
}

export interface HasDailyChallengeReminderRequestParams {
  request: Notifications.NotificationRequest;
}

export function hasDailyChallengeReminderRequest({
  request,
}: HasDailyChallengeReminderRequestParams): boolean {
  return isDailyChallengeReminderRequest({ request });
}

function hasCancellableDailyChallengeReminderRequest({
  request,
}: HasDailyChallengeReminderRequestParams): boolean {
  return isDailyChallengeReminderRequest({ request });
}

function isDailyChallengeReminderRequest({
  request,
}: HasDailyChallengeReminderRequestParams): boolean {
  if (request.identifier === DAILY_CHALLENGE_REMINDER_NOTIFICATION_ID) {
    return true;
  }

  return hasDailyChallengeReminderNotificationData({
    data: request.content.data,
  });
}

export interface HasDailyChallengeReminderNotificationDataParams {
  data?: Record<string, unknown>;
}

export function hasDailyChallengeReminderNotificationData({
  data,
}: HasDailyChallengeReminderNotificationDataParams): boolean {
  return (
    data?.type === DAILY_CHALLENGE_REMINDER_NOTIFICATION_TYPE ||
    data?.kind === DAILY_CHALLENGE_REMINDER_NOTIFICATION_TYPE
  );
}
