import { Galeria } from "@nandorojo/galeria";
import { Image } from "expo-image";
import { Text } from "heroui-native/text";
import { memo, useMemo } from "react";
import { View, type ViewStyle } from "react-native";

import type { CountryFlagImage } from "@geopoto/geo-data/flag-images";
import type { CountryFlagImage as CountryFlagThumbnailImage } from "@geopoto/geo-data/flag-thumbnail-images";

import { useGaleriaImageUrl } from "@/services/galeria/galeria-image-url";

export interface FlagGridItemData {
  aspectRatio: number;
  code: string;
  countryName: string;
  fullImageSource: CountryFlagImage;
  thumbnailImageSource: CountryFlagThumbnailImage;
}

interface FlagGridItemProps {
  accessibilityLabel: string;
  enableGaleriaDarkMode: () => void;
  flag: FlagGridItemData;
  flagFrameHeight: number;
  itemHeight: number;
  itemWidth: number;
  restoreAppColorScheme: () => void;
}

const FLAG_GRID_LABEL_GAP = 8;
const FLAG_GRID_LABEL_HEIGHT = 40;

interface FlagDisplaySize {
  height: number;
  width: number;
}

interface GetContainedFlagSizeParams {
  aspectRatio: number;
  frameHeight: number;
  frameWidth: number;
}

function getContainedFlagSize({
  aspectRatio,
  frameHeight,
  frameWidth,
}: GetContainedFlagSizeParams): FlagDisplaySize {
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

function FlagGridItemComponent({
  accessibilityLabel,
  enableGaleriaDarkMode,
  flag,
  flagFrameHeight,
  itemHeight,
  itemWidth,
  restoreAppColorScheme,
}: FlagGridItemProps) {
  const containerStyle = useMemo<ViewStyle>(
    () => ({
      height: itemHeight,
      width: itemWidth,
    }),
    [itemHeight, itemWidth],
  );

  const frameAreaStyle = useMemo<ViewStyle>(
    () => ({
      height: flagFrameHeight,
      justifyContent: "center",
    }),
    [flagFrameHeight],
  );

  const flagStyle = useMemo(
    () =>
      getContainedFlagSize({
        aspectRatio: flag.aspectRatio,
        frameHeight: flagFrameHeight,
        frameWidth: itemWidth,
      }),
    [flag.aspectRatio, flagFrameHeight, itemWidth],
  );

  const galeriaImageUrl = useGaleriaImageUrl(flag.fullImageSource);

  return (
    <View className="items-center" style={containerStyle}>
      <View style={frameAreaStyle}>
        <Galeria
          hidePageIndicators
          theme="dark"
          urls={[galeriaImageUrl ?? flag.fullImageSource]}
        >
          <Galeria.Image
            dynamicAspectRatio
            edgeToEdge
            onDismiss={restoreAppColorScheme}
            onLongPress={restoreAppColorScheme}
            style={flagStyle}
          >
            <View
              className="overflow-hidden border border-default"
              style={flagStyle}
            >
              <Image
                accessibilityLabel={accessibilityLabel}
                contentFit="fill"
                onTouchCancel={restoreAppColorScheme}
                onTouchStart={enableGaleriaDarkMode}
                source={flag.thumbnailImageSource}
                style={flagStyle}
              />
            </View>
          </Galeria.Image>
        </Galeria>
      </View>
      <Text
        align="center"
        className="pt-2"
        numberOfLines={2}
        style={{
          height: FLAG_GRID_LABEL_HEIGHT + FLAG_GRID_LABEL_GAP,
          width: itemWidth,
        }}
        type="body-sm"
      >
        {flag.countryName}
      </Text>
    </View>
  );
}

export const FlagGridItem = memo(FlagGridItemComponent);

export const FLAG_GRID_ITEM_TEXT_HEIGHT =
  FLAG_GRID_LABEL_HEIGHT + FLAG_GRID_LABEL_GAP;
