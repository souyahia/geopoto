import { Select } from "heroui-native/select";
import { Text } from "heroui-native/text";
import type { TFunction } from "i18next";
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

const WORLD_REGION: MapRegionName = "world";

interface RegionDisplayOption {
  label: string;
  value: MapRegionName;
}

type SelectedRegionSelectOption =
  | {
      label: string;
      value: string;
    }
  | undefined;

interface RegionSelectProps {
  onSelectedRegionsChange: (regions: MapRegionName[]) => void;
  selectedRegions: readonly MapRegionName[];
}

export function RegionSelect({
  onSelectedRegionsChange,
  selectedRegions,
}: RegionSelectProps) {
  const { t } = useTranslation();
  const regionOptions = useMemo(
    () =>
      MAP_REGION_NAMES.map((region) => ({
        label: getRegionName({ region, t }),
        value: region,
      })),
    [t],
  );
  const selectedRegionOptions = useMemo(
    () =>
      regionOptions.filter((option) => selectedRegions.includes(option.value)),
    [regionOptions, selectedRegions],
  );
  const triggerLabel = getRegionTriggerLabel({ selectedRegions, t });

  const handleValueChange = useCallback(
    (options: SelectedRegionSelectOption[]) => {
      const nextRegions = options
        .map((option) => option?.value)
        .filter(isMapRegionName);

      if (nextRegions.length === 0) {
        return;
      }

      const hadWorldSelected = selectedRegions.includes(WORLD_REGION);
      const hasWorldSelected = nextRegions.includes(WORLD_REGION);

      if (hasWorldSelected && !hadWorldSelected) {
        onSelectedRegionsChange([WORLD_REGION]);
        return;
      }

      if (hasWorldSelected && nextRegions.length > 1) {
        onSelectedRegionsChange(
          nextRegions.filter((region) => region !== WORLD_REGION),
        );
        return;
      }

      onSelectedRegionsChange(nextRegions);
    },
    [onSelectedRegionsChange, selectedRegions],
  );

  return (
    <Select
      onValueChange={handleValueChange}
      selectionMode="multiple"
      value={selectedRegionOptions}
    >
      <Select.Trigger
        accessibilityLabel={t("train.region.select-label")}
        className="bg-surface-tertiary"
      >
        <ThemedIcon icon={Globe2} size={20} />
        <Text type="body" className="flex-1" numberOfLines={1}>
          {triggerLabel}
        </Text>
        <Select.TriggerIndicator />
      </Select.Trigger>
      <Select.Portal>
        <Select.Overlay animation="disabled" />
        <Select.Content
          animation="disabled"
          presentation="popover"
          width="trigger"
          className="px-0"
        >
          <Select.ListLabel className="px-4 pb-2 pt-2">
            {t("train.region.select-label")}
          </Select.ListLabel>
          {regionOptions.map((option) => (
            <RegionSelectItem key={option.value} option={option} />
          ))}
        </Select.Content>
      </Select.Portal>
    </Select>
  );
}

interface RegionSelectItemProps {
  option: RegionDisplayOption;
}

function RegionSelectItem({ option }: RegionSelectItemProps) {
  return (
    <HapticPressableFeedback asChild>
      <Select.Item
        closeOnPress={false}
        className="px-4"
        label={option.label}
        value={option.value}
      >
        {({ isSelected }) => (
          <View className="flex-1 flex-row items-center gap-3">
            <RegionSelectionMark isSelected={isSelected} />
            <ThemedIcon icon={Globe2} size={18} />
            <Select.ItemLabel />
          </View>
        )}
      </Select.Item>
    </HapticPressableFeedback>
  );
}

interface RegionSelectionMarkProps {
  isSelected: boolean;
}

function RegionSelectionMark({ isSelected }: RegionSelectionMarkProps) {
  return (
    <View
      className={[
        "size-6 items-center justify-center rounded-lg border",
        isSelected ? "border-accent bg-accent" : "border-border bg-field",
      ].join(" ")}
      pointerEvents="none"
    >
      {isSelected && (
        <ThemedIcon
          colorClassName="text-accent-foreground"
          icon={Check}
          size={16}
          strokeWidth={3}
        />
      )}
    </View>
  );
}

interface GetRegionTriggerLabelParams {
  selectedRegions: readonly MapRegionName[];
  t: TFunction;
}

function getRegionTriggerLabel({
  selectedRegions,
  t,
}: GetRegionTriggerLabelParams): string {
  if (selectedRegions.includes(WORLD_REGION)) {
    return t("train.region.all");
  }

  const singleSelectedRegion =
    selectedRegions.length === 1 ? selectedRegions.at(0) : undefined;

  if (singleSelectedRegion !== undefined) {
    return getRegionName({ region: singleSelectedRegion, t });
  }

  return t("train.region.selected", { count: selectedRegions.length });
}
