import { Surface } from "heroui-native/surface";
import { Text } from "heroui-native/text";
import { Dumbbell, GraduationCap } from "lucide-react-native";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";

import { HapticButton } from "@/components/haptic-button";
import { PageContent } from "@/components/page-content";
import { CancelProgramAction } from "@/modules/training-program/components/cancel-program-action";
import {
  DailyTestComplete,
  DailyTestRunner,
  PracticeRunner,
  type DailyTestAnswerRecord,
  type DailyTestResolution,
} from "@/modules/training-program/components/daily-test-runner";
import {
  ProgramProgressBar,
  TrainingProgramStatsPanel,
} from "@/modules/training-program/components/training-program-stats-panel";
import {
  isTodaysDailyTestDone,
  TRAINING_PROGRAM_PASS_THRESHOLD,
  type TrainingProgramSnapshot,
} from "@/modules/training-program/utils/training-program";
import {
  getLessonQuizzOptions,
  getLessonTemplate,
} from "@/modules/training-program/utils/training-program-lessons";
import { useTrainingProgram } from "@/modules/training-program/utils/training-program-storage";
import { getRegionName } from "@/services/geo-data/regions";
import { ThemedIcon } from "@/services/theme/themed-icon";
import { getUtcDayIndex } from "@/utils/dates";

interface ActiveProgramStateProps {
  snapshot: TrainingProgramSnapshot;
}

type ActiveProgramView =
  | { type: "overview" }
  | { type: "running" }
  | { type: "practicing" }
  | { hasPassed: boolean; score: DailyTestResolution; type: "result" };

/**
 * Active state body. Owns the Daily Test entry point and the local view machine
 * for taking it (overview -> running -> result). It does NOT own the section's
 * state branching: the No Program / Active / Completed dispatch stays in
 * `TrainingProgramPage`. A Lesson 8 pass turns the snapshot Completed, and the
 * reactive container re-renders the Completed screen on its own.
 *
 * Once today's Daily Test is done, the primary action becomes Practice
 * (issue 005): an ungated re-run of the SAME lesson quiz via `PracticeRunner`,
 * which owns its own `restartQuizz` retry loop and never grades the day.
 *
 * Seam for issue 006 (stats + cancel), which edits THIS body without touching
 * the container: add the program stats panel and the cancel-program action to the
 * overview, reading the snapshot already passed in and calling `cancelProgram`
 * from `useTrainingProgram`.
 */
export function ActiveProgramState({ snapshot }: ActiveProgramStateProps) {
  const { t } = useTranslation();
  const { completeTodaysDailyTest, recordAnswer } = useTrainingProgram();
  const [view, setView] = useState<ActiveProgramView>({ type: "overview" });
  const lesson = getLessonTemplate({ lessonNumber: snapshot.currentLesson });
  const isDailyTestDone = isTodaysDailyTestDone({
    currentUtcDayIndex: getUtcDayIndex({ date: new Date() }),
    snapshot,
  });
  const options = useMemo(() => {
    if (lesson === undefined) {
      return undefined;
    }

    return getLessonQuizzOptions({ area: snapshot.area, lesson });
  }, [lesson, snapshot.area]);

  const handleStartDailyTest = useCallback(() => {
    setView({ type: "running" });
  }, []);

  const handleStartPractice = useCallback(() => {
    setView({ type: "practicing" });
  }, []);

  const handlePracticeBackPress = useCallback(() => {
    setView({ type: "overview" });
  }, []);

  const handleRecordAnswer = useCallback(
    ({
      answerFormat,
      countryCode,
      isCorrectAnswer,
      questionFormat,
    }: DailyTestAnswerRecord) => {
      recordAnswer({
        answerFormat,
        countryCode,
        isCorrectAnswer,
        questionFormat,
      });
    },
    [recordAnswer],
  );

  const handleDailyTestComplete = useCallback(
    ({ correctCount, totalCount }: DailyTestResolution) => {
      const hasPassed =
        totalCount > 0 &&
        correctCount / totalCount >= TRAINING_PROGRAM_PASS_THRESHOLD;

      completeTodaysDailyTest({ correctCount, totalCount });
      setView({
        hasPassed,
        score: { correctCount, totalCount },
        type: "result",
      });
    },
    [completeTodaysDailyTest],
  );

  const handleResultBackPress = useCallback(() => {
    setView({ type: "overview" });
  }, []);

  if (view.type === "running" && options !== undefined) {
    return (
      <DailyTestRunner
        area={snapshot.area}
        onComplete={handleDailyTestComplete}
        onRecordAnswer={handleRecordAnswer}
        options={options}
      />
    );
  }

  if (view.type === "practicing" && options !== undefined) {
    return (
      <PracticeRunner
        area={snapshot.area}
        onBackPress={handlePracticeBackPress}
        onRecordAnswer={handleRecordAnswer}
        options={options}
      />
    );
  }

  if (view.type === "result") {
    return (
      <DailyTestComplete
        hasPassed={view.hasPassed}
        onBackPress={handleResultBackPress}
        score={view.score}
      />
    );
  }

  return (
    <ScrollView className="flex-1">
      <PageContent className="gap-5 px-6 pb-8 pt-4">
        <Surface variant="secondary" className="gap-3">
          <View className="flex-row items-center gap-2">
            <ThemedIcon
              colorClassName="text-accent"
              icon={GraduationCap}
              size={22}
            />
            <Text type="h3" className="flex-1">
              {t("training-program.active.title")}
            </Text>
          </View>
          <Text type="body" color="muted">
            {t("training-program.active.area", {
              area: getRegionName({ region: snapshot.area, t }),
            })}
          </Text>
          <ProgramProgressBar snapshot={snapshot} />
        </Surface>
        <ActiveProgramActions
          isDailyTestDone={isDailyTestDone}
          onStartDailyTest={handleStartDailyTest}
          onStartPractice={handleStartPractice}
        />
        <TrainingProgramStatsPanel snapshot={snapshot} />
        <CancelProgramAction />
      </PageContent>
    </ScrollView>
  );
}

interface ActiveProgramActionsProps {
  isDailyTestDone: boolean;
  onStartDailyTest: () => void;
  onStartPractice: () => void;
}

function ActiveProgramActions({
  isDailyTestDone,
  onStartDailyTest,
  onStartPractice,
}: ActiveProgramActionsProps) {
  const { t } = useTranslation();

  if (!isDailyTestDone) {
    return (
      <View className="gap-3">
        <HapticButton onPress={onStartDailyTest} variant="primary">
          <ThemedIcon
            colorClassName="text-accent-foreground"
            icon={GraduationCap}
            size={18}
          />
          <HapticButton.Label>
            {t("training-program.active.daily-test.start")}
          </HapticButton.Label>
        </HapticButton>
        <Text type="body-sm" color="muted" align="center">
          {t("training-program.active.daily-test.locked-practice")}
        </Text>
      </View>
    );
  }

  return (
    <View className="gap-3">
      <HapticButton onPress={onStartPractice} variant="primary">
        <ThemedIcon
          colorClassName="text-accent-foreground"
          icon={Dumbbell}
          size={18}
        />
        <HapticButton.Label>
          {t("training-program.active.practice.start")}
        </HapticButton.Label>
      </HapticButton>
      <Surface variant="secondary" className="gap-2">
        <Text type="body" weight="semibold">
          {t("training-program.active.daily-test.done-title")}
        </Text>
        <Text type="body-sm" color="muted">
          {t("training-program.active.practice.description")}
        </Text>
      </Surface>
    </View>
  );
}
