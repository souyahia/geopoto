import i18n from "@/services/i18n/i18n";
import { resolveLocale } from "@/services/i18n/locale";
import { translations } from "@/services/i18n/translations";

type DailyChallengeReminderCopyPools =
  (typeof translations.en)["settings"]["daily-challenge-reminder"]["notification"]["copy-pools"];

interface GetDailyChallengeReminderNotificationBodyParams {
  dateKey: string;
  streak: number;
}

export function getDailyChallengeReminderNotificationBody({
  dateKey,
  streak,
}: GetDailyChallengeReminderNotificationBodyParams): string {
  const locale = resolveLocale(i18n.language);
  const copyPools = getDailyChallengeReminderCopyPools({ locale });
  const messages = [
    ...copyPools.general,
    ...getStreakSpecificDailyChallengeReminderCopyPool({
      copyPools,
      streak,
    }),
  ];
  const template = pickDailyChallengeReminderTemplate({
    dateKey,
    locale,
    messages,
    streak,
  });

  return renderDailyChallengeReminderTemplate({ streak, template });
}

interface GetDailyChallengeReminderCopyPoolsParams {
  locale: keyof typeof translations;
}

function getDailyChallengeReminderCopyPools({
  locale,
}: GetDailyChallengeReminderCopyPoolsParams): DailyChallengeReminderCopyPools {
  return translations[locale].settings["daily-challenge-reminder"].notification[
    "copy-pools"
  ];
}

interface GetStreakSpecificDailyChallengeReminderCopyPoolParams {
  copyPools: DailyChallengeReminderCopyPools;
  streak: number;
}

function getStreakSpecificDailyChallengeReminderCopyPool({
  copyPools,
  streak,
}: GetStreakSpecificDailyChallengeReminderCopyPoolParams): readonly string[] {
  if (streak > 0) {
    return copyPools["positive-streak"];
  }

  if (streak === 0) {
    return copyPools["zero-streak"];
  }

  return [];
}

interface PickDailyChallengeReminderTemplateParams {
  dateKey: string;
  locale: string;
  messages: readonly string[];
  streak: number;
}

function pickDailyChallengeReminderTemplate({
  dateKey,
  locale,
  messages,
  streak,
}: PickDailyChallengeReminderTemplateParams): string {
  const selectedIndex =
    hashStringToUint32({
      value: ["daily-challenge-reminder", locale, dateKey, streak].join(":"),
    }) % messages.length;
  const selectedMessage = messages.at(selectedIndex);

  if (selectedMessage === undefined) {
    throw new Error("Daily Challenge Reminder copy pool cannot be empty");
  }

  return selectedMessage;
}

interface RenderDailyChallengeReminderTemplateParams {
  streak: number;
  template: string;
}

function renderDailyChallengeReminderTemplate({
  streak,
  template,
}: RenderDailyChallengeReminderTemplateParams): string {
  const renderedText = template.replace(
    /\{\{\s*streak\s*\}\}/g,
    String(streak),
  );

  if (!hasUnresolvedI18nextPlaceholder({ value: renderedText })) {
    return renderedText;
  }

  return renderedText
    .replace(/\{\{[^}]+\}\}/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

interface HasUnresolvedI18nextPlaceholderParams {
  value: string;
}

function hasUnresolvedI18nextPlaceholder({
  value,
}: HasUnresolvedI18nextPlaceholderParams): boolean {
  return /\{\{[^}]+\}\}/.test(value);
}

interface HashStringToUint32Params {
  value: string;
}

function hashStringToUint32({ value }: HashStringToUint32Params): number {
  return value.split("").reduce((hash, character) => {
    const mixedHash = hash ^ character.charCodeAt(0);

    return Math.imul(mixedHash, 16_777_619) >>> 0;
  }, 2_166_136_261);
}
