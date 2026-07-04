import { useLocalSearchParams, useRouter } from "expo-router";
import { Surface } from "heroui-native/surface";
import { Text } from "heroui-native/text";
import {
  ArrowLeft,
  CheckCircle2,
  CircleX,
  Flame,
  InfinityIcon,
  ListChecks,
  RotateCcw,
  type LucideIcon,
} from "lucide-react-native";
import { useCallback, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";

import type { MapRegionName } from "@geopoto/geo-data";

import { HapticButton } from "@/components/haptic-button";
import { PageContent } from "@/components/page-content";
import { recordPracticeResult } from "@/modules/adaptive-difficulty/utils/adaptive-history-storage";
import { KeyboardAwareScrollView } from "@/services/keyboard/keyboard-aware-scroll-view";
import { useNavigationConfirm } from "@/services/navigation-confirm/use-navigation-confirm";
import { ThemedIcon } from "@/services/theme/themed-icon";

import { QuizzQuestionCard } from "../components/quizz-question-card";
import type { QuizzAnswerResolution } from "../components/quizz-question-card";
import { TrainHeader } from "../components/train-header";
import {
  useQuizz,
  type QuizzCurrentQuestion,
  type QuizzScore,
  type QuizzAnswerSubmission,
} from "../hooks/use-quizz";
import type { AnswerDifficulty } from "../utils/quizz";
import {
  getTrainingSessionOptionsStorageValue,
  saveTrainingSessionOptionsValue,
} from "../utils/training-session-options-storage";
import { getTrainingSessionOptionsFromParams } from "../utils/training-session-params";

const TRAINING_SESSION_KEYBOARD_BOTTOM_OFFSET = 128;

export function TrainingSessionPage() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { t } = useTranslation();
  const quizzOptions = useMemo(
    () => getTrainingSessionOptionsFromParams({ params }),
    [params],
  );
  const quizzOptionsStorageValue = useMemo(
    () => getTrainingSessionOptionsStorageValue({ options: quizzOptions }),
    [quizzOptions],
  );
  const answerRegion = quizzOptions.regions.at(0) ?? "world";
  const {
    currentQuestion,
    isComplete,
    isInfiniteModeSession,
    isPreparingAdaptiveHistory,
    progress,
    restartQuizz,
    score,
    submitAnswer,
  } = useQuizz({ options: quizzOptions });
  const isSessionFinished =
    !isPreparingAdaptiveHistory && (isComplete || currentQuestion === null);
  const currentQuestionKey =
    currentQuestion === null
      ? "complete"
      : [
          score.answeredQuestions,
          currentQuestion.countryCode,
          currentQuestion.questionFormat,
          currentQuestion.answerFormat,
          quizzOptions.answerDifficulty,
        ].join(":");

  useEffect(() => {
    saveTrainingSessionOptionsValue({ value: quizzOptionsStorageValue });
  }, [quizzOptionsStorageValue]);

  useNavigationConfirm({
    cancelLabel: t("train.session.leave-confirm.cancel-label"),
    confirmLabel: t("train.session.leave-confirm.confirm-label"),
    description: t("train.session.leave-confirm.description"),
    isDisabled: isSessionFinished,
    title: t("train.session.leave-confirm.title"),
  });

  const handleBackPress = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/train");
  }, [router]);

  const handleAnswerSubmit = useCallback(
    (answer: QuizzAnswerSubmission) => {
      submitAnswer({ answer });
    },
    [submitAnswer],
  );

  return (
    <View className="flex-1 p-safe">
      <TrainHeader shouldShowSettingsButton={false} />
      {isPreparingAdaptiveHistory ? (
        <View className="flex-1" />
      ) : currentQuestion === null || isComplete ? (
        <TrainingSessionComplete
          onBackPress={handleBackPress}
          onPlayAgainPress={restartQuizz}
          score={score}
        />
      ) : (
        <TrainingSessionQuestionContent
          answerDifficulty={quizzOptions.answerDifficulty}
          answerRegion={answerRegion}
          currentQuestion={currentQuestion}
          currentQuestionKey={currentQuestionKey}
          isInfiniteMode={isInfiniteModeSession}
          onAnswerSubmit={handleAnswerSubmit}
          progress={progress}
          score={score}
        />
      )}
    </View>
  );
}

interface TrainingSessionQuestionContentProps {
  answerDifficulty: AnswerDifficulty;
  answerRegion: MapRegionName;
  currentQuestion: QuizzCurrentQuestion;
  currentQuestionKey: string;
  isInfiniteMode: boolean;
  onAnswerSubmit: (answer: QuizzAnswerSubmission) => void;
  progress: number;
  score: QuizzScore;
}

