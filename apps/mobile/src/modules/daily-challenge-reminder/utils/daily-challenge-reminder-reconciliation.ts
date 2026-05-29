import {
  cancelDailyChallengeReminders,
  type DailyChallengeReminderNotificationContent,
  getDailyChallengeReminderPermissionStatus,
  scheduleDailyChallengeReminderQueue,
} from "./daily-challenge-reminder-notifications";
import { getStoredDailyChallengeReminderSettings } from "./daily-challenge-reminder-settings-storage";

interface ReconcileStoredDailyChallengeRemindersParams {
  content: DailyChallengeReminderNotificationContent;
}

export async function reconcileStoredDailyChallengeReminders({
  content,
}: ReconcileStoredDailyChallengeRemindersParams): Promise<void> {
  const settings = getStoredDailyChallengeReminderSettings();

  if (!settings.isEnabled) {
    await cancelDailyChallengeReminders();
    return;
  }

  const permissionStatus = await getDailyChallengeReminderPermissionStatus();

  if (permissionStatus !== "granted") {
    await cancelDailyChallengeReminders();
    return;
  }

  await scheduleDailyChallengeReminderQueue({
    content,
    reminderTime: settings.reminderTime,
  });
}
