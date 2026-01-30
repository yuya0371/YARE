import React, { useCallback, useMemo, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Platform,
  Pressable,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';

import { STORAGE_KEYS } from '../config/constants';
import { CalendarMonthView } from '../components/CalendarMonthView';
import { RecordDetailModal } from '../components/RecordDetailModal';
import { calcRecentDays, calcThisMonthStats, type RecordsMap } from '../domain/statsLogic';

type StreakState = {
  currentStreak: number;
  maxStreak: number;
  cumulativeStreak: number;
  lastCompletedDate: string | null;
};

const pad2 = (n: number) => String(n).padStart(2, '0');
const toDateKey = (d: Date) =>
  `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

const JP_WEEK = ['日', '月', '火', '水', '木', '金', '土'];
const formatJpDateLabel = (dateKey: string) => {
  const [y, m, d] = dateKey.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  const w = JP_WEEK[dt.getDay()];
  return `${m}月${d}日（${w}）`;
};

const StatCard = ({ title, value, sub }: { title: string; value: string; sub: string }) => {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statSub}>{sub}</Text>
    </View>
  );
};

const HistoryStatsScreen: React.FC = () => {
  const [records, setRecords] = useState<RecordsMap>({});
  const [streak, setStreak] = useState<StreakState>({
    currentStreak: 0,
    maxStreak: 0,
    cumulativeStreak: 0,
    lastCompletedDate: null,
  });

  // 表示中の月
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const load = useCallback(async () => {
    const [recordsJson, streakJson] = await Promise.all([
      AsyncStorage.getItem(STORAGE_KEYS.records),
      AsyncStorage.getItem(STORAGE_KEYS.streak),
    ]);

    setRecords(recordsJson ? JSON.parse(recordsJson) : {});
    setStreak(streakJson ? JSON.parse(streakJson) : {
      currentStreak: 0, maxStreak: 0, cumulativeStreak: 0, lastCompletedDate: null,
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
      return () => {};
    }, [load])
  );

  const completedSet = useMemo(() => {
    const s = new Set<string>();
    Object.keys(records).forEach((k) => {
      if (records[k]?.completed) s.add(k);
    });
    return s;
  }, [records]);

  const monthStats = useMemo(() => calcThisMonthStats(records, cursor), [records, cursor]);
  const recent7 = useMemo(() => calcRecentDays(records, new Date(), 7), [records]);
  const recent30 = useMemo(() => calcRecentDays(records, new Date(), 30), [records]);

  const monthRate = useMemo(() => {
    if (monthStats.totalDays === 0) return 0;
    return Math.round((monthStats.completedDays / monthStats.totalDays) * 100);
  }, [monthStats]);

  const monthLabel = useMemo(() => {
    return `${cursor.getFullYear()}年${cursor.getMonth() + 1}月`;
  }, [cursor]);

  const onPrevMonth = () => {
    setCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    setSelectedDate(null);
  };

  const onNextMonth = () => {
    setCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    setSelectedDate(null);
  };

  const onPressDate = (dateKey: string) => {
    // 達成日だけ詳細表示（要件通り）[file:220]
    if (!completedSet.has(dateKey)) return;

    setSelectedDate(dateKey);
    setDetailOpen(true);
  };

  const selectedRecord = selectedDate ? records[selectedDate] : undefined;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.screen}>
        <Text style={styles.title}>履歴・統計</Text>

        <View style={styles.statsGrid}>
          <StatCard title="最大ストリーク" value={`${streak.maxStreak}`} sub="日" />
          <StatCard title="累積ストリーク" value={`${streak.cumulativeStreak}`} sub="日" />
          <StatCard
            title={`${cursor.getMonth() + 1}月の達成率`}
            value={`${monthRate}%`}
            sub={`${monthStats.completedDays}/${monthStats.totalDays}日`}
          />
          <StatCard
            title="直近の達成"
            value={`${recent7.completedCount}`}
            sub={`/7日（30日: ${recent30.completedCount}日）`}
          />
        </View>

        <View style={styles.calendarCard}>
          <View style={styles.monthHeader}>
            <Pressable onPress={onPrevMonth} hitSlop={10} style={styles.arrowBtn}>
              <Text style={styles.arrow}>‹</Text>
            </Pressable>

            <Text style={styles.monthTitle}>{monthLabel}</Text>

            <Pressable onPress={onNextMonth} hitSlop={10} style={styles.arrowBtn}>
              <Text style={styles.arrow}>›</Text>
            </Pressable>
          </View>

          <CalendarMonthView
            year={cursor.getFullYear()}
            month={cursor.getMonth()}
            completedSet={completedSet}
            selectedDate={selectedDate}
            onPressDate={onPressDate}
          />
        </View>

        <RecordDetailModal
          visible={detailOpen}
          dateLabel={selectedDate ? formatJpDateLabel(selectedDate) : ''}
          durationSec={selectedRecord?.durationSec ?? 0}
          memo={selectedRecord?.memo ?? ''}
          photoUri={selectedRecord?.photoUri}
          onClose={() => setDetailOpen(false)}
        />

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F3F4F6' },
  screen: { flex: 1, paddingHorizontal: 18, paddingTop: 16 },

  title: {
    fontSize: 16,
    color: '#111827',
    fontWeight: Platform.select({ ios: '800', android: '800' }),
    marginBottom: 12,
  },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
    marginBottom: 12,
  },

  statCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statTitle: { fontSize: 11, color: '#6B7280', marginBottom: 8 },
  statValue: {
    fontSize: 22,
    color: '#2563EB',
    fontWeight: Platform.select({ ios: '800', android: '800' }),
    lineHeight: 26,
  },
  statSub: { fontSize: 11, color: '#6B7280', marginTop: 2 },

  calendarCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    marginBottom: 10,
  },
  monthTitle: {
    fontSize: 14,
    color: '#111827',
    fontWeight: Platform.select({ ios: '800', android: '800' }),
  },
  arrowBtn: { padding: 6 },
  arrow: { fontSize: 18, color: '#111827' },
});

export default HistoryStatsScreen;
