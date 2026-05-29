import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import { AppState, Linking } from "react-native";

import {
  cancelDailyChallengeReminders,
  type DailyChallengeReminderTime,
  type DailyChallengeReminderNotificationContent,
  type DailyChallengeReminderPermissionStatus,
  getDailyChallengeReminderPermissionStatus,
  requestDailyChallengeReminderPermission,
  scheduleDailyChallengeReminderQueue,
} from "../utils/daily-challenge-reminder-notifications";
import { useDailyChallengeReminderSettingsStorage } from "../utils/daily-challenge-reminder-settings-storage";

interface UseDailyChallengeReminderSettingsParams {
  content: DailyChallengeReminderNotificationContent;
}

export function useDailyChallengeReminderSettings({
  content,
}: UseDailyChallengeReminderSettingsParams) {
  const {
    isStoredEnabled,
    reminderTime,
    setStoredIsEnabled,
    setStoredReminderTime,
  } = useDailyChallengeReminderSettingsStorage();
  const [permissionStatus, setPermissionStatus] =
    useState<DailyChallengeReminderPermissionStatus>("undetermined");
  const [isPermissionRefreshing, setIsPermissionRefreshing] = useState(true);
  const [isPreferenceUpdating, setIsPreferenceUpdating] = useState(false);

  const disableDailyChallengeReminders = useCallback(async () => {
    setStoredIsEnabled(false);
    await cancelDailyChallengeReminders();
  }, [setStoredIsEnabled]);

  const refreshAvailability = useCallback(async () => {
    setIsPermissionRefreshing(true);

    try {
      const nextPermissionStatus =
        await getDailyChallengeReminderPermissionStatus();
      setPermissionStatus(nextPermissionStatus);

      if (nextPermissionStatus === "granted") {
        if (isStoredEnabled) {
          await scheduleDailyChallengeReminderQueue({
            content,
            reminderTime,
          });
        }

        return;
      }

      if (isStoredEnabled) {
        await disableDailyChallengeReminders();
      }
    } catch {
      setPermissionStatus("denied");

      if (isStoredEnabled) {
        await disableDailyChallengeReminders();
      }
    } finally {
      setIsPermissionRefreshing(false);
    }
  }, [content, disableDailyChallengeReminders, isStoredEnabled, reminderTime]);

  useFocusEffect(
    useCallback(() => {
      void refreshAvailability();
    }, [refreshAvailability]),
  );

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        void refreshAvailability();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [refreshAvailability]);

  const setIsDailyChallengeReminderEnabled = useCallback(
    async (isEnabled: boolean) => {
      setIsPreferenceUpdating(true);

      try {
        if (!isEnabled) {
          await disableDailyChallengeReminders();
          return;
        }

        const nextPermissionStatus =
          await requestDailyChallengeReminderPermission();
        setPermissionStatus(nextPermissionStatus);

        if (nextPermissionStatus !== "granted") {
          await disableDailyChallengeReminders();
          return;
        }

        await scheduleDailyChallengeReminderQueue({ content, reminderTime });
        setStoredIsEnabled(true);
      } catch {
        await disableDailyChallengeReminders();
      } finally {
        setIsPreferenceUpdating(false);
      }
    },
    [content, disableDailyChallengeReminders, reminderTime, setStoredIsEnabled],
  );

  const setDailyChallengeReminderTime = useCallback(
    async (nextReminderTime: DailyChallengeReminderTime) => {
      setIsPreferenceUpdating(true);
      setStoredReminderTime(nextReminderTime);

      try {
        if (!isStoredEnabled || permissionStatus !== "granted") {
          return;
        }

        const nextPermissionStatus =
          await getDailyChallengeReminderPermissionStatus();
        setPermissionStatus(nextPermissionStatus);

        if (nextPermissionStatus !== "granted") {
          await disableDailyChallengeReminders();
          return;
        }

        await scheduleDailyChallengeReminderQueue({
          content,
          reminderTime: nextReminderTime,
        });
      } catch {
        await disableDailyChallengeReminders();
      } finally {
        setIsPreferenceUpdating(false);
      }
    },
    [
      content,
      disableDailyChallengeReminders,
      isStoredEnabled,
      permissionStatus,
      setStoredReminderTime,
    ],
  );

  const openDailyChallengeReminderSettings = useCallback(() => {
    void Linking.openSettings();
  }, []);

  const hasNotificationPermission = permissionStatus === "granted";
  const isDailyChallengeReminderEnabled =
    isStoredEnabled && hasNotificationPermission;
  const isDailyChallengeReminderUnavailable = permissionStatus === "denied";
  const isDailyChallengeReminderUpdating =
    isPermissionRefreshing || isPreferenceUpdating;

  return {
    isDailyChallengeReminderEnabled,
    isDailyChallengeReminderUnavailable,
    isDailyChallengeReminderUpdating,
    openDailyChallengeReminderSettings,
    reminderTime,
    setDailyChallengeReminderTime,
    setIsDailyChallengeReminderEnabled,
  };
}
