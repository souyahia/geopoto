import dayjs from "dayjs";
import { Select } from "heroui-native/select";
import { Switch } from "heroui-native/switch";
import { Text } from "heroui-native/text";
import { BellRing, Check, Clock, Settings } from "lucide-react-native";
import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, View } from "react-native";

import { HapticButton } from "@/components/haptic-button";
import { HapticPressableFeedback } from "@/components/haptic-pressable-feedback";
import { useDailyChallengeReminderSettings } from "@/modules/daily-challenge-reminder/hooks/use-daily-challenge-reminder-settings";
import {
  DAILY_CHALLENGE_REMINDER_TIME_STEP_MINUTES,
  type DailyChallengeReminderTime,
} from "@/modules/daily-challenge-reminder/utils/daily-challenge-reminder-notifications";
import { ThemedIcon } from "@/services/theme/themed-icon";

import { SettingsSection } from "./settings-section";

interface ReminderTimeOption {
  label: string;
  reminderTimePart: number;
  value: string;
}

interface SelectedReminderTimeOption {
  label: string;
  value: string;
}

const DAILY_CHALLENGE_REMINDER_HOUR_OPTION_COUNT = 24;
const DAILY_CHALLENGE_REMINDER_MINUTE_OPTION_COUNT =
  60 / DAILY_CHALLENGE_REMINDER_TIME_STEP_MINUTES;
const REMINDER_TIME_SELECT_MENU_MAX_HEIGHT = 240;

