import { Image, type ImageProps } from "expo-image";
import { useEffect, useState } from "react";
import { useResolveClassNames } from "uniwind";

import type { CountryFlagImage } from "@geopoto/geo-data/flag-images";
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

export function useCountryFlagImageSource(
  code: string,
): CountryFlagImage | null {
  const [imageSource, setImageSource] = useState<CountryFlagImage | null>(null);

  useEffect(() => {
    let isMounted = true;

    setImageSource(null);

    async function loadImageSource() {
      const { getCountryFlagImage } =
        await import("@geopoto/geo-data/flag-images");
      const nextImageSource = getCountryFlagImage(code);

      if (!isMounted) {
        return;
      }

      setImageSource(nextImageSource);
    }

    void loadImageSource().catch(() => {
      if (!isMounted) {
        return;
      }

      setImageSource(null);
    });

    return () => {
      isMounted = false;
    };
  }, [code]);

  return imageSource;
}

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
  className,
  code,
  contentFit = "contain",
  height,
  style,
  width,
  ...props
}: CountryFlagProps) {
  const resolvedClassNameStyle = useResolveClassNames(className ?? "");
  const flag = getCountryFlag(code);
  const imageSource = useCountryFlagImageSource(code);

  if (flag === null || imageSource === null) {
    return null;
  }

  const size = getFlagSize({ flag, height, width });

  return (
    <Image
      {...props}
      contentFit={contentFit}
      source={imageSource}
      style={[
        resolvedClassNameStyle,
        { height: size.height, width: size.width },
        style,
      ]}
    />
  );
}
