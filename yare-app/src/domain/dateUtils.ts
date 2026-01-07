// dateUtils.ts

export const DATE_FORMAT = "YYYY-MM-DD";
export const MONTH_FORMAT = "YYYY-MM";

/** 今日を "YYYY-MM-DD" で返す（端末ローカル時間） */
export function getTodayKey(): string {
  const now = new Date();
  return toDateKey(now);
}

/** Date → "YYYY-MM-DD" */
export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // 0始まりなので+1
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Date → "YYYY-MM" */
export function toMonthKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

/** "YYYY-MM-DD" 文字列を Date に変換（ローカル） */
export function parseDateKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

/** 日付に n 日足した "YYYY-MM-DD" を返す（負数で過去方向） */
export function addDays(dateKey: string, delta: number): string {
  const date = parseDateKey(dateKey);
  date.setDate(date.getDate() + delta);
  return toDateKey(date);
}
