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
import { useCallback, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";

import type { MapRegionName } from "@geopoto/geo-data";

import { HapticButton } from "@/components/haptic-button";
import { PageContent } from "@/components/page-content";
import { QuizzQuestionCard } from "@/modules/quizz/components/quizz-question-card";
import type { QuizzAnswerResolution } from "@/modules/quizz/components/quizz-question-card";
import {
  useQuizz,
  type QuizzAnswerSubmission,
  type QuizzCurrentQuestion,
  type QuizzScore,
} from "@/modules/quizz/hooks/use-quizz";
import type {
  AnswerDifficulty,
  QuizzOptions,
} from "@/modules/quizz/utils/quizz";
import { KeyboardAwareScrollView } from "@/services/keyboard/keyboard-aware-scroll-view";
import { useNavigationConfirm } from "@/services/navigation-confirm/use-navigation-confirm";
import { ThemedIcon } from "@/services/theme/themed-icon";

const DAILY_TEST_KEYBOARD_BOTTOM_OFFSET = 128;

interface DailyTestRunnerProps {
  area: MapRegionName;
  onComplete: (resolution: DailyTestResolution) => void;
  onRecordAnswer: (resolution: DailyTestAnswerRecord) => void;
  options: QuizzOptions;
}

export interface DailyTestResolution {
  correctCount: number;
  totalCount: number;
}

export interface DailyTestAnswerRecord {
  answerFormat: QuizzCurrentQuestion["answerFormat"];
  countryCode: string;
  isCorrectAnswer: boolean;
  questionFormat: QuizzCurrentQuestion["questionFormat"];
}

/**
 * Runs the current lesson's finite, all-countries Daily Test through the shared
 * `useQuizz` engine and `QuizzQuestionCard` UI. The options are passed without an
 * explicit `questions` array so `createQuizz` expands to exactly one question per
 * country in the Area; this also keeps `restartQuizz` reshuffling available for
 * the Practice slice (issue 005).
 *
 * Abandoning mid-run (navigating away before the single graded attempt finishes)
 * records no day attempt, so the once-per-UTC-day gate stays open. Completion is
 * reported exactly once to the parent, which owns the snapshot mutation.
 */
export function DailyTestRunner({
  area,
  onComplete,
  onRecordAnswer,
  options,
}: DailyTestRunnerProps) {
  const { t } = useTranslation();
  const {
    currentQuestion,
    isComplete,
    isPreparingAdaptiveHistory,
    progress,
    score,
    submitAnswer,
  } = useQuizz({ options });
  const hasReportedCompletionRef = useRef(false);
  // A session with no questions is the transient state where the adaptive history
  // just finished loading but the question set has not been regenerated yet. It is
  // never a real completion, so it must not be treated as a finished test.
  const isSessionFinished =
    !isPreparingAdaptiveHistory &&
    score.totalQuestions > 0 &&
    (isComplete || currentQuestion === null);
  const currentQuestionKey =
    currentQuestion === null
      ? "complete"
      : [
          score.answeredQuestions,
          currentQuestion.countryCode,
          currentQuestion.questionFormat,
          currentQuestion.answerFormat,
          options.answerDifficulty,
        ].join(":");

  useNavigationConfirm({
    cancelLabel: t(
      "training-program.active.daily-test.leave-confirm.cancel-label",
    ),
    confirmLabel: t(
      "training-program.active.daily-test.leave-confirm.confirm-label",
    ),
    description: t(
      "training-program.active.daily-test.leave-confirm.description",
    ),
    isDisabled: isSessionFinished,
    title: t("training-program.active.daily-test.leave-confirm.title"),
  });

  useEffect(() => {
    if (!isSessionFinished || hasReportedCompletionRef.current) {
      return;
    }

    hasReportedCompletionRef.current = true;
    onComplete({
      correctCount: score.correctAnswers,
      totalCount: score.totalQuestions,
    });
  }, [
    isSessionFinished,
    onComplete,
    score.correctAnswers,
    score.totalQuestions,
  ]);

  const handleAnswerSubmit = useCallback(
    (answer: QuizzAnswerSubmission) => {
      submitAnswer({ answer });
    },
    [submitAnswer],
  );

  if (
    isPreparingAdaptiveHistory ||
    isSessionFinished ||
    currentQuestion === null
  ) {
    return <View className="flex-1" />;
  }

  return (
    <LessonQuizzQuestionContent
      answerDifficulty={options.answerDifficulty}
      answerRegion={area}
      currentQuestion={currentQuestion}
      currentQuestionKey={currentQuestionKey}
      onAnswerSubmit={handleAnswerSubmit}
      onRecordAnswer={onRecordAnswer}
      progress={progress}
      score={score}
      scoreTitle={t("training-program.active.daily-test.score.title")}
    />
  );
}

interface LessonQuizzQuestionContentProps {
  answerDifficulty: AnswerDifficulty;
  answerRegion: MapRegionName;
  currentQuestion: QuizzCurrentQuestion;
  currentQuestionKey: string;
  onAnswerSubmit: (answer: QuizzAnswerSubmission) => void;
  onRecordAnswer: (resolution: DailyTestAnswerRecord) => void;
  progress: number;
  score: QuizzScore;
  scoreTitle: string;
}

function LessonQuizzQuestionContent({
  answerDifficulty,
  answerRegion,
  currentQuestion,
  currentQuestionKey,
  onAnswerSubmit,
  onRecordAnswer,
  progress,
  score,
  scoreTitle,
}: LessonQuizzQuestionContentProps) {
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
          <LessonQuizzQuestionBlocks
            answerDifficulty={answerDifficulty}
            answerRegion={answerRegion}
            currentQuestion={currentQuestion}
            onAnswerSubmit={onAnswerSubmit}
            onRecordAnswer={onRecordAnswer}
            progress={progress}
            score={score}
            scoreTitle={scoreTitle}
          />
        </PageContent>
      </ScrollView>
    );
  }

  return (
    <KeyboardAwareScrollView
      key={currentQuestionKey}
      alwaysBounceVertical={false}
      bottomOffset={DAILY_TEST_KEYBOARD_BOTTOM_OFFSET}
      className="flex-1"
      keyboardShouldPersistTaps="always"
    >
      <PageContent className="gap-5 px-6 pb-8 pt-4">
        <LessonQuizzQuestionBlocks
          answerDifficulty={answerDifficulty}
          answerRegion={answerRegion}
          currentQuestion={currentQuestion}
          onAnswerSubmit={onAnswerSubmit}
          onRecordAnswer={onRecordAnswer}
          progress={progress}
          score={score}
          scoreTitle={scoreTitle}
        />
      </PageContent>
    </KeyboardAwareScrollView>
  );
}

