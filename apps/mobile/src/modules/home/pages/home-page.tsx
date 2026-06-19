import { useRouter } from "expo-router";
import { Text } from "heroui-native/text";
import {
  BookOpenText,
  CalendarDays,
  CheckCircle2,
  CircleDashed,
  CircleX,
  Dumbbell,
  Flame,
  GraduationCap,
  Settings,
  type LucideIcon,
} from "lucide-react-native";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";

import { AssetImage, ASSET_IMAGES } from "@/components/asset-image";
import { BackroomsButton } from "@/components/backrooms-button";
import { HapticButton } from "@/components/haptic-button";
import { MenuCard } from "@/components/menu-card";
import { PageContent } from "@/components/page-content";
import { getDailyChallenge } from "@/modules/daily-challenge/utils/daily-challenge";
import {
  useDailyChallengeProgress,
  type DailyChallengeStatus,
} from "@/modules/daily-challenge/utils/daily-challenge-progress-storage";
import {
  isTodaysDailyTestDone,
  type TrainingProgramSnapshot,
} from "@/modules/training-program/utils/training-program";
import { useTrainingProgram } from "@/modules/training-program/utils/training-program-storage";
import { ThemedIcon } from "@/services/theme/themed-icon";
import { getUtcDayIndex } from "@/utils/dates";

export function HomePage() {
  const { t } = useTranslation();
  const router = useRouter();
  const dailyChallenge = useMemo(() => getDailyChallenge({}), []);
  const { progress: dailyChallengeProgress } = useDailyChallengeProgress({
    challenge: dailyChallenge,
  });
  const isDailyChallengePlayed = isDailyChallengeStatusPlayed({
    status: dailyChallengeProgress.status,
  });
  const { snapshot: trainingProgramSnapshot } = useTrainingProgram();
  const isTrainingProgramTestReady = isTrainingProgramDailyTestReady({
    snapshot: trainingProgramSnapshot,
  });

  return (
    <View className="flex-1 p-safe">
      <View className="flex-row items-center justify-end p-4 gap-2">
        <BackroomsButton />
        <HapticButton
          variant="ghost"
          aria-label={t("home.settings")}
          isIconOnly
          onPress={() => router.push("/settings")}
        >
          <ThemedIcon icon={Settings} />
        </HapticButton>
      </View>
      <ScrollView
        alwaysBounceVertical={false}
        bounces={false}
        className="flex-1"
      >
        <PageContent>
          <View className="items-center justify-center px-8 pb-2">
            <AssetImage
              image={ASSET_IMAGES.GEOPOTO_ILLUSTRATION}
              contentFit="contain"
              style={{
                width: "95%",
                maxWidth: 400,
              }}
            />
          </View>
          <View className="gap-4 px-10 py-4">
            <MenuCard
              icon={CalendarDays}
              title={t("home.game-modes.daily-challenge.title")}
              description={t("home.game-modes.daily-challenge.description")}
              isDisabled={isDailyChallengePlayed}
              onPress={() => router.push("/daily-challenge")}
              titleAccessory={
                <DailyChallengeStatusRow
                  status={dailyChallengeProgress.status}
                  streak={dailyChallengeProgress.streak}
                />
              }
            />
            <MenuCard
              icon={GraduationCap}
              title={t("home.game-modes.training-program.title")}
              description={t("home.game-modes.training-program.description")}
              onPress={() => router.push("/training-program")}
              hasNotificationDot={isTrainingProgramTestReady}
            />
            <MenuCard
              icon={Dumbbell}
              title={t("home.game-modes.train.title")}
              description={t("home.game-modes.train.description")}
              onPress={() => router.push("/train")}
            />
            <MenuCard
              icon={BookOpenText}
              title={t("home.game-modes.learn.title")}
              description={t("home.game-modes.learn.description")}
              onPress={() => router.push("/learn")}
            />
          </View>
        </PageContent>
      </ScrollView>
    </View>
  );
}

interface DailyChallengeStatusRowProps {
  status: DailyChallengeStatus;
  streak: number;
}

function DailyChallengeStatusRow({
  status,
  streak,
}: DailyChallengeStatusRowProps) {
  const isStreakVisible = streak >= 1;

  return (
    <View className="flex-row items-center gap-1.5">
      <DailyChallengeStatusIcon status={status} />
      {isStreakVisible && (
        <View className="flex-row items-center gap-1 rounded-full bg-surface-tertiary px-2 py-1">
          <ThemedIcon colorClassName="text-warning" icon={Flame} size={14} />
          <Text type="body-xs" weight="semibold" className="leading-4">
            {streak}
          </Text>
        </View>
      )}
    </View>
  );
}

interface DailyChallengeStatusIconProps {
  status: DailyChallengeStatus;
}

function DailyChallengeStatusIcon({ status }: DailyChallengeStatusIconProps) {
  const iconConfig = DAILY_CHALLENGE_STATUS_ICON_CONFIGS[status];

  return (
    <View className="h-6 w-6 items-center justify-center rounded-full bg-surface-tertiary">
      <ThemedIcon
        colorClassName={iconConfig.colorClassName}
        icon={iconConfig.icon}
        size={14}
      />
    </View>
  );
}

interface DailyChallengeStatusIconConfig {
  colorClassName: string;
  icon: LucideIcon;
}

const DAILY_CHALLENGE_STATUS_ICON_CONFIGS = {
  completed: {
    colorClassName: "text-success",
    icon: CheckCircle2,
  },
  failed: {
    colorClassName: "text-danger",
    icon: CircleX,
  },
  "not-played": {
    colorClassName: "text-default-foreground",
    icon: CircleDashed,
  },
} satisfies Record<DailyChallengeStatus, DailyChallengeStatusIconConfig>;

interface IsTrainingProgramDailyTestReadyParams {
  snapshot: TrainingProgramSnapshot | undefined;
}

function isTrainingProgramDailyTestReady({
  snapshot,
}: IsTrainingProgramDailyTestReadyParams): boolean {
  if (snapshot === undefined || snapshot.status !== "active") {
    return false;
  }

  return !isTodaysDailyTestDone({
    currentUtcDayIndex: getUtcDayIndex({ date: new Date() }),
    snapshot,
  });
}

interface IsDailyChallengeStatusPlayedParams {
  status: DailyChallengeStatus;
}

function isDailyChallengeStatusPlayed({
  status,
}: IsDailyChallengeStatusPlayedParams) {
  return status !== "not-played";
}
