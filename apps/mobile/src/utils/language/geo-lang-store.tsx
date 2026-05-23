import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useMMKVBoolean, useMMKVString } from "react-native-mmkv";

import { resolveLocale, type SupportedLocale } from "@/services/i18n/locale";

const GEO_LANG_SYNCED_STORAGE_KEY = "geo-lang.synced";
const GEO_LANG_VALUE_STORAGE_KEY = "geo-lang.value";

const DEFAULT_IS_GEO_LANG_SYNCED = true;

export function useGeoLangStore() {
  const { i18n } = useTranslation();
  const [persistedIsGeoLangSynced, setPersistedIsGeoLangSynced] =
    useMMKVBoolean(GEO_LANG_SYNCED_STORAGE_KEY);
  const [persistedGeoLang, setPersistedGeoLang] = useMMKVString(
    GEO_LANG_VALUE_STORAGE_KEY,
  );

  const setGeoLang = useCallback(
    (value: SupportedLocale) => {
      setPersistedGeoLang(value);
    },
    [setPersistedGeoLang],
  );

  const setIsGeoLangSynced = useCallback(
    (value: boolean) => {
      setPersistedIsGeoLangSynced(value);
    },
    [setPersistedIsGeoLangSynced],
  );

  const isGeoLangSynced =
    persistedIsGeoLangSynced ?? DEFAULT_IS_GEO_LANG_SYNCED;
  const appLang = resolveLocale(i18n.language);
  const geoLang = isGeoLangSynced
    ? appLang
    : resolveLocale(persistedGeoLang ?? appLang);

  return {
    geoLang,
    setGeoLang,
    isGeoLangSynced,
    setIsGeoLangSynced,
  };
}
