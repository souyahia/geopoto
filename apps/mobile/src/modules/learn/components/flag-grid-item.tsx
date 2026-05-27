import { Galeria } from "@nandorojo/galeria";
import { Image, type ImageStyle } from "expo-image";
import { Text } from "heroui-native/text";
import { memo, useMemo } from "react";
import { View, type ViewStyle } from "react-native";

import type { CountryFlagImage } from "@geopoto/geo-data/flag-images";
import type { CountryFlagImage as CountryFlagThumbnailImage } from "@geopoto/geo-data/flag-thumbnail-images";

export interface FlagGridItemData {
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

  const imageFrameStyle = useMemo<ViewStyle>(
    () => ({
      height: flagFrameHeight,
      width: itemWidth,
    }),
    [flagFrameHeight, itemWidth],
  );

  const imageStyle = useMemo<ImageStyle>(
    () => ({
      height: flagFrameHeight,
      width: itemWidth,
    }),
    [flagFrameHeight, itemWidth],
  );

  return (
    <View className="items-center" style={containerStyle}>
      <Galeria hidePageIndicators theme="dark" urls={[flag.fullImageSource]}>
        <Galeria.Image
          dynamicAspectRatio
          edgeToEdge
          onDismiss={restoreAppColorScheme}
          onLongPress={restoreAppColorScheme}
          style={imageFrameStyle}
        >
          <Image
            accessibilityLabel={accessibilityLabel}
            contentFit="contain"
            onTouchCancel={restoreAppColorScheme}
            onTouchStart={enableGaleriaDarkMode}
            source={flag.thumbnailImageSource}
            style={imageStyle}
          />
        </Galeria.Image>
      </Galeria>
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
