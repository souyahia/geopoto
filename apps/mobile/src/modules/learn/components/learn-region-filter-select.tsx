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

interface LearnRegionFilterSelectProps {
  onSelectedRegionChange: (region: MapRegionName) => void;
  selectedRegion: MapRegionName;
}

interface RegionFilterOption {
  label: string;
  value: MapRegionName;
}

interface SelectedRegionFilterOption {
  label: string;
  value: string;
}

interface GetSelectedRegionFilterOptionParams {
  regionOptions: readonly RegionFilterOption[];
  selectedRegion: MapRegionName;
}

export function LearnRegionFilterSelect({
  onSelectedRegionChange,
  selectedRegion,
}: LearnRegionFilterSelectProps) {
  const { t } = useTranslation();
  const regionOptions = useMemo(
    () =>
      MAP_REGION_NAMES.map((region) => ({
        label: getRegionName({ region, t }),
        value: region,
      })),
    [t],
  );
  const selectedRegionOption = getSelectedRegionFilterOption({
    regionOptions,
    selectedRegion,
  });
  const selectLabel = t("learn.region-filter.select-label");

  const handleValueChange = useCallback(
    (option: SelectedRegionFilterOption | undefined) => {
      if (!isMapRegionName(option?.value)) {
        return;
      }

      onSelectedRegionChange(option.value);
    },
    [onSelectedRegionChange],
  );

  return (
    <Select value={selectedRegionOption} onValueChange={handleValueChange}>
      <Select.Trigger
        accessibilityLabel={selectLabel}
        className="bg-surface-tertiary"
      >
        <ThemedIcon icon={Globe2} size={20} />
        <Select.Value placeholder={selectLabel} />
        <Select.TriggerIndicator />
      </Select.Trigger>
      <Select.Portal>
        <Select.Overlay />
        <Select.Content presentation="popover" width="trigger" className="px-0">
          <Select.ListLabel className="px-4 pb-2 pt-2">
            {selectLabel}
          </Select.ListLabel>
          {regionOptions.map((option) => (
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

function getSelectedRegionFilterOption({
  regionOptions,
  selectedRegion,
}: GetSelectedRegionFilterOptionParams) {
  return regionOptions.find((option) => option.value === selectedRegion);
}
