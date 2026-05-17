// oxlint-disable typescript/no-require-imports

import { Image, type ImageProps } from "expo-image";

interface AssetImage {
  source: number;
  width: number;
  height: number;
}

export const ASSET_IMAGES = {
  GEOPOTO_ILLUSTRATION: {
    source: require("../../assets/images/geopoto_illustration.png"),
    width: 1244,
    height: 723,
  },
} as const;

interface AssetImageProps extends Omit<ImageProps, "source"> {
  image: AssetImage;
}

export function AssetImage({ image, style, ...props }: AssetImageProps) {
  return (
    <Image
      {...props}
      source={image.source}
      style={{
        aspectRatio: image.width / image.height,
        ...style,
      }}
    />
  );
}
