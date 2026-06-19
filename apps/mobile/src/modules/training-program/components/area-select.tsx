import { Select } from "heroui-native/select";
import { Check, Globe2 } from "lucide-react-native";
import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import {
  isMapRegionName,
  MAP_REGION_NAMES,
  type MapRegionName,
} from "@geopoto/geo-data";

import { HapticPressableFeedback } from "@/components/haptic-pressable-feedback";
import { getRegionName } from "@/services/geo-data/regions";
import { ThemedIcon } from "@/services/theme/themed-icon";

const SELECTABLE_AREAS = MAP_REGION_NAMES.filter(
  (region) => region !== "world",
);

interface AreaSelectOption {
  label: string;
  value: MapRegionName;
}

interface SelectedAreaOption {
  label: string;
  value: string;
}

interface AreaSelectProps {
  onSelectedAreaChange: (area: MapRegionName) => void;
  selectedArea: MapRegionName;
}

export function AreaSelect({
  onSelectedAreaChange,
  selectedArea,
}: AreaSelectProps) {
  const { t } = useTranslation();
  const areaOptions = useMemo(
    () =>
      SELECTABLE_AREAS.map((area) => ({
        label: getRegionName({ region: area, t }),
        value: area,
      })),
    [t],
  );
  const selectedAreaOption = getSelectedAreaOption({
    areaOptions,
    selectedArea,
  });

  const handleValueChange = useCallback(
    (option: SelectedAreaOption | undefined) => {
      if (!isMapRegionName(option?.value) || option.value === "world") {
        return;
      }

      onSelectedAreaChange(option.value);
    },
    [onSelectedAreaChange],
  );

  return (
    <Select value={selectedAreaOption} onValueChange={handleValueChange}>
      <Select.Trigger
        accessibilityLabel={t("training-program.no-program.area.select-label")}
        className="bg-surface-tertiary"
      >
        <ThemedIcon icon={Globe2} size={20} />
        <Select.Value
          placeholder={t("training-program.no-program.area.placeholder")}
        />
        <Select.TriggerIndicator />
      </Select.Trigger>
      <Select.Portal>
        <Select.Overlay />
        <Select.Content presentation="popover" width="trigger" className="px-0">
          <Select.ListLabel className="px-4 pb-2 pt-2">
            {t("training-program.no-program.area.select-label")}
          </Select.ListLabel>
          {areaOptions.map((option) => (
            <HapticPressableFeedback key={option.value} asChild>
              <Select.Item
                value={option.value}
                label={option.label}
                className="px-4"
              >
                <View className="flex-1 flex-row items-center gap-3">
                  <ThemedIcon icon={Globe2} size={18} />
                  <Select.ItemLabel />
                </View>
                <Select.ItemIndicator className="pr-3">
                  <ThemedIcon icon={Check} />
                </Select.ItemIndicator>
              </Select.Item>
            </HapticPressableFeedback>
          ))}
        </Select.Content>
      </Select.Portal>
    </Select>
  );
}

interface GetSelectedAreaOptionParams {
  areaOptions: readonly AreaSelectOption[];
  selectedArea: MapRegionName;
}

function getSelectedAreaOption({
  areaOptions,
  selectedArea,
}: GetSelectedAreaOptionParams) {
  return areaOptions.find((option) => option.value === selectedArea);
}
