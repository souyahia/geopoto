import { Image, type ImageProps } from "expo-image";
import { cn } from "heroui-native/utils";
import { View, type StyleProp, type ViewStyle } from "react-native";

import { getCountryFlag } from "@geopoto/geo-data/flags";
import { getLowResolutionCountryFlagImage } from "@geopoto/geo-data/low-resolution-flag-images";

export interface FlagIconProps extends Omit<
  ImageProps,
  "className" | "contentFit" | "source" | "style"
> {
  code: string;
  containerClassName?: string;
  style?: StyleProp<ViewStyle>;
  width?: number;
}

interface FlagIconSize {
  height: number;
  width: number;
}

interface GetContainedFlagIconSizeParams {
  aspectRatio: number;
  frameHeight: number;
  frameWidth: number;
}

const FLAG_ICON_ASPECT_RATIO = 4 / 3;
const FLAG_ICON_BORDER_RADIUS = 4;
const MIN_NORMAL_FLAG_ASPECT_RATIO = 1.15;
const MAX_NORMAL_FLAG_ASPECT_RATIO = 2.25;

function isFlagIconContained(aspectRatio: number) {
  return (
    aspectRatio < MIN_NORMAL_FLAG_ASPECT_RATIO ||
    aspectRatio > MAX_NORMAL_FLAG_ASPECT_RATIO
  );
}

function getContainedFlagIconSize({
  aspectRatio,
  frameHeight,
  frameWidth,
}: GetContainedFlagIconSizeParams): FlagIconSize {
  const heightFromFrameWidth = frameWidth / aspectRatio;

  if (heightFromFrameWidth <= frameHeight) {
    return {
      height: heightFromFrameWidth,
      width: frameWidth,
    };
  }

  return {
    height: frameHeight,
    width: frameHeight * aspectRatio,
  };
}

export function FlagIcon({
  code,
  containerClassName,
  width = 24,
  style,
  ...props
}: FlagIconProps) {
  const flag = getCountryFlag(code);

  if (flag === null) {
    return null;
  }

  const imageSource = getLowResolutionCountryFlagImage(code);

  if (imageSource === null) {
    return null;
  }

  const frameSize = {
    height: width / FLAG_ICON_ASPECT_RATIO,
    width,
  };
  const shouldContainFlag = isFlagIconContained(flag.aspectRatio);
  const flagSize = shouldContainFlag
    ? getContainedFlagIconSize({
        aspectRatio: flag.aspectRatio,
        frameHeight: frameSize.height,
        frameWidth: frameSize.width,
      })
    : frameSize;

  return (
    <View
      className={cn("items-center justify-center", containerClassName)}
      style={[
        {
          borderRadius: FLAG_ICON_BORDER_RADIUS,
          height: frameSize.height,
          overflow: "hidden",
          width: frameSize.width,
        },
        style,
      ]}
    >
      <Image
        contentFit={shouldContainFlag ? "contain" : "fill"}
        source={imageSource}
        style={{
          height: flagSize.height,
          width: flagSize.width,
        }}
        {...props}
      />
    </View>
  );
}
