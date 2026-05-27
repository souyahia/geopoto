import { useLocalSearchParams, useRouter } from "expo-router";
import { Surface } from "heroui-native/surface";
import { Text } from "heroui-native/text";
import {
  ArrowLeft,
  CheckCircle2,
  CircleX,
  Flame,
  ListChecks,
  RotateCcw,
  type LucideIcon,
} from "lucide-react-native";
import { useCallback, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";

import type { MapRegionName } from "@geopoto/geo-data";

import { HapticButton } from "@/components/haptic-button";
import { KeyboardAwareScrollView } from "@/services/keyboard/keyboard-aware-scroll-view";
import { useNavigationConfirm } from "@/services/navigation-confirm/use-navigation-confirm";
import { ThemedIcon } from "@/services/theme/themed-icon";

import { QuizzQuestionCard } from "../components/quizz-question-card";
import { TrainHeader } from "../components/train-header";
import {
  useQuizz,
  type QuizzCurrentQuestion,
  type QuizzScore,
  type QuizzAnswerSubmission,
} from "../hooks/use-quizz";
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
    progress,
    restartQuizz,
    score,
    submitAnswer,
  } = useQuizz({ options: quizzOptions });
  const isSessionFinished = isComplete || currentQuestion === null;
  const currentQuestionKey =
    currentQuestion === null
      ? "complete"
      : [
          score.answeredQuestions,
          currentQuestion.countryCode,
          currentQuestion.questionFormat,
          currentQuestion.answerFormat,
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
      {isSessionFinished ? (
        <TrainingSessionComplete
          onBackPress={handleBackPress}
          onPlayAgainPress={restartQuizz}
          score={score}
        />
      ) : (
        <TrainingSessionQuestionContent
          answerRegion={answerRegion}
          currentQuestion={currentQuestion}
          currentQuestionKey={currentQuestionKey}
          onAnswerSubmit={handleAnswerSubmit}
          progress={progress}
          score={score}
        />
      )}
    </View>
  );
}

interface TrainingSessionQuestionContentProps {
  answerRegion: MapRegionName;
  currentQuestion: QuizzCurrentQuestion;
  currentQuestionKey: string;
  onAnswerSubmit: (answer: QuizzAnswerSubmission) => void;
  progress: number;
  score: QuizzScore;
}

function TrainingSessionQuestionContent({
  answerRegion,
  currentQuestion,
  currentQuestionKey,
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
        <View className="gap-5 px-6 pb-8 pt-4">
          <TrainingSessionQuestionBlocks
            answerRegion={answerRegion}
            currentQuestion={currentQuestion}
            onAnswerSubmit={onAnswerSubmit}
            progress={progress}
            score={score}
          />
        </View>
      </ScrollView>
    );
  }

  return (
    <KeyboardAwareScrollView
      key={currentQuestionKey}
      alwaysBounceVertical={false}
      bottomOffset={TRAINING_SESSION_KEYBOARD_BOTTOM_OFFSET}
      className="flex-1"
      contentContainerClassName="gap-5 px-6 pb-8 pt-4"
      keyboardShouldPersistTaps="handled"
    >
      <TrainingSessionQuestionBlocks
        answerRegion={answerRegion}
        currentQuestion={currentQuestion}
        onAnswerSubmit={onAnswerSubmit}
        progress={progress}
        score={score}
      />
    </KeyboardAwareScrollView>
  );
}

interface TrainingSessionQuestionBlocksProps {
  answerRegion: MapRegionName;
  currentQuestion: QuizzCurrentQuestion;
  onAnswerSubmit: (answer: QuizzAnswerSubmission) => void;
  progress: number;
  score: QuizzScore;
}

function TrainingSessionQuestionBlocks({
  answerRegion,
  currentQuestion,
  onAnswerSubmit,
  progress,
  score,
}: TrainingSessionQuestionBlocksProps) {
  return (
    <>
      <TrainingSessionScorePanel progress={progress} score={score} />
      <QuizzQuestionCard
        answerFormat={currentQuestion.answerFormat}
        answerRegion={answerRegion}
        country={currentQuestion.country}
        onAnswerSubmit={onAnswerSubmit}
        questionFormat={currentQuestion.questionFormat}
      />
    </>
  );
}

interface TrainingSessionScorePanelProps {
  progress: number;
  score: QuizzScore;
}

function TrainingSessionScorePanel({
  progress,
  score,
}: TrainingSessionScorePanelProps) {
  const { t } = useTranslation();
  const progressValue = Math.min(Math.max(progress, 0), 1);
  const remainingProgressValue = 1 - progressValue;
  const isStreakVisible = score.currentStreak >= 5;

  return (
    <Surface variant="secondary" className="gap-4">
      <View className="flex-row items-center justify-between gap-4">
        <Text type="h4">{t("train.session.score.title")}</Text>
        <Text type="body-sm" color="muted">
          {t("train.session.score.progress", {
            answered: score.answeredQuestions,
            total: score.totalQuestions,
          })}
        </Text>
      </View>
      <View className="h-2 flex-row overflow-hidden rounded-full bg-default">
        <View
          className="h-full rounded-full bg-accent"
          style={{ flex: progressValue }}
        />
        <View style={{ flex: remainingProgressValue }} />
      </View>
      <View className="flex-row flex-wrap gap-2">
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
          label={t("train.session.score.remaining")}
          value={score.remainingQuestions}
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
    <View className="min-w-24 flex-1 rounded-lg bg-surface-tertiary px-3 py-2">
      <View className="flex-row items-center gap-2">
        <ThemedIcon
          color={color}
          colorClassName={colorClassName}
          icon={icon}
          size={16}
        />
        <Text type="body-xs" color="muted" numberOfLines={1}>
          {label}
        </Text>
      </View>
      <Text type="h3">{value}</Text>
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
      <View className="gap-5 px-6 pb-8 pt-8">
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
          <View className="flex-row flex-wrap gap-2">
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
          <HapticButton onPress={onBackPress} variant="secondary">
            <ThemedIcon icon={ArrowLeft} size={18} />
            <HapticButton.Label>
              {t("train.session.complete.back")}
            </HapticButton.Label>
          </HapticButton>
        </View>
      </View>
    </ScrollView>
  );
}
