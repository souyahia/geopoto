import { type SupportedLocale } from "@/services/i18n/locale";
import { getLanguageCountryCode } from "@/utils/language/language-country-code";

import { FlagIcon, type FlagIconProps } from "./flag-icon";

interface LangIconProps extends Omit<FlagIconProps, "code"> {
  lang: SupportedLocale;
}

export function LangIcon({ lang, ...props }: LangIconProps) {
  const countryCode = getLanguageCountryCode(lang);

  return <FlagIcon code={countryCode} {...props} />;
}
