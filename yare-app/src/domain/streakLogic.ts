import { toDateKey } from './dateUtils';

export type StreakState = {
  currentStreak: number;
  maxStreak: number;
  cumulativeStreak: number;
  lastCompletedDate: string | null; // YYYY-MM-DD
};

export function applyCompleteToday(prev: StreakState, now: Date): StreakState {
  const today = toDateKey(now);

  if (prev.lastCompletedDate === today) return prev;

  const yesterdayDate = new Date(now);
  yesterdayDate.setDate(now.getDate() - 1);
  const yesterday = toDateKey(yesterdayDate);

  const nextCurrent =
    prev.lastCompletedDate === yesterday ? prev.currentStreak + 1 : 1;

  const nextMax = Math.max(prev.maxStreak, nextCurrent);

  // MVP: とりあえず「完了した回数」を累積として増やす（要件の救済ロジックは後で差し替え）
  const nextCumulative = prev.cumulativeStreak + 1;

  return {
    currentStreak: nextCurrent,
    maxStreak: nextMax,
    cumulativeStreak: nextCumulative,
    lastCompletedDate: today,
  };
}
