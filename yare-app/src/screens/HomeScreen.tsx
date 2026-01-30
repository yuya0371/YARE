import React, { useCallback, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Platform,
  Alert,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Calendar, Flame, Trophy, TrendingUp } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { STORAGE_KEYS } from '../config/constants';
import { useTheme } from '../theme/useTheme';
import {
  sendTestNotificationNow,
  sendTestNotificationDelayed,
  logScheduledNotifications,
  syncNotifications,
} from '../services/notifications';

type DailyRecord = {
  date: string;
  durationSec: number;
  memo: string;
  photoUri?: string;
  completed: boolean;
};

type RecordsMap = Record<string, DailyRecord>;

type StreakState = {
  currentStreak: number;
  maxStreak: number;
  cumulativeStreak: number;
  lastCompletedDate: string | null;
};

const pad2 = (n: number) => String(n).padStart(2, '0');
const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
};

const HomeScreen: React.FC = () => {
  const router = useRouter();
  const { colors, isDark } = useTheme();

  const [todayCompleted, setTodayCompleted] = useState(false);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [cumulativeStreak, setCumulativeStreak] = useState(0);
  const [todayMemo, setTodayMemo] = useState('');

  const loadFromStorage = useCallback(async () => {
    try {
      const [recordsJson, streakJson] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.records),
        AsyncStorage.getItem(STORAGE_KEYS.streak),
      ]);

      const streak: StreakState | null = streakJson ? JSON.parse(streakJson) : null;
      setCurrentStreak(streak?.currentStreak ?? 0);
      setMaxStreak(streak?.maxStreak ?? 0);
      setCumulativeStreak(streak?.cumulativeStreak ?? 0);

      const records: RecordsMap = recordsJson ? JSON.parse(recordsJson) : {};
      const tKey = todayKey();
      const today = records[tKey];

      const completed = Boolean(today?.completed);
      setTodayCompleted(completed);
      setTodayMemo(completed && today ? today.memo : '');
    } catch (e) {
      setTodayCompleted(false);
      setTodayMemo('');
      setCurrentStreak(0);
      setMaxStreak(0);
      setCumulativeStreak(0);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadFromStorage();
      return () => {};
    }, [loadFromStorage])
  );

  const handleStart = () => {
    if (todayCompleted) return;
    router.push('/task');
  };

  const handleViewHistory = () => {
    router.push('/history-stats');
  };

  // DEV: 本日分の記録をリセット（テスト用）
  const handleResetToday = async () => {
    const tKey = todayKey();
    try {
      const recordsJson = await AsyncStorage.getItem(STORAGE_KEYS.records);
      const records: RecordsMap = recordsJson ? JSON.parse(recordsJson) : {};
      delete records[tKey];
      await AsyncStorage.setItem(STORAGE_KEYS.records, JSON.stringify(records));

      const streakJson = await AsyncStorage.getItem(STORAGE_KEYS.streak);
      if (streakJson) {
        const streak: StreakState = JSON.parse(streakJson);
        if (streak.lastCompletedDate === tKey) {
          streak.currentStreak = Math.max(0, streak.currentStreak - 1);
          streak.lastCompletedDate = null;
          await AsyncStorage.setItem(STORAGE_KEYS.streak, JSON.stringify(streak));
        }
      }

      await loadFromStorage();
      Alert.alert('リセット完了', '本日分の記録を削除したよ');
    } catch (e) {
      Alert.alert('エラー', 'リセットに失敗した');
    }
  };

  const styles = createStyles(colors, isDark);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.screen}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>YARE</Text>
          <Pressable onPress={handleViewHistory} hitSlop={12}>
            <Calendar size={24} color={colors.textSecondary} />
          </Pressable>
        </View>

        {/* Main Streak Display */}
        <View style={styles.streakContainer}>
          <View style={styles.flameCircle}>
            <Flame size={48} color={colors.primary} fill={colors.primary} />
          </View>
          <Text style={styles.streakNumber}>{currentStreak}</Text>
          <Text style={styles.streakLabel}>日連続</Text>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <View style={styles.statIconWrap}>
              <Trophy size={18} color={colors.primary} />
            </View>
            <Text style={styles.statValue}>{maxStreak}</Text>
            <Text style={styles.statLabel}>最長</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <View style={styles.statIconWrap}>
              <TrendingUp size={18} color={colors.primary} />
            </View>
            <Text style={styles.statValue}>{cumulativeStreak}</Text>
            <Text style={styles.statLabel}>累積</Text>
          </View>
        </View>

        {/* Today Status */}
        <View style={styles.todayCard}>
          {todayCompleted ? (
            <>
              <View style={styles.completedBadge}>
                <Text style={styles.completedBadgeText}>完了</Text>
              </View>
              <Text style={styles.todayTitle}>今日もYAREたね!</Text>
              {todayMemo ? (
                <Text style={styles.todayMemo} numberOfLines={2}>
                  {todayMemo}
                </Text>
              ) : null}
            </>
          ) : (
            <>
              <Text style={styles.todayTitle}>今日はまだYAREてないね</Text>
              <Text style={styles.todaySubtitle}>1分だけでもいいから、やろう</Text>
            </>
          )}
        </View>

        {/* Action Button */}
        {!todayCompleted ? (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleStart}
            style={styles.startButton}
          >
            <Text style={styles.startButtonText}>やる</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.doneButton}>
            <Text style={styles.doneButtonText}>今日は完了済み</Text>
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer}>毎日1分、継続が力になる</Text>

        {/* DEV: テスト用ボタン */}
        {__DEV__ && (
          <View style={styles.devContainer}>
            <Pressable onPress={handleResetToday} style={styles.devButton}>
              <Text style={styles.devButtonText}>リセット</Text>
            </Pressable>
            <Pressable
              onPress={async () => {
                await sendTestNotificationNow();
                Alert.alert('送信完了', '即時通知を送信したよ');
              }}
              style={styles.devButton}
            >
              <Text style={styles.devButtonText}>即時通知</Text>
            </Pressable>
            <Pressable
              onPress={async () => {
                await sendTestNotificationDelayed();
                Alert.alert('スケジュール完了', '5秒後に通知が届くよ');
              }}
              style={styles.devButton}
            >
              <Text style={styles.devButtonText}>5秒後</Text>
            </Pressable>
            <Pressable
              onPress={async () => {
                await logScheduledNotifications();
                Alert.alert('確認', 'コンソールにログを出力したよ');
              }}
              style={styles.devButton}
            >
              <Text style={styles.devButtonText}>ログ</Text>
            </Pressable>
            <Pressable
              onPress={async () => {
                await syncNotifications();
                Alert.alert('同期完了', '通知を再スケジュールしたよ');
              }}
              style={styles.devButton}
            >
              <Text style={styles.devButtonText}>再同期</Text>
            </Pressable>
          </View>
        )}
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
      paddingHorizontal: 24,
      paddingTop: 8,
    },

    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 32,
    },
    logo: {
      fontSize: 24,
      fontWeight: Platform.select({ ios: '800', android: '800' }),
      color: colors.primary,
      letterSpacing: 2,
    },

    streakContainer: {
      alignItems: 'center',
      marginBottom: 28,
    },
    flameCircle: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: colors.primaryMuted,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    streakNumber: {
      fontSize: 72,
      fontWeight: Platform.select({ ios: '800', android: '800' }),
      color: colors.text,
      lineHeight: 80,
    },
    streakLabel: {
      fontSize: 18,
      color: colors.textSecondary,
      fontWeight: Platform.select({ ios: '600', android: '600' }),
      marginTop: 4,
    },

    statsRow: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderRadius: 16,
      paddingVertical: 20,
      paddingHorizontal: 24,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: colors.border,
    },
    statItem: {
      flex: 1,
      alignItems: 'center',
    },
    statIconWrap: {
      marginBottom: 8,
    },
    statValue: {
      fontSize: 24,
      fontWeight: Platform.select({ ios: '700', android: '700' }),
      color: colors.text,
    },
    statLabel: {
      fontSize: 13,
      color: colors.textSecondary,
      marginTop: 4,
    },
    statDivider: {
      width: 1,
      backgroundColor: colors.border,
      marginHorizontal: 20,
    },

    todayCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
    },
    completedBadge: {
      backgroundColor: colors.successMuted,
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
      marginBottom: 12,
    },
    completedBadgeText: {
      color: colors.success,
      fontSize: 12,
      fontWeight: Platform.select({ ios: '700', android: '700' }),
    },
    todayTitle: {
      fontSize: 18,
      fontWeight: Platform.select({ ios: '700', android: '700' }),
      color: colors.text,
      textAlign: 'center',
    },
    todaySubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 6,
    },
    todayMemo: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 8,
      textAlign: 'center',
    },

    startButton: {
      backgroundColor: colors.primary,
      borderRadius: 16,
      paddingVertical: 18,
      alignItems: 'center',
      justifyContent: 'center',
    },
    startButtonText: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: Platform.select({ ios: '700', android: '700' }),
      letterSpacing: 1,
    },

    doneButton: {
      backgroundColor: colors.surfaceElevated,
      borderRadius: 16,
      paddingVertical: 18,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    doneButtonText: {
      color: colors.textMuted,
      fontSize: 16,
      fontWeight: Platform.select({ ios: '600', android: '600' }),
    },

    footer: {
      marginTop: 20,
      fontSize: 13,
      color: colors.textMuted,
      textAlign: 'center',
    },

    devContainer: {
      marginTop: 24,
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: 8,
    },
    devButton: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      backgroundColor: isDark ? '#7F1D1D' : '#FEE2E2',
      borderRadius: 6,
    },
    devButtonText: {
      fontSize: 11,
      color: '#EF4444',
      fontWeight: Platform.select({ ios: '600', android: '600' }),
    },
  });

export default HomeScreen;
