// src/domain/models.ts

// Task
export type Task = {
  id: string;
  name: string;
  createdAt: string; // ISO string
};

// Record（日別記録）
export type Record = {
  date: string;        // "YYYY-MM-DD"
  durationSec: number; // seconds
  memo: string;
  photoUri?: string;
  completed: boolean;
};

export type RecordMap = {
  [date: string]: Record;
};

// Streak（ストリーク）
export type Streak = {
  currentStreak: number;
  maxStreak: number;
  cumulativeStreak: number;
  lastCompletedDate: string | null; // "YYYY-MM-DD" or null
};

// Freeze（フリーズ）
export type Freeze = {
  availableCount: number;
  lastResetMonth: string; // "YYYY-MM"
  equipped: boolean;
};

// WidgetState（ウィジェット連携用）
export type WidgetState = {
  today: {
    date: string;        // "YYYY-MM-DD"
    completed: boolean;
    currentStreak: number;
  };
};
