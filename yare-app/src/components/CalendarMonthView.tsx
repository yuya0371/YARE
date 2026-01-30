import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';

type Props = {
  year: number;
  month: number; // 0-based
  completedSet: Set<string>; // YYYY-MM-DD
  selectedDate?: string | null;
  onPressDate?: (dateKey: string) => void;
};

const pad2 = (n: number) => String(n).padStart(2, '0');
const toDateKey = (d: Date) =>
  `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

const WEEK_LABELS = ['日', '月', '火', '水', '木', '金', '土'];

export const CalendarMonthView: React.FC<Props> = ({
  year,
  month,
  completedSet,
  selectedDate,
  onPressDate,
}) => {
  const todayKey = useMemo(() => toDateKey(new Date()), []);

  const cells = useMemo(() => {
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);

    const firstWeekday = first.getDay(); // 0=Sun
    const totalDays = last.getDate();

    const arr: Array<{ key: string; day: number; inMonth: boolean }> = [];

    // 先頭の空白
    for (let i = 0; i < firstWeekday; i++) {
      arr.push({ key: `blank-${i}`, day: 0, inMonth: false });
    }

    // 日付
    for (let d = 1; d <= totalDays; d++) {
      const key = toDateKey(new Date(year, month, d));
      arr.push({ key, day: d, inMonth: true });
    }

    // 末尾を6週固定にしたいなら埋める（見た目安定）
    while (arr.length < 42) {
      arr.push({ key: `blank-tail-${arr.length}`, day: 0, inMonth: false });
    }

    return arr;
  }, [year, month]);

  return (
    <View>
      <View style={styles.weekRow}>
        {WEEK_LABELS.map((w) => (
          <Text key={w} style={[styles.weekLabel, w === '日' && styles.sun]}>
            {w}
          </Text>
        ))}
      </View>

      <View style={styles.grid}>
        {cells.map((c) => {
          if (!c.inMonth) return <View key={c.key} style={styles.cell} />;

          const isCompleted = completedSet.has(c.key);
          const isToday = c.key === todayKey;
          const isSelected = selectedDate === c.key;

          return (
            <Pressable
              key={c.key}
              onPress={() => onPressDate?.(c.key)}
              style={styles.cell}
            >
              <View
                style={[
                  styles.dayCircle,
                  isCompleted && styles.completedCircle,
                  !isCompleted && isToday && styles.todayCircle,
                  isSelected && styles.selectedRing,
                ]}
              >
                <Text style={[styles.dayText, isCompleted && styles.completedText]}>
                  {c.day}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
    marginBottom: 10,
  },
  weekLabel: {
    width: 36,
    textAlign: 'center',
    fontSize: 12,
    color: '#6B7280',
    fontWeight: Platform.select({ ios: '600', android: '600' }),
  },
  sun: { color: '#F97316' },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
  },
  cell: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },

  dayCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    fontSize: 12,
    color: '#111827',
    fontWeight: Platform.select({ ios: '600', android: '600' }),
  },

  completedCircle: {
    backgroundColor: '#F97316',
  },
  completedText: { color: '#fff' },

  todayCircle: {
    borderWidth: 1.5,
    borderColor: 'rgba(249, 115, 22, 0.35)',
  },

  selectedRing: {
    borderWidth: 2,
    borderColor: '#111827',
  },
});
