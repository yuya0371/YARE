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
import { useFocusEffect, useRouter } from 'expo-router';
import { ChevronLeft, ChevronRight, Trophy, TrendingUp, Calendar, Target } from 'lucide-react-native';

import { STORAGE_KEYS } from '../config/constants';
import { CalendarMonthView } from '../components/CalendarMonthView';
import { RecordDetailModal } from '../components/RecordDetailModal';
import { calcRecentDays, calcThisMonthStats, type RecordsMap } from '../domain/statsLogic';
import { useTheme } from '../theme/useTheme';

type StreakState = {
  currentStreak: number;
  maxStreak: number;
  cumulativeStreak: number;
  lastCompletedDate: string | null;
};

const JP_WEEK = ['日', '月', '火', '水', '木', '金', '土'];
const formatJpDateLabel = (dateKey: string) => {
  const [y, m, d] = dateKey.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  const w = JP_WEEK[dt.getDay()];
  return `${m}月${d}日（${w}）`;
};

const HistoryStatsScreen: React.FC = () => {
  const router = useRouter();
  const { colors, isDark } = useTheme();

  const [records, setRecords] = useState<RecordsMap>({});
  const [streak, setStreak] = useState<StreakState>({
    currentStreak: 0,
    maxStreak: 0,
    cumulativeStreak: 0,
    lastCompletedDate: null,
  });

  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      const [recordsJson, streakJson] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.records),
        AsyncStorage.getItem(STORAGE_KEYS.streak),
      ]);

      setRecords(recordsJson ? JSON.parse(recordsJson) : {});
      setStreak(streakJson ? JSON.parse(streakJson) : {
        currentStreak: 0, maxStreak: 0, cumulativeStreak: 0, lastCompletedDate: null,
      });
    } catch (e) {
      console.error('Failed to load history data:', e);
      setRecords({});
      setStreak({
        currentStreak: 0, maxStreak: 0, cumulativeStreak: 0, lastCompletedDate: null,
      });
    }
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
    if (!completedSet.has(dateKey)) return;
    setSelectedDate(dateKey);
    setDetailOpen(true);
  };

  const selectedRecord = selectedDate ? records[selectedDate] : undefined;

  const styles = createStyles(colors, isDark);

  const StatCard = ({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) => (
    <View style={styles.statCard}>
      <View style={styles.statIcon}>{icon}</View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.screen}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <ChevronLeft size={24} color={colors.textSecondary} />
          </Pressable>
          <Text style={styles.headerTitle}>履歴・統計</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard
            icon={<Trophy size={20} color={colors.primary} />}
            value={`${streak.maxStreak}`}
            label="最長"
          />
          <StatCard
            icon={<TrendingUp size={20} color={colors.primary} />}
            value={`${streak.cumulativeStreak}`}
            label="累積"
          />
          <StatCard
            icon={<Target size={20} color={colors.primary} />}
            value={`${monthRate}%`}
            label={`${cursor.getMonth() + 1}月`}
          />
          <StatCard
            icon={<Calendar size={20} color={colors.primary} />}
            value={`${recent7.completedCount}/7`}
            label="直近"
          />
        </View>

        {/* Calendar */}
        <View style={styles.calendarCard}>
          <View style={styles.monthHeader}>
            <Pressable onPress={onPrevMonth} hitSlop={12} style={styles.arrowBtn}>
              <ChevronLeft size={22} color={colors.text} />
            </Pressable>

            <Text style={styles.monthTitle}>{monthLabel}</Text>

            <Pressable onPress={onNextMonth} hitSlop={12} style={styles.arrowBtn}>
              <ChevronRight size={22} color={colors.text} />
            </Pressable>
          </View>

          <CalendarMonthView
            year={cursor.getFullYear()}
            month={cursor.getMonth()}
            completedSet={completedSet}
            selectedDate={selectedDate}
            onPressDate={onPressDate}
            colors={colors}
          />
        </View>

        <RecordDetailModal
          visible={detailOpen}
          dateLabel={selectedDate ? formatJpDateLabel(selectedDate) : ''}
          durationSec={selectedRecord?.durationSec ?? 0}
          memo={selectedRecord?.memo ?? ''}
          photoUri={selectedRecord?.photoUri}
          onClose={() => setDetailOpen(false)}
          colors={colors}
        />
      </View>
    </SafeAreaView>
  );
};

const createStyles = (
  colors: ReturnType<typeof import('../theme/useTheme').useTheme>['colors'],
  isDark: boolean
) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    screen: {
      flex: 1,
      paddingHorizontal: 20,
      paddingTop: 8,
    },

    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 24,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: Platform.select({ ios: '700', android: '700' }),
      color: colors.text,
    },

    statsGrid: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 20,
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: 14,
      padding: 14,
      marginHorizontal: 4,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    statIcon: {
      marginBottom: 8,
    },
    statValue: {
      fontSize: 20,
      fontWeight: Platform.select({ ios: '800', android: '800' }),
      color: colors.text,
    },
    statLabel: {
      fontSize: 11,
      color: colors.textSecondary,
      marginTop: 4,
    },

    calendarCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      paddingVertical: 16,
      paddingHorizontal: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },

    monthHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 8,
      marginBottom: 16,
    },
    monthTitle: {
      fontSize: 16,
      color: colors.text,
      fontWeight: Platform.select({ ios: '700', android: '700' }),
    },
    arrowBtn: {
      padding: 4,
    },
  });

export default HistoryStatsScreen;
