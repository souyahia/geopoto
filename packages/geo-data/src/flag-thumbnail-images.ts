export type CountryFlagImage = number;

type RequireContextMode = "sync" | "eager" | "weak" | "lazy" | "lazy-once";

interface MetroRequireContext {
  keys(): string[];
  <Value>(id: string): Value;
}

interface MetroRequire {
  context(
    path: string,
    recursive?: boolean,
    filter?: RegExp,
    mode?: RequireContextMode,
  ): MetroRequireContext;
}

declare const require: MetroRequire;

const COUNTRY_FLAG_THUMBNAIL_IMAGE_CONTEXT = require.context(
  "../generated/flags-png-thumbnail",
  false,
  /^(?!.*@\d+x\.png$).*\.png$/,
);
const COUNTRY_FLAG_THUMBNAIL_IMAGE_PATHS = new Set(
  COUNTRY_FLAG_THUMBNAIL_IMAGE_CONTEXT.keys(),
);

function toCountryFlagImagePath(code: string): string {
  return `./${code.toLowerCase()}.png`;
}

export function getCountryFlagThumbnailImage(
  code: string,
): CountryFlagImage | null {
  const flagImagePath = toCountryFlagImagePath(code);

  if (!COUNTRY_FLAG_THUMBNAIL_IMAGE_PATHS.has(flagImagePath)) {
    return null;
  }

  return COUNTRY_FLAG_THUMBNAIL_IMAGE_CONTEXT<CountryFlagImage>(flagImagePath);
}
