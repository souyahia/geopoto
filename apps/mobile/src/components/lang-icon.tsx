// eslint-disable no-require-imports

import { Image, type ImageProps } from "expo-image";

import { type SupportedLocale } from "@/services/i18n/locale";

interface LangIconProps extends Omit<ImageProps, "source"> {
  lang: SupportedLocale;
  width?: number;
}

const LANG_ICONS: Record<SupportedLocale, ImageProps["source"]> = {
  de: require("../../assets/icons/lang-de.png"),
  en: require("../../assets/icons/lang-gb.png"),
  es: require("../../assets/icons/lang-es.png"),
  fr: require("../../assets/icons/lang-fr.png"),
  it: require("../../assets/icons/lang-it.png"),
  pt: require("../../assets/icons/lang-pt.png"),
};

const LANG_ICON_ASPECT_RATIO = 4 / 3;

export function LangIcon({ lang, width = 24, style, ...props }: LangIconProps) {
  return (
    <Image
      source={LANG_ICONS[lang]}
      style={{
        width,
        aspectRatio: LANG_ICON_ASPECT_RATIO,
        borderRadius: 4,
        ...style,
      }}
      {...props}
    />
  );
}
