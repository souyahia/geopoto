const MILLISECONDS_PER_DAY = 86_400_000;

interface GetUtcDateKeyParams {
  date: Date;
}

export function getUtcDateKey({ date }: GetUtcDateKeyParams): string {
  const year = date.getUTCFullYear();
  const month = formatDatePart({ value: date.getUTCMonth() + 1 });
  const day = formatDatePart({ value: date.getUTCDate() });

  return `${year}-${month}-${day}`;
}

interface GetUtcDayIndexParams {
  date: Date;
}

export function getUtcDayIndex({ date }: GetUtcDayIndexParams): number {
  const utcMidnight = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
  );

  return Math.floor(utcMidnight / MILLISECONDS_PER_DAY);
}

interface FormatDatePartParams {
  value: number;
}

function formatDatePart({ value }: FormatDatePartParams): string {
  return value.toString().padStart(2, "0");
}
