import { type ImageProps } from "expo-image";

import { type SupportedLocale } from "@/services/i18n/locale";
import { getLanguageCountryCode } from "@/utils/language/language-country-code";

import { CountryFlag } from "./country-flag";

interface LangIconProps extends Omit<ImageProps, "source"> {
  lang: SupportedLocale;
  width?: number;
}

const ASPECT_RATIO = 4 / 3;

export function LangIcon({ lang, width = 24, style, ...props }: LangIconProps) {
  const countryCode = getLanguageCountryCode(lang);

  return (
    <CountryFlag
      code={countryCode}
      width={width}
      contentFit="cover"
      style={{ height: width / ASPECT_RATIO, width, borderRadius: 4, ...style }}
      {...props}
    />
  );
}
