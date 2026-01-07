// src/domain/streakLogic.ts

// YARE のストリークロジック。
// 想定日付フォーマット: "YYYY-MM-DD"

export type Streak = {
  currentStreak: number;
  maxStreak: number;
  cumulativeStreak: number;
  lastCompletedDate: string | null; // "YYYY-MM-DD"
};

export type StreakUpdateInput = {
  streak: Streak;
  today: string;          // "YYYY-MM-DD"（端末ローカル）
  completedToday: boolean;
};

/**
 * "YYYY-MM-DD" → Date 変換
 */
const parseDate = (dateStr: string): Date => {
  const [y, m, d] = dateStr.split('-').map(Number);
  // ローカルタイムの 0:00 固定
  return new Date(y, m - 1, d);
};

/**
 * 2つの日付文字列の差分（日数）
 * from → to を何日またいだか（today=2024-01-02, last=2024-01-01 → 1）
 */
const diffDays = (from: string, to: string): number => {
  const a = parseDate(from);
  const b = parseDate(to);
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.floor((b.getTime() - a.getTime()) / msPerDay);
};

/**
 * 累積ストリーク救済ロジック
 *
 * 仕様イメージ:
 * - 初回に 7 日連続達成 → maxStreak = 7, cumulativeStreak = 7
 * - その後、再び 7 日連続達成（= currentStreak が 7 に到達）したら +7 → 14
 * - 次の救済条件は 14 日連続達成時 → +14 で 28
 * - 以降も同様に「現在の cumulativeStreak 日 連続達成」でその日数を加算
 */
type CumulativeInput = {
  currentStreak: number;
  maxStreak: number;
  cumulativeStreak: number;
};

const applyCumulativeRescue = (
  input: CumulativeInput,
): CumulativeInput => {
  let { currentStreak, maxStreak, cumulativeStreak } = input;

  // 初回: 一度も累積が設定されていない状態で maxStreak が立ったら、
  // 「その時点の最大ストリーク日数 = 累積ストリーク」として記録。
  if (cumulativeStreak === 0 && maxStreak > 0) {
    cumulativeStreak = maxStreak;
  }

  // 現在の cumulativeStreak を「次に救済が発動するターゲット日数」として扱う。
  // 例:
  //   max=7, cumulative=7 のとき → currentStreak が 7 になった瞬間に +7 → 14
  //   次は currentStreak が 14 になった瞬間に +14 → 28
  const nextTarget = cumulativeStreak;

  if (nextTarget > 0 && currentStreak === nextTarget) {
    cumulativeStreak += nextTarget;
  }

  return { currentStreak, maxStreak, cumulativeStreak };
};

/**
 * ストリーク更新のメイン関数
 *
 * - 当日のタスク完了時に呼び出す想定。
 * - 「日付が変わったときのリセット（currentStreak を 0 にする）」は別処理で行う。
 */
export const updateStreak = ({
  streak,
  today,
  completedToday,
}: StreakUpdateInput): Streak => {
  const {
    currentStreak,
    maxStreak,
    cumulativeStreak,
    lastCompletedDate,
  } = streak;

  // デフォルト値
  let nextCurrent = currentStreak;
  let nextMax = maxStreak;
  let nextCumulative = cumulativeStreak;
  let nextLastCompletedDate = lastCompletedDate;

  // 今日タスク未完了なら、この関数では何もしない。
  // （ストリークリセットは日付ロールオーバー側でまとめて判定）
  if (!completedToday) {
    return {
      currentStreak: nextCurrent,
      maxStreak: nextMax,
      cumulativeStreak: nextCumulative,
      lastCompletedDate: nextLastCompletedDate,
    };
  }

  // ここから「今日完了した」ケース

  if (!lastCompletedDate) {
    // 初日の完了
    nextCurrent = 1;
  } else {
    const gap = diffDays(lastCompletedDate, today);

    if (gap === 0) {
      // 同じ日に二重で完了処理を走らせないようにガード
      return streak;
    } else if (gap === 1) {
      // 連続達成
      nextCurrent = currentStreak + 1;
    } else {
      // 1日以上空いている → ストリークは途切れて再スタート
      nextCurrent = 1;
    }
  }

  // 最終達成日を更新
  nextLastCompletedDate = today;

  // 最長ストリーク更新
  if (nextCurrent > nextMax) {
    nextMax = nextCurrent;
  }

  // 累積ストリークの救済適用
  const cumulativeResult = applyCumulativeRescue({
    currentStreak: nextCurrent,
    maxStreak: nextMax,
    cumulativeStreak: nextCumulative,
  });

  return {
    currentStreak: cumulativeResult.currentStreak,
    maxStreak: cumulativeResult.maxStreak,
    cumulativeStreak: cumulativeResult.cumulativeStreak,
    lastCompletedDate: nextLastCompletedDate,
  };
};
