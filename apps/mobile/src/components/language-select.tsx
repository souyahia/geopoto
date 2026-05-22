import { Select } from "heroui-native/select";
import { Check } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { HapticPressableFeedback } from "@/components/haptic-pressable-feedback";
import {
  isSupportedLocale,
  resolveLocale,
  SUPPORTED_LOCALES,
  type SupportedLocale,
} from "@/services/i18n/locale";
import { ThemedIcon } from "@/services/theme/themed-icon";
import { getLanguageName } from "@/utils/language/language-name";

import { LangIcon } from "./lang-icon";

interface LanguageOption {
  label: string;
  value: SupportedLocale;
}

interface SelectOption {
  label: string;
  value: string;
}

interface LanguageSelectProps {
  value: string;
  onValueChange: (value: SupportedLocale) => void;
  label?: string;
}

const LANGUAGE_OPTIONS: LanguageOption[] = SUPPORTED_LOCALES.map((locale) => ({
  label: getLanguageName(locale),
  value: locale,
}));

const FLAG_ICON_WIDTH_PX = 24;

export function LanguageSelect({
  value,
  onValueChange,
  label,
}: LanguageSelectProps) {
  const selectedLocale = resolveLocale(value);
  const { t } = useTranslation();

  const handleValueChange = (option: SelectOption | undefined) => {
    if (!isSupportedLocale(option?.value)) {
      return;
    }

    onValueChange(option.value);
  };

  return (
    <Select
      value={getLanguageOption(selectedLocale)}
      onValueChange={handleValueChange}
    >
      <Select.Trigger className="bg-surface-tertiary">
        <LangIcon lang={selectedLocale} width={FLAG_ICON_WIDTH_PX} />
        <Select.Value placeholder={t("settings.language.placeholder")} />
        <Select.TriggerIndicator />
      </Select.Trigger>
      <Select.Portal>
        <Select.Overlay />
        <Select.Content presentation="popover" width="trigger" className="px-0">
          {label && <Select.ListLabel>{label}</Select.ListLabel>}
          {LANGUAGE_OPTIONS.map((option) => (
            <HapticPressableFeedback key={option.value} asChild>
              <Select.Item
                value={option.value}
                label={option.label}
                className="px-4"
              >
                <HapticPressableFeedback.Highlight />
                <HapticPressableFeedback.Ripple />
                <View className="flex-1 flex-row items-center gap-3">
                  <LangIcon lang={option.value} width={FLAG_ICON_WIDTH_PX} />
                  <Select.ItemLabel />
                </View>
                <Select.ItemIndicator className="pr-3">
                  <ThemedIcon icon={Check} />
                </Select.ItemIndicator>
              </Select.Item>
            </HapticPressableFeedback>
          ))}
        </Select.Content>
      </Select.Portal>
    </Select>
  );
}

function getLanguageOption(locale: SupportedLocale) {
  return LANGUAGE_OPTIONS.find((option) => option.value === locale);
}