function TrainingSessionQuestionContent({
  answerDifficulty,
  answerRegion,
  currentQuestion,
  currentQuestionKey,
  isInfiniteMode,
  onAnswerSubmit,
  progress,
  score,
}: TrainingSessionQuestionContentProps) {
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
        <PageContent className="gap-4 px-6 pb-8 pt-4">
          <TrainingSessionQuestionBlocks
            answerDifficulty={answerDifficulty}
            answerRegion={answerRegion}
            currentQuestion={currentQuestion}
            isInfiniteMode={isInfiniteMode}
            onAnswerSubmit={onAnswerSubmit}
            progress={progress}
            score={score}
          />
        </PageContent>
      </ScrollView>
    );
  }

  return (
    <KeyboardAwareScrollView
      key={currentQuestionKey}
      alwaysBounceVertical={false}
      bottomOffset={TRAINING_SESSION_KEYBOARD_BOTTOM_OFFSET}
      className="flex-1"
      keyboardShouldPersistTaps="always"
    >
      <PageContent className="gap-4 px-6 pb-8 pt-4">
        <TrainingSessionQuestionBlocks
          answerDifficulty={answerDifficulty}
          answerRegion={answerRegion}
          currentQuestion={currentQuestion}
          isInfiniteMode={isInfiniteMode}
          onAnswerSubmit={onAnswerSubmit}
          progress={progress}
          score={score}
        />
      </PageContent>
    </KeyboardAwareScrollView>
  );
}

interface TrainingSessionQuestionBlocksProps {
  answerDifficulty: AnswerDifficulty;
  answerRegion: MapRegionName;
  currentQuestion: QuizzCurrentQuestion;
  isInfiniteMode: boolean;
  onAnswerSubmit: (answer: QuizzAnswerSubmission) => void;
  progress: number;
  score: QuizzScore;
}

function TrainingSessionQuestionBlocks({
  answerDifficulty,
  answerRegion,
  currentQuestion,
  isInfiniteMode,
  onAnswerSubmit,
  progress,
  score,
}: TrainingSessionQuestionBlocksProps) {
  const handleAnswerResolved = useCallback(
    ({ isCorrectAnswer }: QuizzAnswerResolution) => {
      void recordPracticeResult({
        answerFormat: currentQuestion.answerFormat,
        countryCode: currentQuestion.countryCode,
        isCorrectAnswer,
        questionFormat: currentQuestion.questionFormat,
      }).catch((error: unknown) => {
        console.error("Failed to record Practice Result", error);
      });
    },
    [
      currentQuestion.answerFormat,
      currentQuestion.countryCode,
      currentQuestion.questionFormat,
    ],
  );

  return (
    <>
      <TrainingSessionScorePanel
        isInfiniteMode={isInfiniteMode}
        progress={progress}
        score={score}
      />
      <QuizzQuestionCard
        answerDifficulty={answerDifficulty}
        answerFormat={currentQuestion.answerFormat}
        answerRegion={answerRegion}
        country={currentQuestion.country}
        onAnswerResolved={handleAnswerResolved}
        onAnswerSubmit={onAnswerSubmit}
        questionFormat={currentQuestion.questionFormat}
      />
    </>
  );
}

interface TrainingSessionScorePanelProps {
  isInfiniteMode: boolean;
  progress: number;
  score: QuizzScore;
}

