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
import { Calendar } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { STORAGE_KEYS } from '../config/constants';
import { StreakHeader } from '../components/StreakHeader';
import { TodaySummary } from '../components/TodaySummary';

type DailyRecord = {
  date: string;        // YYYY-MM-DD
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

  const [todayCompleted, setTodayCompleted] = useState(false);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [cumulativeStreak, setCumulativeStreak] = useState(0);

  const [todayDurationMin, setTodayDurationMin] = useState(0);
  const [todayMemo, setTodayMemo] = useState('');

  const loadFromStorage = useCallback(async () => {
    try {
      const [recordsJson, streakJson] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.records),
        AsyncStorage.getItem(STORAGE_KEYS.streak),
      ]);

      // --- streak ---
      const streak: StreakState | null = streakJson ? JSON.parse(streakJson) : null;
      setCurrentStreak(streak?.currentStreak ?? 0);
      setMaxStreak(streak?.maxStreak ?? 0);
      setCumulativeStreak(streak?.cumulativeStreak ?? 0);

      // --- today record ---
      const records: RecordsMap = recordsJson ? JSON.parse(recordsJson) : {};
      const tKey = todayKey();
      const today = records[tKey];

      const completed = Boolean(today?.completed);
      setTodayCompleted(completed);

      if (completed && today) {
        setTodayDurationMin(Math.max(0, Math.round((today.durationSec ?? 0) / 60)));
        setTodayMemo(today.memo ?? '');
      } else {
        setTodayDurationMin(0);
        setTodayMemo('');
      }
    } catch (e) {
      // 壊れたJSON等でも落ちないように初期化
      setTodayCompleted(false);
      setTodayDurationMin(0);
      setTodayMemo('');
      setCurrentStreak(0);
      setMaxStreak(0);
      setCumulativeStreak(0);
    }
  }, []);

  // 画面に戻ってきたタイミングで必ず再ロード
  useFocusEffect(
    useCallback(() => {
      loadFromStorage();
      return () => {};
    }, [loadFromStorage])
  ); // useFocusEffectはExpo Routerのフック [web:53]

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
      // recordsから今日のエントリを削除
      const recordsJson = await AsyncStorage.getItem(STORAGE_KEYS.records);
      const records: RecordsMap = recordsJson ? JSON.parse(recordsJson) : {};
      delete records[tKey];
      await AsyncStorage.setItem(STORAGE_KEYS.records, JSON.stringify(records));

      // streakを調整（lastCompletedDateが今日なら1減らす）
      const streakJson = await AsyncStorage.getItem(STORAGE_KEYS.streak);
      if (streakJson) {
        const streak: StreakState = JSON.parse(streakJson);
        if (streak.lastCompletedDate === tKey) {
          streak.currentStreak = Math.max(0, streak.currentStreak - 1);
          streak.lastCompletedDate = null; // リセット
          await AsyncStorage.setItem(STORAGE_KEYS.streak, JSON.stringify(streak));
        }
      }

      await loadFromStorage();
      Alert.alert('リセット完了', '本日分の記録を削除したよ');
    } catch (e) {
      Alert.alert('エラー', 'リセットに失敗した');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.screen}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>YARE</Text>

          <View style={styles.streakBlock}>
            <StreakHeader current={currentStreak} max={maxStreak} cumulative={cumulativeStreak} />
          </View>

          <View style={styles.summaryBlock}>
            <TodaySummary
              completed={todayCompleted}
              durationMin={todayDurationMin}
              memoPreview={todayMemo}
            />
          </View>

          {!todayCompleted ? (
            <TouchableOpacity activeOpacity={0.9} onPress={handleStart} style={styles.startButton}>
              <Text style={styles.startButtonText}>開始</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.doneButton}>
              <Text style={styles.doneButtonText}>完了済み</Text>
            </View>
          )}

          <Pressable
            onPress={handleViewHistory}
            style={({ pressed }) => [styles.historyButton, pressed && styles.historyButtonPressed]}
          >
            <Calendar size={18} color="#374151" />
            <Text style={styles.historyText}>履歴・統計を見る</Text>
          </Pressable>
        </View>

        <Text style={styles.footer}>毎日一分、勉強とひとことが大事だよ</Text>

        {/* DEV: テスト用リセットボタン（本番では削除） */}
        {__DEV__ && (
          <Pressable onPress={handleResetToday} style={styles.devResetButton}>
            <Text style={styles.devResetText}>DEV: 本日分をリセット</Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFF7ED' },
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 16,
    paddingHorizontal: 20,
  },

  card: {
    width: '100%',
    maxWidth: 380,
    paddingHorizontal: 4,
    paddingTop: 8,
    paddingBottom: 16,
  },

  cardTitle: {
    fontSize: 20,
    fontWeight: Platform.select({ ios: '700', android: '700' }),
    color: '#111827',
    marginBottom: 8,
  },

  streakBlock: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },

  summaryBlock: {
    marginTop: 24,
  },

  startButton: {
    marginTop: 20,
    backgroundColor: '#F97316',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 12,
    elevation: 6,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: Platform.select({ ios: '700', android: '700' }),
  },

  doneButton: {
    marginTop: 20,
    backgroundColor: '#E5E7EB',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneButtonText: {
    color: '#9CA3AF',
    fontSize: 17,
    fontWeight: Platform.select({ ios: '700', android: '700' }),
  },

  historyButton: {
    marginTop: 14,
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  historyButtonPressed: { backgroundColor: '#F9FAFB' },
  historyText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: Platform.select({ ios: '600', android: '600' }),
  },

  footer: {
    marginTop: 14,
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
  },

  // DEV: テスト用（本番では削除）
  devResetButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  devResetText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: Platform.select({ ios: '600', android: '600' }),
  },
});

export default HomeScreen;
