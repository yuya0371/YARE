export type DailyRecord = {
  date: string;        // YYYY-MM-DD
  durationSec: number;
  memo: string;
  photoUri?: string;
  completed: boolean;
};

export type RecordsMap = Record<string, DailyRecord>;

const pad2 = (n: number) => String(n).padStart(2, '0');
const toDateKey = (d: Date) =>
  `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

export function calcThisMonthStats(records: RecordsMap, now: Date) {
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-based

  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const totalDays = last.getDate();

  let completedDays = 0;
  for (let day = 1; day <= totalDays; day++) {
    const key = toDateKey(new Date(year, month, day));
    if (records[key]?.completed) completedDays++;
  }

  return {
    yearMonthLabel: `${year}年${month + 1}月`,
    totalDays,
    completedDays,
  };
}

export function calcRecentDays(records: RecordsMap, now: Date, days: number) {
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const start = new Date(end);
  start.setDate(end.getDate() - (days - 1));

  let completedCount = 0;
  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const key = toDateKey(d);
    if (records[key]?.completed) completedCount++;
  }

  return {
    from: toDateKey(start),
    to: toDateKey(end),
    completedCount,
  };
}
