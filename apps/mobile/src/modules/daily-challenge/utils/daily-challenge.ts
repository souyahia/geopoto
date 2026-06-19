import { COUNTRIES, type Country } from "@geopoto/geo-data";

import {
  QUIZZ_ANSWER_FORMATS,
  QUIZZ_FORMATS,
  type QuizzFormat,
  type QuizzOptions,
  type QuizzQuestion,
} from "@/modules/quizz/utils/quizz";
import { getUtcDateKey, getUtcDayIndex } from "@/utils/dates";

const DAILY_CHALLENGE_SEED_NAMESPACE = "geopoto-daily-challenge-v1";

export const DAILY_CHALLENGE_QUIZZ_OPTIONS = {
  acceptedAnswerFormats: QUIZZ_ANSWER_FORMATS,
  acceptedQuestionFormats: QUIZZ_FORMATS,
  answerDifficulty: "hard",
  isInfiniteMode: false,
  regions: ["world"],
} satisfies QuizzOptions;

export interface DailyChallenge {
  dateKey: string;
  dayIndex: number;
  options: QuizzOptions;
  question: QuizzQuestion;
}

interface GetDailyChallengeParams {
  now?: Date;
}

export function getDailyChallenge({
  now = new Date(),
}: GetDailyChallengeParams = {}): DailyChallenge {
  const dateKey = getUtcDateKey({ date: now });
  const dayIndex = getUtcDayIndex({ date: now });
  const questionFormat = pickDailyValue({
    items: QUIZZ_FORMATS,
    seed: getDailyChallengeSeed({ dateKey, scope: "question-format" }),
  });
  const answerFormat = pickDailyValue({
    items: getCompatibleDailyAnswerFormats({ questionFormat }),
    seed: getDailyChallengeSeed({ dateKey, scope: "answer-format" }),
  });
  const country = pickDailyValue({
    items: getDailyChallengeCountries(),
    seed: getDailyChallengeSeed({ dateKey, scope: "country" }),
  });

  return {
    dateKey,
    dayIndex,
    options: DAILY_CHALLENGE_QUIZZ_OPTIONS,
    question: {
      answerFormat,
      countryCode: country.code,
      questionFormat,
    },
  };
}

interface GetCompatibleDailyAnswerFormatsParams {
  questionFormat: QuizzFormat;
}

function getCompatibleDailyAnswerFormats({
  questionFormat,
}: GetCompatibleDailyAnswerFormatsParams): readonly QuizzFormat[] {
  return QUIZZ_ANSWER_FORMATS.filter(
    (answerFormat) => answerFormat !== questionFormat,
  );
}

function getDailyChallengeCountries(): readonly Country[] {
  return COUNTRIES.filter((country) => country.regions.includes("world"))
    .slice()
    .sort((leftCountry, rightCountry) =>
      leftCountry.code.localeCompare(rightCountry.code),
    );
}

interface GetDailyChallengeSeedParams {
  dateKey: string;
  scope: string;
}

function getDailyChallengeSeed({
  dateKey,
  scope,
}: GetDailyChallengeSeedParams): string {
  return `${DAILY_CHALLENGE_SEED_NAMESPACE}:${dateKey}:${scope}`;
}

interface PickDailyValueParams<T> {
  items: readonly T[];
  seed: string;
}

function pickDailyValue<T>({ items, seed }: PickDailyValueParams<T>): T {
  const selectedIndex = hashStringToUint32({ value: seed }) % items.length;
  const selectedItem = items.at(selectedIndex);

  if (selectedItem === undefined) {
    throw new Error("Daily challenge cannot be created from an empty list");
  }

  return selectedItem;
}

interface HashStringToUint32Params {
  value: string;
}

function hashStringToUint32({ value }: HashStringToUint32Params): number {
  return value.split("").reduce((hash, character) => {
    const mixedHash = hash ^ character.charCodeAt(0);

    return Math.imul(mixedHash, 16_777_619) >>> 0;
  }, 2_166_136_261);
}
