import { Surface } from "heroui-native/surface";
import { Text } from "heroui-native/text";
import {
  CalendarCheck,
  CheckCircle2,
  CircleX,
  Flame,
  MapPin,
  type LucideIcon,
} from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { COUNTRIES } from "@geopoto/geo-data";

import type { TrainingProgramSnapshot } from "@/modules/training-program/utils/training-program";
import {
  getAccuracy,
  getHardestCountry,
  getProgressRatio,
  type HardestCountry,
} from "@/modules/training-program/utils/training-program-selectors";
import { ThemedIcon } from "@/services/theme/themed-icon";
import { useGeoLangStore } from "@/utils/language/geo-lang-store";

const PERCENT_FORMATTER_RATIO = 100;

interface TrainingProgramStatsPanelProps {
  snapshot: TrainingProgramSnapshot;
}

/**
 * Program-scoped stats panel built from issue 002's selectors. Reusable by both
 * the Active overview and the Completed screen. The in-program progress bar is
 * rendered separately (`ProgramProgressBar`) by the Active top card, so the panel
 * itself only surfaces accuracy, best streak, days trained and hardest country.
 */
export function TrainingProgramStatsPanel({
  snapshot,
}: TrainingProgramStatsPanelProps) {
  const { t } = useTranslation();
  const accuracy = getAccuracy({ snapshot });
  const wrongRatio =
    snapshot.correctCount + snapshot.wrongCount > 0 ? 1 - accuracy : 0;
  const hardestCountry = getHardestCountry({ snapshot });

  return (
    <Surface variant="secondary" className="gap-4">
      <Text type="h4">{t("training-program.active.stats.title")}</Text>
      <View className="gap-2">
        <View className="flex-row gap-2">
          <StatPill
            colorClassName="text-success"
            icon={CheckCircle2}
            label={t("training-program.active.stats.correct")}
            value={formatPercent({ ratio: accuracy })}
          />
          <StatPill
            colorClassName="text-danger"
            icon={CircleX}
            label={t("training-program.active.stats.wrong")}
            value={formatPercent({ ratio: wrongRatio })}
          />
        </View>
        <View className="flex-row gap-2">
          <StatPill
            colorClassName="text-warning"
            icon={Flame}
            label={t("training-program.active.stats.best-streak")}
            value={`${snapshot.bestStreak}`}
          />
          <StatPill
            icon={CalendarCheck}
            label={t("training-program.active.stats.days-trained")}
            value={`${snapshot.daysTrained}`}
          />
        </View>
      </View>
      <HardestCountryRow hardestCountry={hardestCountry} />
    </Surface>
  );
}

interface ProgramProgressBarProps {
  snapshot: TrainingProgramSnapshot;
}

/**
 * Standalone program-progress bar (percentage + bar only, no lesson count). Lives
 * in the Active top card, under the focused region.
 */
export function ProgramProgressBar({ snapshot }: ProgramProgressBarProps) {
  const progressRatio = getProgressRatio({ snapshot });
  const progressValue = Math.min(Math.max(progressRatio, 0), 1);
  const remainingProgressValue = 1 - progressValue;

  return (
    <View className="gap-2">
      <Text type="body-sm" weight="semibold" className="self-end">
        {formatPercent({ ratio: progressRatio })}
      </Text>
      <View className="h-2 flex-row overflow-hidden rounded-full bg-default">
        <View
          className="h-full rounded-full bg-accent"
          style={{ flex: progressValue }}
        />
        <View style={{ flex: remainingProgressValue }} />
      </View>
    </View>
  );
}

interface HardestCountryRowProps {
  hardestCountry: HardestCountry | undefined;
}

function HardestCountryRow({ hardestCountry }: HardestCountryRowProps) {
  const { t } = useTranslation();
  const { geoLang } = useGeoLangStore();

  if (hardestCountry === undefined) {
    return (
      <View className="flex-row items-center gap-2">
        <ThemedIcon colorClassName="text-muted" icon={MapPin} size={16} />
        <Text type="body-sm" color="muted">
          {t("training-program.active.stats.hardest-country-empty")}
        </Text>
      </View>
    );
  }

  const country = COUNTRIES.find(
    (candidate) => candidate.code === hardestCountry.countryCode,
  );
  const countryName =
    country !== undefined ? country.name[geoLang] : hardestCountry.countryCode;

  return (
    <View className="flex-row items-center gap-2">
      <ThemedIcon colorClassName="text-danger" icon={MapPin} size={16} />
      <Text type="body-sm" color="muted">
        {t("training-program.active.stats.hardest-country", {
          country: countryName,
        })}
      </Text>
    </View>
  );
}

interface StatPillProps {
  colorClassName?: string;
  icon: LucideIcon;
  label: string;
  value: string;
}

function StatPill({ colorClassName, icon, label, value }: StatPillProps) {
  return (
    <View className="min-w-0 flex-1 gap-1 rounded-lg bg-surface-tertiary px-3 py-2">
      <View className="min-w-0 flex-row items-center gap-1.5">
        <ThemedIcon colorClassName={colorClassName} icon={icon} size={14} />
        <Text type="body-xs" color="muted" numberOfLines={1} className="flex-1">
          {label}
        </Text>
      </View>
      <Text type="h5">{value}</Text>
    </View>
  );
}

interface FormatPercentParams {
  ratio: number;
}

function formatPercent({ ratio }: FormatPercentParams): string {
  return `${Math.round(ratio * PERCENT_FORMATTER_RATIO)}%`;
}