interface LessonQuizzQuestionBlocksProps {
  answerDifficulty: AnswerDifficulty;
  answerRegion: MapRegionName;
  currentQuestion: QuizzCurrentQuestion;
  onAnswerSubmit: (answer: QuizzAnswerSubmission) => void;
  onRecordAnswer: (resolution: DailyTestAnswerRecord) => void;
  progress: number;
  score: QuizzScore;
  scoreTitle: string;
}

function LessonQuizzQuestionBlocks({
  answerDifficulty,
  answerRegion,
  currentQuestion,
  onAnswerSubmit,
  onRecordAnswer,
  progress,
  score,
  scoreTitle,
}: LessonQuizzQuestionBlocksProps) {
  const handleAnswerResolved = useCallback(
    ({ isCorrectAnswer }: QuizzAnswerResolution) => {
      onRecordAnswer({
        answerFormat: currentQuestion.answerFormat,
        countryCode: currentQuestion.countryCode,
        isCorrectAnswer,
        questionFormat: currentQuestion.questionFormat,
      });
    },
    [
      currentQuestion.answerFormat,
      currentQuestion.countryCode,
      currentQuestion.questionFormat,
      onRecordAnswer,
    ],
  );

  return (
    <>
      <LessonQuizzScorePanel
        progress={progress}
        score={score}
        scoreTitle={scoreTitle}
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

interface LessonQuizzScorePanelProps {
  progress: number;
  score: QuizzScore;
  scoreTitle: string;
}

function LessonQuizzScorePanel({
  progress,
  score,
  scoreTitle,
}: LessonQuizzScorePanelProps) {
  const { t } = useTranslation();
  const progressValue = Math.min(Math.max(progress, 0), 1);
  const remainingProgressValue = 1 - progressValue;

  return (
    <Surface variant="secondary" className="gap-4">
      <View className="flex-row items-center justify-between gap-4">
        <Text type="h4">{scoreTitle}</Text>
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
      <View className="flex-row gap-1.5">
        <LessonQuizzScorePill
          colorClassName="text-success"
          icon={CheckCircle2}
          label={t("train.session.score.correct")}
          value={score.correctAnswers}
        />
        <LessonQuizzScorePill
          colorClassName="text-danger"
          icon={CircleX}
          label={t("train.session.score.wrong")}
          value={score.wrongAnswers}
        />
        <LessonQuizzScorePill
          icon={ListChecks}
          label={t("train.session.score.remaining")}
          value={score.remainingQuestions}
        />
        <LessonQuizzScorePill
          icon={Flame}
          label={t("train.session.score.streak")}
          value={score.currentStreak}
        />
      </View>
    </Surface>
  );
}

interface LessonQuizzScorePillProps {
  colorClassName?: string;
  icon: LucideIcon;
  label: string;
  value: number;
}

function LessonQuizzScorePill({
  colorClassName,
  icon,
  label,
  value,
}: LessonQuizzScorePillProps) {
  return (
    <View className="min-w-0 flex-1 rounded-lg bg-surface-tertiary px-2 py-1.5">
      <View className="min-w-0 flex-row items-center gap-1">
        <ThemedIcon colorClassName={colorClassName} icon={icon} size={14} />
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

interface DailyTestCompleteProps {
  hasPassed: boolean;
  onBackPress: () => void;
  score: DailyTestResolution;
}

export function DailyTestComplete({
  hasPassed,
  onBackPress,
  score,
}: DailyTestCompleteProps) {
  const { t } = useTranslation();
  const resultMessage = hasPassed
    ? t("training-program.active.daily-test.result.pass")
    : t("training-program.active.daily-test.result.fail");

  return (
    <ScrollView className="flex-1">
      <PageContent className="gap-5 px-6 pb-8 pt-8">
        <Surface variant="secondary" className="gap-5">
          <View className="gap-2">
            <Text type="h2" align="center">
              {t("training-program.active.daily-test.result.title")}
            </Text>
            <Text type="body" color="muted" align="center">
              {resultMessage}
            </Text>
            <Text type="body-sm" color="muted" align="center">
              {t("training-program.active.daily-test.result.score", {
                correct: score.correctCount,
                total: score.totalCount,
              })}
            </Text>
          </View>
        </Surface>
        <HapticButton onPress={onBackPress} variant="primary">
          <HapticButton.Label>
            {t("training-program.active.daily-test.result.back")}
          </HapticButton.Label>
        </HapticButton>
      </PageContent>
    </ScrollView>
  );
}

interface PracticeRunnerProps {
  area: MapRegionName;
  onBackPress: () => void;
  onRecordAnswer: (resolution: DailyTestAnswerRecord) => void;
  options: QuizzOptions;
}

/**
 * Runs the current lesson's finite, all-countries quiz as ungated Practice. It
 * reuses the same shared question content and `useQuizz` engine as the Daily Test
 * (driven by `options` only, so each run reshuffles), but skips all gating: on
 * completion it shows the score with a "Réessayer" action that regenerates a
 * fresh run via `restartQuizz`, and never reports a graded attempt. Every
 * resolved answer is still forwarded via `onRecordAnswer`, exactly like the Daily
 * Test, so program stats and the global Adaptive History stay updated.
 */
export function PracticeRunner({
  area,
  onBackPress,
  onRecordAnswer,
  options,
}: PracticeRunnerProps) {
  const { t } = useTranslation();
  const {
    currentQuestion,
    isComplete,
    isPreparingAdaptiveHistory,
    progress,
    restartQuizz,
    score,
    submitAnswer,
  } = useQuizz({ options });
  // See `DailyTestRunner`: a zero-question session is the transient adaptive-history
  // reload state, not a finished run, so it must not show the completion screen.
  const isSessionFinished =
    !isPreparingAdaptiveHistory &&
    score.totalQuestions > 0 &&
    (isComplete || currentQuestion === null);
  const currentQuestionKey =
    currentQuestion === null
      ? "complete"
      : [
          score.answeredQuestions,
          currentQuestion.countryCode,
          currentQuestion.questionFormat,
          currentQuestion.answerFormat,
          options.answerDifficulty,
        ].join(":");

  const handleAnswerSubmit = useCallback(
    (answer: QuizzAnswerSubmission) => {
      submitAnswer({ answer });
    },
    [submitAnswer],
  );

  if (isPreparingAdaptiveHistory) {
    return <View className="flex-1" />;
  }

  if (isSessionFinished) {
    return (
      <PracticeComplete
        onBackPress={onBackPress}
        onRetryPress={restartQuizz}
        score={score}
      />
    );
  }

  if (currentQuestion === null) {
    return <View className="flex-1" />;
  }

  return (
    <LessonQuizzQuestionContent
      answerDifficulty={options.answerDifficulty}
      answerRegion={area}
      currentQuestion={currentQuestion}
      currentQuestionKey={currentQuestionKey}
      onAnswerSubmit={handleAnswerSubmit}
      onRecordAnswer={onRecordAnswer}
      progress={progress}
      score={score}
      scoreTitle={t("training-program.active.practice.score.title")}
    />
  );
}

interface PracticeCompleteProps {
  onBackPress: () => void;
  onRetryPress: () => void;
  score: QuizzScore;
}

function PracticeComplete({
  onBackPress,
  onRetryPress,
  score,
}: PracticeCompleteProps) {
  const { t } = useTranslation();

  return (
    <ScrollView className="flex-1">
      <PageContent className="gap-5 px-6 pb-8 pt-8">
        <Surface variant="secondary" className="gap-5">
          <View className="gap-2">
            <Text type="h2" align="center">
              {t("training-program.active.practice.complete.title")}
            </Text>
            <Text type="body" color="muted" align="center">
              {t("training-program.active.practice.complete.description", {
                bestStreak: score.bestStreak,
                correct: score.correctAnswers,
                total: score.totalQuestions,
                wrong: score.wrongAnswers,
              })}
            </Text>
          </View>
          <View className="flex-row gap-1.5">
            <LessonQuizzScorePill
              colorClassName="text-success"
              icon={CheckCircle2}
              label={t("train.session.score.correct")}
              value={score.correctAnswers}
            />
            <LessonQuizzScorePill
              colorClassName="text-danger"
              icon={CircleX}
              label={t("train.session.score.wrong")}
              value={score.wrongAnswers}
            />
            <LessonQuizzScorePill
              icon={Flame}
              label={t("train.session.score.best-streak")}
              value={score.bestStreak}
            />
          </View>
        </Surface>
        <View className="gap-3">
          <HapticButton onPress={onRetryPress} variant="primary">
            <ThemedIcon
              colorClassName="text-accent-foreground"
              icon={RotateCcw}
              size={18}
            />
            <HapticButton.Label>
              {t("training-program.active.practice.complete.retry")}
            </HapticButton.Label>
          </HapticButton>
          <HapticButton onPress={onBackPress} variant="tertiary">
            <ThemedIcon icon={ArrowLeft} size={18} />
            <HapticButton.Label>
              {t("training-program.active.practice.complete.back")}
            </HapticButton.Label>
          </HapticButton>
        </View>
      </PageContent>
    </ScrollView>
  );
}
