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

const LOW_RESOLUTION_COUNTRY_FLAG_IMAGE_CONTEXT = require.context(
  "../generated/flags-png-low",
  false,
  /^(?!.*@\d+x\.png$).*\.png$/,
);
const LOW_RESOLUTION_COUNTRY_FLAG_IMAGE_PATHS = new Set(
  LOW_RESOLUTION_COUNTRY_FLAG_IMAGE_CONTEXT.keys(),
);

function toCountryFlagImagePath(code: string): string {
  return `./${code.toLowerCase()}.png`;
}

export function getLowResolutionCountryFlagImage(
  code: string,
): CountryFlagImage | null {
  const flagImagePath = toCountryFlagImagePath(code);

  if (!LOW_RESOLUTION_COUNTRY_FLAG_IMAGE_PATHS.has(flagImagePath)) {
    return null;
  }

  return LOW_RESOLUTION_COUNTRY_FLAG_IMAGE_CONTEXT<CountryFlagImage>(
    flagImagePath,
  );
}
