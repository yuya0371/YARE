import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../config/constants';
import { toDateKey } from './dateUtils';
import { applyCompleteToday, type StreakState } from './streakLogic';
import { onTaskCompleted } from '../services/notifications';

export type DailyRecord = {
  date: string;        // YYYY-MM-DD
  durationSec: number;
  memo: string;
  photoUri?: string;
  completed: boolean;
};

export type RecordsMap = Record<string, DailyRecord>;

export type WidgetState = {
  today: {
    date: string;
    completed: boolean;
    currentStreak: number;
  };
};

const defaultStreak: StreakState = {
  currentStreak: 0,
  maxStreak: 0,
  cumulativeStreak: 0,
  lastCompletedDate: null,
};

export async function completeToday(params: {
  durationSec: number;
  memo: string;
  photoUri?: string;
  now?: Date;
}) {
  const now = params.now ?? new Date();
  const todayKey = toDateKey(now);

  const [recordsJson, streakJson] = await Promise.all([
    AsyncStorage.getItem(STORAGE_KEYS.records),
    AsyncStorage.getItem(STORAGE_KEYS.streak),
  ]);

  const records: RecordsMap = recordsJson ? JSON.parse(recordsJson) : {};
  const prevStreak: StreakState = streakJson ? JSON.parse(streakJson) : defaultStreak;

  // 1) Record 保存
  records[todayKey] = {
    date: todayKey,
    durationSec: params.durationSec,
    memo: params.memo,
    photoUri: params.photoUri,
    completed: true,
  };

  // 2) Streak 更新
  const nextStreak = applyCompleteToday(prevStreak, now);

  // 3) WidgetState 更新
  const widget: WidgetState = {
    today: {
      date: todayKey,
      completed: true,
      currentStreak: nextStreak.currentStreak,
    },
  };

  // 4) まとめて保存
  await AsyncStorage.multiSet([
    [STORAGE_KEYS.records, JSON.stringify(records)],
    [STORAGE_KEYS.streak, JSON.stringify(nextStreak)],
    [STORAGE_KEYS.widget, JSON.stringify(widget)],
  ]);

  // 5) 本日の通知をキャンセル（失敗しても保存は成功扱い）
  try {
    await onTaskCompleted();
  } catch (e) {
    console.error('Failed to cancel notifications:', e);
  }

  return { record: records[todayKey], streak: nextStreak, widget };
}