function TrainingSessionScorePanel({
  isInfiniteMode,
  progress,
  score,
}: TrainingSessionScorePanelProps) {
  const { t } = useTranslation();
  const progressValue = Math.min(Math.max(progress, 0), 1);
  const remainingProgressValue = 1 - progressValue;
  const isStreakVisible = isInfiniteMode || score.currentStreak >= 5;

  return (
    <Surface variant="secondary" className="gap-4">
      <View className="flex-row items-center justify-between gap-4">
        <Text type="h4">{t("train.session.score.title")}</Text>
        {isInfiniteMode ? (
          <View className="flex-row items-center gap-1.5 rounded-full bg-surface-tertiary px-2 py-1">
            <ThemedIcon
              icon={InfinityIcon}
              size={14}
              colorClassName="text-muted"
            />
            <Text type="body-xs" color="muted">
              {t("train.session.score.infinite-mode")}
            </Text>
          </View>
        ) : (
          <Text type="body-sm" color="muted">
            {t("train.session.score.progress", {
              answered: score.answeredQuestions,
              total: score.totalQuestions,
            })}
          </Text>
        )}
      </View>
      {!isInfiniteMode && (
        <View className="h-2 flex-row overflow-hidden rounded-full bg-default">
          <View
            className="h-full rounded-full bg-accent"
            style={{ flex: progressValue }}
          />
          <View style={{ flex: remainingProgressValue }} />
        </View>
      )}
      <View className="flex-row gap-1.5">
        <TrainingSessionScorePill
          colorClassName="text-success"
          icon={CheckCircle2}
          label={t("train.session.score.correct")}
          value={score.correctAnswers}
        />
        <TrainingSessionScorePill
          colorClassName="text-danger"
          icon={CircleX}
          label={t("train.session.score.wrong")}
          value={score.wrongAnswers}
        />
        <TrainingSessionScorePill
          icon={ListChecks}
          label={
            isInfiniteMode
              ? t("train.session.score.questions")
              : t("train.session.score.remaining")
          }
          value={
            isInfiniteMode ? score.answeredQuestions : score.remainingQuestions
          }
        />
        {isStreakVisible && (
          <TrainingSessionScorePill
            color={getStreakColor(score.currentStreak)}
            icon={Flame}
            label={t("train.session.score.streak")}
            value={score.currentStreak}
          />
        )}
      </View>
    </Surface>
  );
}

interface TrainingSessionScorePillProps {
  color?: string;
  colorClassName?: string;
  icon: LucideIcon;
  label: string;
  value: number;
}

function TrainingSessionScorePill({
  color,
  colorClassName,
  icon,
  label,
  value,
}: TrainingSessionScorePillProps) {
  return (
    <View className="min-w-0 flex-1 rounded-lg bg-surface-tertiary px-2 py-1.5">
      <View className="min-w-0 flex-row items-center gap-1">
        <ThemedIcon
          color={color}
          colorClassName={colorClassName}
          icon={icon}
          size={14}
        />
        <Text
          type="body-xs"
          color="muted"
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.8}
          className="min-w-0 flex-1 text-[10px] leading-4"
        >
          {label}
        </Text>
      </View>
      <Text
        type="h5"
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.8}
        className="leading-6"
      >
        {value}
      </Text>
    </View>
  );
}

function getStreakColor(streak: number) {
  if (streak >= 50) {
    return "#3b82f6";
  }

  if (streak >= 20) {
    return "#ef4444";
  }

  if (streak >= 10) {
    return "#f97316";
  }

  if (streak >= 5) {
    return "#eab308";
  }

  return undefined;
}

interface TrainingSessionCompleteProps {
  onBackPress: () => void;
  onPlayAgainPress: () => void;
  score: QuizzScore;
}

function TrainingSessionComplete({
  onBackPress,
  onPlayAgainPress,
  score,
}: TrainingSessionCompleteProps) {
  const { t } = useTranslation();

  return (
    <ScrollView className="flex-1">
      <PageContent className="gap-5 px-6 pb-8 pt-8">
        <Surface variant="secondary" className="gap-5">
          <View className="gap-2">
            <Text type="h2" align="center">
              {t("train.session.complete.title")}
            </Text>
            <Text type="body" color="muted" align="center">
              {t("train.session.complete.description", {
                bestStreak: score.bestStreak,
                correct: score.correctAnswers,
                total: score.totalQuestions,
                wrong: score.wrongAnswers,
              })}
            </Text>
          </View>
          <View className="flex-row gap-1.5">
            <TrainingSessionScorePill
              colorClassName="text-success"
              icon={CheckCircle2}
              label={t("train.session.score.correct")}
              value={score.correctAnswers}
            />
            <TrainingSessionScorePill
              colorClassName="text-danger"
              icon={CircleX}
              label={t("train.session.score.wrong")}
              value={score.wrongAnswers}
            />
            <TrainingSessionScorePill
              color={getStreakColor(score.bestStreak)}
              icon={Flame}
              label={t("train.session.score.best-streak")}
              value={score.bestStreak}
            />
          </View>
        </Surface>
        <View className="gap-3">
          <HapticButton onPress={onPlayAgainPress} variant="primary">
            <ThemedIcon
              colorClassName="text-accent-foreground"
              icon={RotateCcw}
              size={18}
            />
            <HapticButton.Label>
              {t("train.session.complete.play-again")}
            </HapticButton.Label>
          </HapticButton>
          <HapticButton onPress={onBackPress} variant="tertiary">
            <ThemedIcon icon={ArrowLeft} size={18} />
            <HapticButton.Label>
              {t("train.session.complete.back")}
            </HapticButton.Label>
          </HapticButton>
        </View>
      </PageContent>
    </ScrollView>
  );
}
