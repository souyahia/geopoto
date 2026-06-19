import type { MapRegionName } from "@geopoto/geo-data";

import {
  QUIZZ_ANSWER_FORMATS,
  QUIZZ_FORMATS,
  type AnswerDifficulty,
  type QuizzFormat,
  type QuizzOptions,
} from "@/modules/quizz/utils/quizz";

export interface LessonTemplate {
  lessonNumber: number;
  acceptedQuestionFormats: readonly QuizzFormat[];
  acceptedAnswerFormats: readonly QuizzFormat[];
  answerDifficulty: AnswerDifficulty;
}

export const TRAINING_PROGRAM_LESSON_COUNT = 10;

/**
 * Fixed, global, ordered set of lesson templates applied to every Area.
 *
 * `answerDifficulty` controls the answer-collection method (easy = assisted,
 * hard = free text / harder map tap). It is n/a for `country-position` answers,
 * so lessons whose answer is a map position (lessons 4 and 6) use an arbitrary
 * but harmless value the engine ignores.
 */
export const LESSON_TEMPLATES = [
  {
    lessonNumber: 1,
    acceptedQuestionFormats: ["country-position"],
    acceptedAnswerFormats: ["country-name"],
    answerDifficulty: "easy",
  },
  {
    lessonNumber: 2,
    acceptedQuestionFormats: ["country-flag"],
    acceptedAnswerFormats: ["country-name"],
    answerDifficulty: "easy",
  },
  {
    lessonNumber: 3,
    acceptedQuestionFormats: ["country-name"],
    acceptedAnswerFormats: ["country-capital"],
    answerDifficulty: "easy",
  },
  {
    lessonNumber: 4,
    acceptedQuestionFormats: ["country-name"],
    acceptedAnswerFormats: ["country-position"],
    answerDifficulty: "easy",
  },
  {
    lessonNumber: 5,
    acceptedQuestionFormats: ["country-position"],
    acceptedAnswerFormats: ["country-name"],
    answerDifficulty: "hard",
  },
  {
    lessonNumber: 6,
    acceptedQuestionFormats: ["country-flag"],
    acceptedAnswerFormats: ["country-position"],
    answerDifficulty: "easy",
  },
  {
    lessonNumber: 7,
    acceptedQuestionFormats: ["country-name"],
    acceptedAnswerFormats: ["country-capital"],
    answerDifficulty: "hard",
  },
  {
    lessonNumber: 8,
    acceptedQuestionFormats: ["country-name"],
    acceptedAnswerFormats: ["country-flag"],
    answerDifficulty: "hard",
  },
  {
    lessonNumber: 9,
    acceptedQuestionFormats: ["country-position"],
    acceptedAnswerFormats: ["country-capital"],
    answerDifficulty: "hard",
  },
  {
    lessonNumber: 10,
    acceptedQuestionFormats: QUIZZ_FORMATS,
    acceptedAnswerFormats: QUIZZ_ANSWER_FORMATS,
    answerDifficulty: "hard",
  },
] as const satisfies readonly LessonTemplate[];

interface GetLessonTemplateParams {
  lessonNumber: number;
}

export function getLessonTemplate({
  lessonNumber,
}: GetLessonTemplateParams): LessonTemplate | undefined {
  return LESSON_TEMPLATES.find(
    (template) => template.lessonNumber === lessonNumber,
  );
}

interface GetLessonQuizzOptionsParams {
  area: MapRegionName;
  lesson: LessonTemplate;
}

export function getLessonQuizzOptions({
  area,
  lesson,
}: GetLessonQuizzOptionsParams): QuizzOptions {
  return {
    acceptedAnswerFormats: lesson.acceptedAnswerFormats,
    acceptedQuestionFormats: lesson.acceptedQuestionFormats,
    answerDifficulty: lesson.answerDifficulty,
    isInfiniteMode: false,
    regions: [area],
  };
}
