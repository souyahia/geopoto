import { Surface } from "heroui-native/surface";
import { Text } from "heroui-native/text";
import { PartyPopper, Sparkles } from "lucide-react-native";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";

import { HapticButton } from "@/components/haptic-button";
import { PageContent } from "@/components/page-content";
import { TrainingProgramStatsPanel } from "@/modules/training-program/components/training-program-stats-panel";
import type { TrainingProgramSnapshot } from "@/modules/training-program/utils/training-program";
import { useTrainingProgram } from "@/modules/training-program/utils/training-program-storage";
import { getRegionName } from "@/services/geo-data/regions";
import { ThemedIcon } from "@/services/theme/themed-icon";

interface CompletedProgramStateProps {
  snapshot: TrainingProgramSnapshot;
}

/**
 * Completed state body for a `completed` snapshot. The section container
 * (issue 003) routes here; this slice only RENDERS the snapshot and never sets
 * `status` itself (the Lesson 8 pass that flips the status is owned by issue 002
 * and triggered from issue 004).
 *
 * Reuses the result-screen layout of `TrainingSessionComplete` (centered congrats
 * surface), the program stats panel (days trained, hardest country, best streak
 * and accuracy), and issue 002's `cancelProgram`: "Start a new
 * program" behaves exactly like cancelling, clearing the snapshot so the reactive
 * container re-renders the No Program state where a new Area can be picked.
 */
export function CompletedProgramState({
  snapshot,
}: CompletedProgramStateProps) {
  const { t } = useTranslation();
  const { cancelProgram } = useTrainingProgram();

  const handleStartNewPress = useCallback(() => {
    cancelProgram();
  }, [cancelProgram]);

  return (
    <ScrollView className="flex-1">
      <PageContent className="gap-5 px-6 pb-8 pt-8">
        <Surface variant="secondary" className="gap-5">
          <View className="items-center gap-2">
            <ThemedIcon
              colorClassName="text-warning"
              icon={PartyPopper}
              size={40}
            />
            <Text type="h2" align="center">
              {t("training-program.completed.title")}
            </Text>
            <Text type="body" color="muted" align="center">
              {t("training-program.completed.area", {
                area: getRegionName({ region: snapshot.area, t }),
              })}
            </Text>
            <Text type="body" color="muted" align="center">
              {t("training-program.completed.congrats")}
            </Text>
          </View>
        </Surface>
        <TrainingProgramStatsPanel snapshot={snapshot} />
        <HapticButton onPress={handleStartNewPress} variant="primary">
          <ThemedIcon
            colorClassName="text-accent-foreground"
            icon={Sparkles}
            size={18}
          />
          <HapticButton.Label>
            {t("training-program.completed.start-new")}
          </HapticButton.Label>
        </HapticButton>
      </PageContent>
    </ScrollView>
  );
}
