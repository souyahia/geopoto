import { Galeria } from "@nandorojo/galeria";
import { Image } from "expo-image";
import { Text } from "heroui-native/text";
import { View } from "react-native";

import { getCountryFlag } from "@geopoto/geo-data/flags";

import { useCountryFlagImageSource } from "@/components/country-flag";
import { HapticButton } from "@/components/haptic-button";
import { PageContent } from "@/components/page-content";
import { useGaleriaDarkMode } from "@/services/theme/galeria-dark-mode";

import { BackroomsThemeSelector } from "../components/backrooms-theme-selector";

const PALESTINE_COUNTRY_CODE = "PS";
const PALESTINE_FLAG_WIDTH = 220;

export function BackroomsPage() {
  const palestineFlag = getCountryFlag(PALESTINE_COUNTRY_CODE);
  const { enableGaleriaDarkMode, restoreAppColorScheme } = useGaleriaDarkMode();
  const palestineFlagImageSource = useCountryFlagImageSource(
    PALESTINE_COUNTRY_CODE,
  );
  const palestineFlagSize =
    palestineFlag === null
      ? null
      : {
          height: PALESTINE_FLAG_WIDTH / palestineFlag.aspectRatio,
          width: PALESTINE_FLAG_WIDTH,
        };

  return (
    <PageContent className="flex-1 items-center px-6 py-2 gap-2">
      <BackroomsThemeSelector />
      {palestineFlagImageSource !== null && palestineFlagSize !== null ? (
        <View className="items-center gap-2 py-4">
          <Galeria urls={[palestineFlagImageSource]} theme="dark">
            <Galeria.Image
              dynamicAspectRatio
              edgeToEdge
              onDismiss={restoreAppColorScheme}
              onLongPress={restoreAppColorScheme}
            >
              <Image
                accessibilityLabel="Palestine flag"
                contentFit="contain"
                onTouchCancel={restoreAppColorScheme}
                onTouchStart={enableGaleriaDarkMode}
                source={palestineFlagImageSource}
                style={{
                  height: palestineFlagSize.height,
                  width: palestineFlagSize.width,
                }}
              />
            </Galeria.Image>
          </Galeria>
          <Text type="body-sm" color="muted">
            Palestine
          </Text>
        </View>
      ) : null}
      <HapticButton variant="primary">Primary</HapticButton>
      <HapticButton variant="tertiary">Tertiary</HapticButton>
      <HapticButton variant="outline">Outline</HapticButton>
      <HapticButton variant="ghost">Ghost</HapticButton>
      <HapticButton variant="danger">Danger</HapticButton>
      <HapticButton variant="danger-soft">Danger Soft</HapticButton>
    </PageContent>
  );
}
