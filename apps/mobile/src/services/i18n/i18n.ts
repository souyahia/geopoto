import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { createMMKV } from "react-native-mmkv";

import {
  DEFAULT_LOCALE,
  getDeviceLanguage,
  type SupportedLocale,
} from "./locale";
import { translations } from "./translations";

const resources = {
  de: { translation: translations.de },
  en: { translation: translations.en },
  es: { translation: translations.es },
  fr: { translation: translations.fr },
  it: { translation: translations.it },
  pt: { translation: translations.pt },
};

const langStorage = createMMKV({ id: "lang-storage" });
const LANGUAGE_STORAGE_KEY = "user-lang";
const storedLang = langStorage.getString(LANGUAGE_STORAGE_KEY);
const language = storedLang ?? getDeviceLanguage();

void i18n.use(initReactI18next).init({
  resources,
  lng: language,
  fallbackLng: DEFAULT_LOCALE,
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;

export function setLanguage(lang: SupportedLocale) {
  langStorage.set(LANGUAGE_STORAGE_KEY, lang);
  void i18n.changeLanguage(lang);
}
