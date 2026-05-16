import { Image, type ImageProps } from "expo-image";

import { getCountryFlagImage } from "@geopoto/geo-data/flag-images";
import {
  getCountryFlag,
  type CountryFlag as CountryFlagData,
} from "@geopoto/geo-data/flags";

interface CountryFlagProps extends Omit<ImageProps, "source"> {
  code: string;
  height?: number;
  width?: number;
}

interface FlagSize {
  height: number;
  width: number;
}

interface GetFlagSizeParams {
  flag: CountryFlagData;
  height?: number;
  width?: number;
}

const DEFAULT_FLAG_WIDTH = 32;

function getFlagSize({ flag, height, width }: GetFlagSizeParams): FlagSize {
  if (width !== undefined && height !== undefined) {
    return { height, width };
  }

  if (height !== undefined) {
    return {
      height,
      width: height * flag.aspectRatio,
    };
  }

  const resolvedWidth = width ?? DEFAULT_FLAG_WIDTH;

  return {
    height: resolvedWidth / flag.aspectRatio,
    width: resolvedWidth,
  };
}

export function CountryFlag({
  code,
  contentFit = "contain",
  height,
  style,
  width,
  ...props
}: CountryFlagProps) {
  const flag = getCountryFlag(code);
  const imageSource = getCountryFlagImage(code);

  if (flag === null || imageSource === null) {
    return null;
  }

  const size = getFlagSize({ flag, height, width });

  return (
    <Image
      {...props}
      contentFit={contentFit}
      source={imageSource}
      style={[{ height: size.height, width: size.width }, style]}
    />
  );
}