export function DailyChallengeReminderSection() {
  const { i18n, t } = useTranslation();
  const language = i18n.language;
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
  const {
    isDailyChallengeReminderEnabled,
    isDailyChallengeReminderUnavailable,
    isDailyChallengeReminderUpdating,
    openDailyChallengeReminderSettings,
    reminderTime,
    setDailyChallengeReminderTime,
    setIsDailyChallengeReminderEnabled,
  } = useDailyChallengeReminderSettings({ content: notificationContent });
  const reminderTimeLabel = getDailyChallengeReminderTimeLabel({
    locale: language,
    reminderTime,
  });
  const hourOptions = useMemo(
    () => getReminderHourOptions({ locale: language }),
    [language],
  );
  const minuteOptions = useMemo(() => getReminderMinuteOptions(), []);
  const selectedHourOption = getSelectedReminderTimeOption({
    options: hourOptions,
    value: reminderTime.hour,
  });
  const selectedMinuteOption = getSelectedReminderTimeOption({
    options: minuteOptions,
    value: reminderTime.minute,
  });
  const shouldDisableReminderToggle =
    isDailyChallengeReminderUnavailable || isDailyChallengeReminderUpdating;
  const shouldDisableReminderTimeControls =
    !isDailyChallengeReminderEnabled ||
    isDailyChallengeReminderUnavailable ||
    isDailyChallengeReminderUpdating;
  const shouldShowReminderTimeDisabledMessage =
    !isDailyChallengeReminderEnabled && !isDailyChallengeReminderUnavailable;

  const handleReminderEnabledChange = (isEnabled: boolean) => {
    void setIsDailyChallengeReminderEnabled(isEnabled);
  };

  const handleReminderHourChange = useCallback(
    (option: SelectedReminderTimeOption | undefined) => {
      const nextHourOption = getReminderTimeOption({
        options: hourOptions,
        value: option?.value,
      });

      if (nextHourOption === undefined) {
        return;
      }

      void setDailyChallengeReminderTime({
        hour: nextHourOption.reminderTimePart,
        minute: reminderTime.minute,
      });
    },
    [hourOptions, reminderTime.minute, setDailyChallengeReminderTime],
  );

  const handleReminderMinuteChange = useCallback(
    (option: SelectedReminderTimeOption | undefined) => {
      const nextMinuteOption = getReminderTimeOption({
        options: minuteOptions,
        value: option?.value,
      });

      if (nextMinuteOption === undefined) {
        return;
      }

      void setDailyChallengeReminderTime({
        hour: reminderTime.hour,
        minute: nextMinuteOption.reminderTimePart,
      });
    },
    [minuteOptions, reminderTime.hour, setDailyChallengeReminderTime],
  );

  return (
    <SettingsSection
      title={t("settings.daily-challenge-reminder.title")}
      description={t("settings.daily-challenge-reminder.description")}
    >
      <View className="flex-row items-center justify-between gap-4 px-1">
        <View className="flex-1 flex-row items-center gap-3">
          <ThemedIcon icon={BellRing} size={20} colorClassName="text-muted" />
          <View className="flex-1 gap-1">
            <Text type="body-sm" className="opacity-80">
              {t("settings.daily-challenge-reminder.toggle-label")}
            </Text>
            <Text type="body-xs" color="muted">
              {t("settings.daily-challenge-reminder.time-label", {
                time: reminderTimeLabel,
              })}
            </Text>
          </View>
        </View>
        <Switch
          accessibilityLabel={t(
            "settings.daily-challenge-reminder.toggle-label",
          )}
          isDisabled={shouldDisableReminderToggle}
          isSelected={isDailyChallengeReminderEnabled}
          onSelectedChange={handleReminderEnabledChange}
        />
      </View>
      <View className="gap-2 px-1">
        <View className="flex-row items-center gap-3">
          <ThemedIcon icon={Clock} size={20} colorClassName="text-muted" />
          <View className="flex-1 flex-row gap-2">
            <ReminderTimeSelect
              accessibilityLabel={t(
                "settings.daily-challenge-reminder.hour-select-label",
              )}
              isDisabled={shouldDisableReminderTimeControls}
              label={t("settings.daily-challenge-reminder.hour-label")}
              onValueChange={handleReminderHourChange}
              options={hourOptions}
              value={selectedHourOption}
            />
            <ReminderTimeSelect
              accessibilityLabel={t(
                "settings.daily-challenge-reminder.minute-select-label",
              )}
              isDisabled={shouldDisableReminderTimeControls}
              label={t("settings.daily-challenge-reminder.minute-label")}
              onValueChange={handleReminderMinuteChange}
              options={minuteOptions}
              value={selectedMinuteOption}
            />
          </View>
        </View>
        {shouldShowReminderTimeDisabledMessage && (
          <Text type="body-xs" color="muted" className="pl-8">
            {t("settings.daily-challenge-reminder.time-disabled-label")}
          </Text>
        )}
      </View>
      {isDailyChallengeReminderUnavailable && (
        <View className="gap-3 px-1">
          <Text type="body-sm" color="muted">
            {t("settings.daily-challenge-reminder.permission-denied")}
          </Text>
          <HapticButton
            accessibilityLabel={t(
              "settings.daily-challenge-reminder.open-settings-label",
            )}
            className="self-start"
            size="sm"
            variant="outline"
            onPress={openDailyChallengeReminderSettings}
          >
            <ThemedIcon icon={Settings} size={18} />
            <HapticButton.Label>
              {t("settings.daily-challenge-reminder.open-settings-label")}
            </HapticButton.Label>
          </HapticButton>
        </View>
      )}
    </SettingsSection>
  );
}

interface ReminderTimeSelectProps {
  accessibilityLabel: string;
  isDisabled: boolean;
  label: string;
  onValueChange: (value: SelectedReminderTimeOption | undefined) => void;
  options: readonly ReminderTimeOption[];
  value: SelectedReminderTimeOption | undefined;
}

function ReminderTimeSelect({
  accessibilityLabel,
  isDisabled,
  label,
  onValueChange,
  options,
  value,
}: ReminderTimeSelectProps) {
  return (
    <View className="flex-1 gap-1">
      <Text type="body-xs" color="muted">
        {label}
      </Text>
      <Select
        isDisabled={isDisabled}
        value={value}
        onValueChange={onValueChange}
      >
        <Select.Trigger
          accessibilityLabel={accessibilityLabel}
          className="bg-surface-tertiary"
        >
          <Select.Value placeholder={label} />
          <Select.TriggerIndicator />
        </Select.Trigger>
        <Select.Portal>
          <Select.Overlay />
          <Select.Content
            presentation="popover"
            width="trigger"
            className="px-0"
            style={reminderTimeSelectStyles.menuContent}
          >
            <ScrollView
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled
              showsVerticalScrollIndicator
              style={reminderTimeSelectStyles.menuScrollView}
            >
              {options.map((option) => (
                <HapticPressableFeedback key={option.value} asChild>
                  <Select.Item
                    value={option.value}
                    label={option.label}
                    className="px-4"
                  >
                    <View className="flex-1 flex-row items-center gap-3">
                      <Select.ItemLabel />
                    </View>
                    <Select.ItemIndicator className="pr-3">
                      <ThemedIcon icon={Check} />
                    </Select.ItemIndicator>
                  </Select.Item>
                </HapticPressableFeedback>
              ))}
            </ScrollView>
          </Select.Content>
        </Select.Portal>
      </Select>
    </View>
  );
}

