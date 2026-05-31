import {
  openDatabaseAsync,
  type SQLiteDatabase,
  type SQLiteBindValue,
} from "expo-sqlite";

import { isQuizzFormat, type QuizzFormat } from "@/modules/quizz/utils/quizz";

const ADAPTIVE_HISTORY_DATABASE_NAME = "adaptive-history.db";

let adaptiveHistoryDatabasePromise: Promise<SQLiteDatabase> | null = null;

export interface RecordPracticeResultParams {
  answerFormat: QuizzFormat;
  countryCode: string;
  isCorrectAnswer: boolean;
  questionFormat: QuizzFormat;
}

export interface AdaptiveHistoryEntry {
  answerFormat: QuizzFormat;
  countryCode: string;
  failureCount: number;
  questionFormat: QuizzFormat;
  successCount: number;
}

interface AdaptiveHistoryRow {
  answer_format: string;
  country_code: string;
  failure_count: number;
  question_format: string;
  success_count: number;
}

export async function recordPracticeResult({
  answerFormat,
  countryCode,
  isCorrectAnswer,
  questionFormat,
}: RecordPracticeResultParams): Promise<void> {
  const answeredAt = new Date().toISOString();
  const successCount = isCorrectAnswer ? 1 : 0;
  const failureCount = isCorrectAnswer ? 0 : 1;
  const lastSuccessAt = isCorrectAnswer ? answeredAt : null;
  const lastFailureAt = isCorrectAnswer ? null : answeredAt;
  const database = await getAdaptiveHistoryDatabase();

  await database.runAsync(
    `
      INSERT INTO adaptive_history (
        country_code,
        question_format,
        answer_format,
        success_count,
        failure_count,
        last_answered_at,
        last_success_at,
        last_failure_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(country_code, question_format, answer_format)
      DO UPDATE SET
        success_count = success_count + excluded.success_count,
        failure_count = failure_count + excluded.failure_count,
        last_answered_at = excluded.last_answered_at,
        last_success_at = COALESCE(
          excluded.last_success_at,
          adaptive_history.last_success_at
        ),
        last_failure_at = COALESCE(
          excluded.last_failure_at,
          adaptive_history.last_failure_at
        )
    `,
    [
      countryCode,
      questionFormat,
      answerFormat,
      successCount,
      failureCount,
      answeredAt,
      lastSuccessAt,
      lastFailureAt,
    ] satisfies SQLiteBindValue[],
  );
}

export async function getAdaptiveHistoryEntries(): Promise<
  AdaptiveHistoryEntry[]
> {
  const database = await getAdaptiveHistoryDatabase();
  const rows = await database.getAllAsync<AdaptiveHistoryRow>(`
    SELECT
      country_code,
      question_format,
      answer_format,
      success_count,
      failure_count
    FROM adaptive_history
  `);

  return rows.flatMap((row) => {
    if (
      !isQuizzFormat(row.question_format) ||
      !isQuizzFormat(row.answer_format)
    ) {
      return [];
    }

    return [
      {
        answerFormat: row.answer_format,
        countryCode: row.country_code,
        failureCount: row.failure_count,
        questionFormat: row.question_format,
        successCount: row.success_count,
      },
    ];
  });
}

export async function resetAdaptiveHistory(): Promise<void> {
  const database = await getAdaptiveHistoryDatabase();

  await database.runAsync("DELETE FROM adaptive_history");
}

async function getAdaptiveHistoryDatabase(): Promise<SQLiteDatabase> {
  if (adaptiveHistoryDatabasePromise !== null) {
    return adaptiveHistoryDatabasePromise;
  }

  adaptiveHistoryDatabasePromise = openAndMigrateAdaptiveHistoryDatabase();

  return adaptiveHistoryDatabasePromise;
}

async function openAndMigrateAdaptiveHistoryDatabase(): Promise<SQLiteDatabase> {
  const database = await openDatabaseAsync(ADAPTIVE_HISTORY_DATABASE_NAME);

  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS adaptive_history (
      country_code TEXT NOT NULL,
      question_format TEXT NOT NULL,
      answer_format TEXT NOT NULL,
      success_count INTEGER NOT NULL DEFAULT 0,
      failure_count INTEGER NOT NULL DEFAULT 0,
      last_answered_at TEXT NOT NULL,
      last_success_at TEXT,
      last_failure_at TEXT,
      PRIMARY KEY (country_code, question_format, answer_format)
    );
  `);

  return database;
}
