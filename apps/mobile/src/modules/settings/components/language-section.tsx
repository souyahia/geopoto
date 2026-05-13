import { Accordion } from "heroui-native/accordion";
import { Checkbox } from "heroui-native/checkbox";
import { Text } from "heroui-native/text";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { LanguageSelect } from "@/components/language-select";
import { setLanguage } from "@/services/i18n/i18n";
import { type SupportedLocale } from "@/services/i18n/locale";
import { useGeoLangStore } from "@/utils/language/geo-lang-store";

import { SettingsSection } from "./settings-section";

const GEO_LANG_ACCORDION_VALUE = "geo-lang";

export function LanguageSection() {
  const { i18n, t } = useTranslation();
  const { geoLang, setGeoLang, isGeoLangSynced, setIsGeoLangSynced } =
    useGeoLangStore();

  const handleLanguageChange = (value: SupportedLocale) => {
    setLanguage(value);
  };

  return (
    <SettingsSection
      title={t("settings.language.title")}
      description={t("settings.language.description")}
    >
      <LanguageSelect
        value={i18n.language}
        onValueChange={handleLanguageChange}
        label={t("settings.language.select-label")}
      />
      <View className="flex-row items-center gap-2 px-1">
        <Checkbox
          isSelected={isGeoLangSynced}
          onSelectedChange={setIsGeoLangSynced}
        />
        <Text type="body-sm" className="flex-1 opacity-80">
          {t("settings.language.geo-lang.sync-label")}
        </Text>
      </View>
      <Accordion
        selectionMode="multiple"
        className="overflow-auto"
        value={isGeoLangSynced ? [] : [GEO_LANG_ACCORDION_VALUE]}
      >
        <Accordion.Item
          value={GEO_LANG_ACCORDION_VALUE}
          className="overflow-auto"
        >
          <Accordion.Content className="p-0">
            <Text type="body-sm" color="muted" className="pb-4">
              {t("settings.language.geo-lang.description")}
            </Text>
            <LanguageSelect
              value={geoLang}
              onValueChange={setGeoLang}
              label={t("settings.language.geo-lang.select-label")}
            />
          </Accordion.Content>
        </Accordion.Item>
      </Accordion>
    </SettingsSection>
  );
}
