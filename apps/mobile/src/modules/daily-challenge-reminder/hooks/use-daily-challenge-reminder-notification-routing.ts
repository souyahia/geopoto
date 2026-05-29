import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { useCallback, useLayoutEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { AppState, type AppStateStatus } from "react-native";

import {
  clearDeliveredDailyChallengeReminders,
  hasDailyChallengeReminderRequest,
} from "../utils/daily-challenge-reminder-notifications";
import { reconcileStoredDailyChallengeReminders } from "../utils/daily-challenge-reminder-reconciliation";

const DAILY_CHALLENGE_ROUTE = "/daily-challenge";

export function useDailyChallengeReminderNotificationRouting() {
  const router = useRouter();
  const { t } = useTranslation();
  const handledResponseKeyRef = useRef<string | null>(null);
  const notificationContent = useMemo(
    () => ({
      body: t("settings.daily-challenge-reminder.notification.body"),
      channelName: t(
        "settings.daily-challenge-reminder.notification.channel-name",
      ),
      title: t("settings.daily-challenge-reminder.notification.title"),
    }),
    [t],
  );

  const clearDeliveredReminders = useCallback(() => {
    void clearDeliveredDailyChallengeReminders().catch(() => undefined);
  }, []);

  const reconcileReminders = useCallback(() => {
    void reconcileStoredDailyChallengeReminders({
      content: notificationContent,
    }).catch(() => undefined);
  }, [notificationContent]);

  const handleNotificationResponse = useCallback(
    ({ response }: HandleNotificationResponseParams) => {
      if (!shouldOpenDailyChallengeFromResponse({ response })) {
        return;
      }

      const responseKey = getNotificationResponseKey({ response });

      if (handledResponseKeyRef.current === responseKey) {
        return;
      }

      handledResponseKeyRef.current = responseKey;
      router.push(DAILY_CHALLENGE_ROUTE);
      clearDeliveredReminders();
      reconcileReminders();
      clearLastNotificationResponse();
    },
    [clearDeliveredReminders, reconcileReminders, router],
  );

  useLayoutEffect(() => {
    clearDeliveredReminders();
    reconcileReminders();

    const lastNotificationResponse = getLastNotificationResponse();

    if (lastNotificationResponse !== null) {
      handleNotificationResponse({ response: lastNotificationResponse });
    }

    const responseSubscription =
      Notifications.addNotificationResponseReceivedListener((response) => {
        handleNotificationResponse({ response });
      });
    const receivedSubscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        if (
          hasDailyChallengeReminderRequest({
            request: notification.request,
          })
        ) {
          clearDeliveredReminders();
          reconcileReminders();
        }
      },
    );
    const appStateSubscription = AppState.addEventListener(
      "change",
      (state) => {
        if (isAppStateActive({ state })) {
          clearDeliveredReminders();
          reconcileReminders();
        }
      },
    );

    return () => {
      responseSubscription.remove();
      receivedSubscription.remove();
      appStateSubscription.remove();
    };
  }, [clearDeliveredReminders, handleNotificationResponse, reconcileReminders]);
}

interface HandleNotificationResponseParams {
  response: Notifications.NotificationResponse;
}

function shouldOpenDailyChallengeFromResponse({
  response,
}: HandleNotificationResponseParams): boolean {
  if (response.actionIdentifier !== Notifications.DEFAULT_ACTION_IDENTIFIER) {
    return false;
  }

  return hasDailyChallengeReminderRequest({
    request: response.notification.request,
  });
}

function getNotificationResponseKey({
  response,
}: HandleNotificationResponseParams): string {
  const { notification } = response;

  return [
    response.actionIdentifier,
    notification.date,
    notification.request.identifier,
  ].join(":");
}

function getLastNotificationResponse(): Notifications.NotificationResponse | null {
  try {
    return Notifications.getLastNotificationResponse();
  } catch {
    return null;
  }
}

function clearLastNotificationResponse(): void {
  try {
    Notifications.clearLastNotificationResponse();
  } catch {}
}

interface IsAppStateActiveParams {
  state: AppStateStatus;
}

function isAppStateActive({ state }: IsAppStateActiveParams): boolean {
  return state === "active";
}
