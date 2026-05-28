import "dayjs/locale/de";
import "dayjs/locale/en";
import "dayjs/locale/es";
import "dayjs/locale/fr";
import "dayjs/locale/it";
import "dayjs/locale/pt";

import dayjs from "dayjs";

import { resolveLocale } from "./locale";

interface SetDayjsLocaleParams {
  locale: unknown;
}

export function setDayjsLocale({ locale }: SetDayjsLocaleParams): void {
  dayjs.locale(resolveLocale(getBaseLocale({ locale })));
}

interface GetBaseLocaleParams {
  locale: unknown;
}

function getBaseLocale({ locale }: GetBaseLocaleParams): unknown {
  if (typeof locale !== "string") {
    return locale;
  }

  return locale.substring(0, 2);
}
