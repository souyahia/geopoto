import type { TrainingProgramSnapshot } from "./training-program";
import { TRAINING_PROGRAM_LESSON_COUNT } from "./training-program-lessons";

export interface HardestCountry {
  accuracy: number;
  countryCode: string;
  wrong: number;
}

interface GetPassedLessonsParams {
  snapshot: TrainingProgramSnapshot;
}

/**
 * Derived, never stored. While Active, `passedLessons = currentLesson - 1` (a
 * fresh program at lesson 1 has 0 passed lessons). When Completed it is the full
 * lesson count.
 */
export function getPassedLessons({ snapshot }: GetPassedLessonsParams): number {
  if (snapshot.status === "completed") {
    return TRAINING_PROGRAM_LESSON_COUNT;
  }

  return snapshot.currentLesson - 1;
}

interface GetProgressRatioParams {
  snapshot: TrainingProgramSnapshot;
}

/**
 * Progress as a ratio in [0, 1] (`passedLessons / TRAINING_PROGRAM_LESSON_COUNT`).
 * 0 when fresh, 1 when Completed.
 */
export function getProgressRatio({ snapshot }: GetProgressRatioParams): number {
  return getPassedLessons({ snapshot }) / TRAINING_PROGRAM_LESSON_COUNT;
}

interface GetAccuracyParams {
  snapshot: TrainingProgramSnapshot;
}

/**
 * Overall accuracy `correct / (correct + wrong)` across all program answers.
 * Returns 0 when there are no answers yet.
 */
export function getAccuracy({ snapshot }: GetAccuracyParams): number {
  const totalCount = snapshot.correctCount + snapshot.wrongCount;

  if (totalCount <= 0) {
    return 0;
  }

  return snapshot.correctCount / totalCount;
}

interface GetHardestCountryParams {
  snapshot: TrainingProgramSnapshot;
}

/**
 * The country with the most wrong answers, tie-broken by lowest accuracy.
 * Returns undefined (empty-state safe) when no wrong answer has been recorded.
 */
export function getHardestCountry({
  snapshot,
}: GetHardestCountryParams): HardestCountry | undefined {
  return Object.entries(snapshot.perCountry).reduce<HardestCountry | undefined>(
    (hardestCountry, [countryCode, stats]) => {
      if (stats.wrong <= 0) {
        return hardestCountry;
      }

      const candidate: HardestCountry = {
        accuracy: getCountryAccuracy({ stats }),
        countryCode,
        wrong: stats.wrong,
      };

      if (hardestCountry === undefined) {
        return candidate;
      }

      return getHarderCountry({ candidate, current: hardestCountry });
    },
    undefined,
  );
}

interface GetCountryAccuracyParams {
  stats: { correct: number; wrong: number };
}

function getCountryAccuracy({ stats }: GetCountryAccuracyParams): number {
  const totalCount = stats.correct + stats.wrong;

  if (totalCount <= 0) {
    return 0;
  }

  return stats.correct / totalCount;
}

interface GetHarderCountryParams {
  candidate: HardestCountry;
  current: HardestCountry;
}

function getHarderCountry({
  candidate,
  current,
}: GetHarderCountryParams): HardestCountry {
  if (candidate.wrong > current.wrong) {
    return candidate;
  }

  if (candidate.wrong < current.wrong) {
    return current;
  }

  if (candidate.accuracy < current.accuracy) {
    return candidate;
  }

  return current;
}
