import React, { useCallback, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Platform,
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

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.screen}>
        <Text style={styles.pageTitle}>YARE</Text>

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
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F3F4F6' },
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 22,
    paddingHorizontal: 20,
  },

  pageTitle: {
    fontSize: 18,
    fontWeight: Platform.select({ ios: '700', android: '700' }),
    color: '#111827',
    marginBottom: 18,
  },

  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFF7ED',
    borderRadius: 26,
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 18,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 8,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: Platform.select({ ios: '700', android: '700' }),
    color: '#111827',
    marginBottom: 8,
  },

  streakBlock: {
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 6,
  },

  summaryBlock: {
    marginTop: 18,
  },

  startButton: {
    marginTop: 14,
    backgroundColor: '#F97316',
    borderRadius: 14,
    paddingVertical: 14,
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
    fontSize: 16,
    fontWeight: Platform.select({ ios: '700', android: '700' }),
  },

  doneButton: {
    marginTop: 14,
    backgroundColor: '#E5E7EB',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneButtonText: {
    color: '#9CA3AF',
    fontSize: 16,
    fontWeight: Platform.select({ ios: '700', android: '700' }),
  },

  historyButton: {
    marginTop: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 12,
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
});

export default HomeScreen;
