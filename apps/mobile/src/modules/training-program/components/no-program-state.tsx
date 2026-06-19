import { Surface } from "heroui-native/surface";
import { Text } from "heroui-native/text";
import { Play } from "lucide-react-native";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";

import type { MapRegionName } from "@geopoto/geo-data";

import { HapticButton } from "@/components/haptic-button";
import { PageContent } from "@/components/page-content";
import { ThemedIcon } from "@/services/theme/themed-icon";

import { AreaSelect } from "./area-select";

const DEFAULT_AREA: MapRegionName = "africa";
const TUTORIAL_STEP_KEYS = [
  "training-program.no-program.tutorial.step-1",
  "training-program.no-program.tutorial.step-2",
  "training-program.no-program.tutorial.step-3",
  "training-program.no-program.tutorial.step-4",
] as const;

interface NoProgramStateProps {
  onStart: (area: MapRegionName) => void;
}

export function NoProgramState({ onStart }: NoProgramStateProps) {
  const { t } = useTranslation();
  const [selectedArea, setSelectedArea] = useState<MapRegionName>(DEFAULT_AREA);

  const handleStartPress = useCallback(() => {
    onStart(selectedArea);
  }, [onStart, selectedArea]);

  return (
    <View className="flex-1">
      <ScrollView className="flex-1">
        <PageContent className="gap-5 px-6 pb-8 pt-4">
          <Surface variant="secondary" className="gap-4">
            <View className="gap-2">
              <Text type="h4">
                {t("training-program.no-program.tutorial.title")}
              </Text>
              <Text type="body-sm" color="muted">
                {t("training-program.no-program.tutorial.intro")}
              </Text>
            </View>
            <View className="gap-3">
              {TUTORIAL_STEP_KEYS.map((stepKey, index) => (
                <View key={stepKey} className="flex-row items-start gap-3">
                  <View className="mt-0.5 h-6 w-6 items-center justify-center rounded-full bg-surface-tertiary">
                    <Text type="body-sm" weight="semibold">
                      {index + 1}
                    </Text>
                  </View>
                  <Text type="body-sm" className="flex-1">
                    {t(stepKey)}
                  </Text>
                </View>
              ))}
            </View>
          </Surface>
          <View className="gap-2">
            <Text type="h4">{t("training-program.no-program.area.title")}</Text>
            <Text type="body-sm" color="muted">
              {t("training-program.no-program.area.description")}
            </Text>
            <AreaSelect
              selectedArea={selectedArea}
              onSelectedAreaChange={setSelectedArea}
            />
          </View>
        </PageContent>
      </ScrollView>
      <PageContent className="px-6 pb-6 pt-3">
        <HapticButton
          accessibilityLabel={t("training-program.no-program.start")}
          className="w-full"
          onPress={handleStartPress}
          variant="primary"
        >
          <ThemedIcon
            colorClassName="text-accent-foreground"
            icon={Play}
            size={18}
          />
          <HapticButton.Label>
            {t("training-program.no-program.start")}
          </HapticButton.Label>
        </HapticButton>
      </PageContent>
    </View>
  );
}
