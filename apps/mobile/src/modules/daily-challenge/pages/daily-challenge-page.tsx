import dayjs from "dayjs";
import { useRouter } from "expo-router";
import { Surface } from "heroui-native/surface";
import { Text } from "heroui-native/text";
import { CheckCircle2, CircleX, Flame, Home } from "lucide-react-native";
import { useCallback, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";

import type { MapRegionName } from "@geopoto/geo-data";

import { BackButton } from "@/components/back-button";
import { HapticButton } from "@/components/haptic-button";
import { Header } from "@/components/header/header";
import { PageContent } from "@/components/page-content";
import { recordPracticeResult } from "@/modules/adaptive-difficulty/utils/adaptive-history-storage";
import { reconcileStoredDailyChallengeReminders } from "@/modules/daily-challenge-reminder/utils/daily-challenge-reminder-reconciliation";
import {
  QuizzQuestionCard,
  type QuizzAnswerResolution,
} from "@/modules/quizz/components/quizz-question-card";
import {
  useQuizz,
  type QuizzAnswerSubmission,
  type QuizzCurrentQuestion,
  type QuizzScore,
} from "@/modules/quizz/hooks/use-quizz";
import type { AnswerDifficulty } from "@/modules/quizz/utils/quizz";
import { KeyboardAwareScrollView } from "@/services/keyboard/keyboard-aware-scroll-view";
import { ThemedIcon } from "@/services/theme/themed-icon";

import { getDailyChallenge } from "../utils/daily-challenge";
import {
  useDailyChallengeProgress,
  type DailyChallengeResultStatus,
  type DailyChallengeStatus,
} from "../utils/daily-challenge-progress-storage";

const DAILY_CHALLENGE_KEYBOARD_BOTTOM_OFFSET = 128;
const DEFAULT_DAILY_CHALLENGE_REGION: MapRegionName = "world";

export function DailyChallengePage() {
  const router = useRouter();
  const { t } = useTranslation();
  const challenge = useMemo(() => getDailyChallenge({}), []);
  const notificationContent = useMemo(
    () => ({
      body: t("settings.daily-challenge-reminder.notification.body"),
      channelName: t(
        "settings.daily-challenge-reminder.notification.channel-name",
      ),
      title: t("settings.daily-challenge-reminder.notification.title"),
    }),
    [t],
  );
  const questions = useMemo(() => [challenge.question], [challenge.question]);
  const { completeDailyChallenge, progress: dailyChallengeProgress } =
    useDailyChallengeProgress({ challenge });
  const isChallengePlayableOnOpenRef = useRef(
    dailyChallengeProgress.status === "not-played",
  );
  const hasRecordedAnswerRef = useRef(false);
  const { currentQuestion, isComplete, score, submitAnswer } = useQuizz({
    options: challenge.options,
    questions,
  });
  const answerRegion =
    challenge.options.regions.at(0) ?? DEFAULT_DAILY_CHALLENGE_REGION;
  const shouldShowStoredResult =
    !isChallengePlayableOnOpenRef.current &&
    dailyChallengeProgress.status !== "not-played";
  const currentQuestionKey =
    currentQuestion === null
      ? "complete"
      : [
          dailyChallengeProgress.dateKey,
          currentQuestion.countryCode,
          currentQuestion.questionFormat,
          currentQuestion.answerFormat,
        ].join(":");

  const handleBackHomePress = useCallback(() => {
    router.replace("/home");
  }, [router]);

  const handleAnswerResolved = useCallback(
    (resolution: QuizzAnswerResolution) => {
      if (hasRecordedAnswerRef.current) {
        return;
      }

      hasRecordedAnswerRef.current = true;
      const isDailyChallengeCompletionAccepted = completeDailyChallenge({
        isSuccessful: resolution.isCorrectAnswer,
      });

      if (!isDailyChallengeCompletionAccepted) {
        return;
      }

      void recordPracticeResult({
        answerFormat: challenge.question.answerFormat,
        countryCode: challenge.question.countryCode,
        isCorrectAnswer: resolution.isCorrectAnswer,
        questionFormat: challenge.question.questionFormat,
      }).catch((error: unknown) => {
        console.error("Failed to record Practice Result", error);
      });
      void reconcileStoredDailyChallengeReminders({
        content: notificationContent,
      }).catch(() => undefined);
    },
    [challenge.question, completeDailyChallenge, notificationContent],
  );

  const handleAnswerSubmit = useCallback(
    (answer: QuizzAnswerSubmission) => {
      submitAnswer({ answer });
    },
    [submitAnswer],
  );

  return (
    <View className="flex-1 p-safe">
      <DailyChallengeHeader title={t("daily-challenge.title")} />
      {shouldShowStoredResult || isComplete || currentQuestion === null ? (
        <DailyChallengeResult
          onBackHomePress={handleBackHomePress}
          status={getDailyChallengeResultStatus({
            progressStatus: dailyChallengeProgress.status,
            score,
          })}
          streak={dailyChallengeProgress.streak}
        />
      ) : (
        <DailyChallengeQuestionContent
          answerDifficulty={challenge.options.answerDifficulty}
          answerRegion={answerRegion}
          currentQuestion={currentQuestion}
          currentQuestionKey={currentQuestionKey}
          onAnswerResolved={handleAnswerResolved}
          onAnswerSubmit={handleAnswerSubmit}
          dateKey={dailyChallengeProgress.dateKey}
          streak={dailyChallengeProgress.streak}
        />
      )}
    </View>
  );
}

interface DailyChallengeHeaderProps {
  title: string;
}

function DailyChallengeHeader({ title }: DailyChallengeHeaderProps) {
  return (
    <Header className="px-2">
      <Header.Left>
        <BackButton />
      </Header.Left>
      <Header.Center style={{ maxWidth: "60%" }}>
        <Text type="h2" align="center" truncate>
          {title}
        </Text>
      </Header.Center>
    </Header>
  );
}

interface DailyChallengeQuestionContentProps {
  answerDifficulty: AnswerDifficulty;
  answerRegion: MapRegionName;
  currentQuestion: QuizzCurrentQuestion;
  currentQuestionKey: string;
  dateKey: string;
  onAnswerResolved: (resolution: QuizzAnswerResolution) => void;
  onAnswerSubmit: (answer: QuizzAnswerSubmission) => void;
  streak: number;
}

function DailyChallengeQuestionContent({
  answerDifficulty,
  answerRegion,
  currentQuestion,
  currentQuestionKey,
  dateKey,
  onAnswerResolved,
  onAnswerSubmit,
  streak,
}: DailyChallengeQuestionContentProps) {
  const shouldUsePlainContainer =
    currentQuestion.answerFormat === "country-flag";

  if (shouldUsePlainContainer) {
    return (
      <ScrollView
        key={currentQuestionKey}
        alwaysBounceVertical={false}
        className="flex-1"
        keyboardShouldPersistTaps="handled"
      >
        <PageContent className="gap-5 px-6 pb-8 pt-4">
          <DailyChallengeInfoPanel dateKey={dateKey} streak={streak} />
          <QuizzQuestionCard
            answerDifficulty={answerDifficulty}
            answerFormat={currentQuestion.answerFormat}
            answerRegions={[answerRegion]}
            country={currentQuestion.country}
            onAnswerResolved={onAnswerResolved}
            onAnswerSubmit={onAnswerSubmit}
            questionFormat={currentQuestion.questionFormat}
          />
        </PageContent>
      </ScrollView>
    );
  }

  return (
    <KeyboardAwareScrollView
      key={currentQuestionKey}
      alwaysBounceVertical={false}
      bottomOffset={DAILY_CHALLENGE_KEYBOARD_BOTTOM_OFFSET}
      className="flex-1"
      keyboardShouldPersistTaps="handled"
    >
      <PageContent className="gap-5 px-6 pb-8 pt-4">
        <DailyChallengeInfoPanel dateKey={dateKey} streak={streak} />
        <QuizzQuestionCard
          answerDifficulty={answerDifficulty}
          answerFormat={currentQuestion.answerFormat}
          answerRegions={[answerRegion]}
          country={currentQuestion.country}
          onAnswerResolved={onAnswerResolved}
          onAnswerSubmit={onAnswerSubmit}
          questionFormat={currentQuestion.questionFormat}
        />
      </PageContent>
    </KeyboardAwareScrollView>
  );
}

interface DailyChallengeInfoPanelProps {
  dateKey: string;
  streak: number;
}

function DailyChallengeInfoPanel({
  dateKey,
  streak,
}: DailyChallengeInfoPanelProps) {
  const { t } = useTranslation();
  const formattedDate = formatDailyChallengeDate({ dateKey });

  return (
    <Surface variant="secondary" className="gap-3">
      <View className="flex-row items-center justify-between gap-4">
        <View className="min-w-0 flex-1">
          <Text type="h4">{t("daily-challenge.question.title")}</Text>
          <Text type="body-sm" color="muted" numberOfLines={1}>
            {formattedDate}
          </Text>
        </View>
        <View className="min-w-24 flex-row items-center justify-center gap-2 rounded-full bg-surface-tertiary px-3 py-2">
          <ThemedIcon colorClassName="text-warning" icon={Flame} size={18} />
          <View>
            <Text type="body-xs" color="muted" className="leading-4">
              {t("daily-challenge.question.streak")}
            </Text>
            <Text type="h4" className="leading-6">
              {streak}
            </Text>
          </View>
        </View>
      </View>
    </Surface>
  );
}

interface FormatDailyChallengeDateParams {
  dateKey: string;
}

function formatDailyChallengeDate({
  dateKey,
}: FormatDailyChallengeDateParams): string {
  return dayjs(dateKey).format("LL");
}

interface DailyChallengeResultProps {
  onBackHomePress: () => void;
  status: DailyChallengeResultStatus;
  streak: number;
}

function DailyChallengeResult({
  onBackHomePress,
  status,
  streak,
}: DailyChallengeResultProps) {
  const { t } = useTranslation();
  const isCompleted = status === "completed";
  const icon = isCompleted ? CheckCircle2 : CircleX;
  const iconColorClassName = isCompleted ? "text-success" : "text-danger";
  const title = isCompleted
    ? t("daily-challenge.complete.completed-title")
    : t("daily-challenge.complete.failed-title");
  const description = isCompleted
    ? t("daily-challenge.complete.completed-description", { streak })
    : t("daily-challenge.complete.failed-description");
  const isStreakVisible = streak >= 1;

  return (
    <ScrollView className="flex-1">
      <PageContent className="gap-5 px-6 pb-8 pt-8">
        <Surface variant="secondary" className="items-center gap-5">
          <View className="items-center gap-3">
            <View className="h-20 w-20 items-center justify-center rounded-full bg-surface-tertiary">
              <ThemedIcon
                colorClassName={iconColorClassName}
                icon={icon}
                size={44}
                strokeWidth={2.5}
              />
            </View>
            <View className="gap-2">
              <Text type="h2" align="center">
                {title}
              </Text>
              <Text type="body" color="muted" align="center">
                {description}
              </Text>
            </View>
          </View>
          {isStreakVisible && (
            <View className="flex-row items-center gap-2 rounded-full bg-surface-tertiary px-4 py-2">
              <ThemedIcon colorClassName="text-warning" icon={Flame} />
              <Text type="h4">{streak}</Text>
            </View>
          )}
        </Surface>
        <HapticButton onPress={onBackHomePress} variant="primary">
          <ThemedIcon
            colorClassName="text-accent-foreground"
            icon={Home}
            size={18}
          />
          <HapticButton.Label>
            {t("daily-challenge.complete.back-home")}
          </HapticButton.Label>
        </HapticButton>
      </PageContent>
    </ScrollView>
  );
}

interface GetDailyChallengeResultStatusParams {
  progressStatus: DailyChallengeStatus;
  score: QuizzScore;
}

function getDailyChallengeResultStatus({
  progressStatus,
  score,
}: GetDailyChallengeResultStatusParams): DailyChallengeResultStatus {
  if (progressStatus === "completed" || progressStatus === "failed") {
    return progressStatus;
  }

  if (score.correctAnswers === score.totalQuestions) {
    return "completed";
  }

  return "failed";
}
