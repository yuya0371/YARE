import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import type { Colors } from '../theme/colors';

type Props = {
  year: number;
  month: number; // 0-based
  completedSet: Set<string>; // YYYY-MM-DD
  selectedDate?: string | null;
  onPressDate?: (dateKey: string) => void;
  colors: typeof Colors.light;
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
  colors,
}) => {
  const todayKey = useMemo(() => toDateKey(new Date()), []);

  const cells = useMemo(() => {
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);

    const firstWeekday = first.getDay();
    const totalDays = last.getDate();

    const arr: Array<{ key: string; day: number; inMonth: boolean }> = [];

    for (let i = 0; i < firstWeekday; i++) {
      arr.push({ key: `blank-${i}`, day: 0, inMonth: false });
    }

    for (let d = 1; d <= totalDays; d++) {
      const key = toDateKey(new Date(year, month, d));
      arr.push({ key, day: d, inMonth: true });
    }

    while (arr.length < 42) {
      arr.push({ key: `blank-tail-${arr.length}`, day: 0, inMonth: false });
    }

    return arr;
  }, [year, month]);

  const styles = createStyles(colors);

  return (
    <View>
      <View style={styles.weekRow}>
        {WEEK_LABELS.map((w, i) => (
          <Text
            key={w}
            style={[
              styles.weekLabel,
              i === 0 && styles.sunday,
              i === 6 && styles.saturday,
            ]}
          >
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
                <Text
                  style={[
                    styles.dayText,
                    isCompleted && styles.completedText,
                  ]}
                >
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

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    weekRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 4,
      marginBottom: 12,
    },
    weekLabel: {
      width: 40,
      textAlign: 'center',
      fontSize: 12,
      color: colors.textSecondary,
      fontWeight: Platform.select({ ios: '600', android: '600' }),
    },
    sunday: { color: colors.primary },
    saturday: { color: '#3B82F6' },

    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      paddingHorizontal: 4,
    },
    cell: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8,
    },

    dayCircle: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    dayText: {
      fontSize: 14,
      color: colors.text,
      fontWeight: Platform.select({ ios: '500', android: '500' }),
    },

    completedCircle: {
      backgroundColor: colors.primary,
    },
    completedText: {
      color: '#FFFFFF',
      fontWeight: Platform.select({ ios: '700', android: '700' }),
    },

    todayCircle: {
      borderWidth: 2,
      borderColor: colors.primary,
    },

    selectedRing: {
      borderWidth: 2,
      borderColor: colors.text,
    },
  });