const reminderTimeSelectStyles = StyleSheet.create({
  menuContent: {
    maxHeight: REMINDER_TIME_SELECT_MENU_MAX_HEIGHT,
  },
  menuScrollView: {
    maxHeight: REMINDER_TIME_SELECT_MENU_MAX_HEIGHT,
  },
});

interface GetDailyChallengeReminderTimeLabelParams {
  locale: string;
  reminderTime: DailyChallengeReminderTime;
}

function getDailyChallengeReminderTimeLabel({
  locale,
  reminderTime,
}: GetDailyChallengeReminderTimeLabelParams): string {
  return dayjs(new Date(2000, 0, 1, reminderTime.hour, reminderTime.minute))
    .locale(locale)
    .format("LT");
}

interface GetReminderHourOptionsParams {
  locale: string;
}

function getReminderHourOptions({
  locale,
}: GetReminderHourOptionsParams): readonly ReminderTimeOption[] {
  return Array.from(
    { length: DAILY_CHALLENGE_REMINDER_HOUR_OPTION_COUNT },
    (_value, hour) => ({
      label: getReminderHourLabel({ hour, locale }),
      reminderTimePart: hour,
      value: getReminderTimeOptionValue({ value: hour }),
    }),
  );
}

interface GetReminderHourLabelParams {
  hour: number;
  locale: string;
}

function getReminderHourLabel({
  hour,
  locale,
}: GetReminderHourLabelParams): string {
  const dayjsHourFormat = getDayjsHourFormat({ locale });

  return dayjs(new Date(2000, 0, 1, hour, 0))
    .locale(locale)
    .format(dayjsHourFormat);
}

interface GetDayjsHourFormatParams {
  locale: string;
}

function getDayjsHourFormat({ locale }: GetDayjsHourFormatParams): string {
  const localizedTime = dayjs(new Date(2000, 0, 1, 13, 0))
    .locale(locale)
    .format("LT");

  if (/[AP]M/i.test(localizedTime)) {
    return "h A";
  }

  return "HH";
}

function getReminderMinuteOptions(): readonly ReminderTimeOption[] {
  return Array.from(
    { length: DAILY_CHALLENGE_REMINDER_MINUTE_OPTION_COUNT },
    (_value, index) => {
      const minute = index * DAILY_CHALLENGE_REMINDER_TIME_STEP_MINUTES;

      return {
        label: formatTimePart({ value: minute }),
        reminderTimePart: minute,
        value: getReminderTimeOptionValue({ value: minute }),
      };
    },
  );
}

interface GetSelectedReminderTimeOptionParams {
  options: readonly ReminderTimeOption[];
  value: number;
}

function getSelectedReminderTimeOption({
  options,
  value,
}: GetSelectedReminderTimeOptionParams):
  | SelectedReminderTimeOption
  | undefined {
  return options.find((option) => option.reminderTimePart === value);
}

interface GetReminderTimeOptionParams {
  options: readonly ReminderTimeOption[];
  value: string | undefined;
}

function getReminderTimeOption({
  options,
  value,
}: GetReminderTimeOptionParams): ReminderTimeOption | undefined {
  if (value === undefined) {
    return undefined;
  }

  return options.find((option) => option.value === value);
}

interface GetReminderTimeOptionValueParams {
  value: number;
}

function getReminderTimeOptionValue({
  value,
}: GetReminderTimeOptionValueParams): string {
  return value.toString();
}

interface FormatTimePartParams {
  value: number;
}

function formatTimePart({ value }: FormatTimePartParams): string {
  return value.toString().padStart(2, "0");
}
