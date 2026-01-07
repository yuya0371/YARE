import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Play, Pause, Square } from 'lucide-react-native';

function formatHHMMSS(totalSec: number) {
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

const TaskScreen: React.FC = () => {
  const router = useRouter();

  const [hasStarted, setHasStarted] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSec, setElapsedSec] = useState(0);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const timeText = useMemo(() => formatHHMMSS(elapsedSec), [elapsedSec]);

  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
      return;
    }

    intervalRef.current = setInterval(() => {
      setElapsedSec((prev) => prev + 1);
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [isRunning]);

  const onStart = () => {
    setHasStarted(true);
    setIsRunning(true);
  };

  const onTogglePause = () => {
    setIsRunning((v) => !v);
  };

  const onEnd = () => {
    setIsRunning(false);

    // TODO: ここで「メモ入力画面」へ遷移して record 保存 → 完了 までやる
    // 要件：メモ1文字以上必須。時間は1秒でもOK。[file:1]
    // 例: router.push({ pathname: '/task-finish', params: { durationSec: String(elapsedSec) } })
    router.push({ pathname: '/task-finish', params: { durationSec: String(elapsedSec) } });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <Text style={styles.taskTitle}>勉強タスク</Text>
          <Text style={styles.subTitle}>今日も少しだけやろう</Text>
        </View>

        <Text style={styles.timer}>{timeText}</Text>

        {!hasStarted ? (
          <TouchableOpacity activeOpacity={0.9} onPress={onStart} style={styles.primaryButton}>
            <Play size={18} color="#fff" />
            <Text style={styles.primaryButtonText}>開始</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.actions}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={onTogglePause}
              style={styles.pauseButton}
            >
              {isRunning ? <Pause size={18} color="#111827" /> : <Play size={18} color="#111827" />}
              <Text style={styles.pauseButtonText}>
                {isRunning ? '一時停止' : '再開'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.9} onPress={onEnd} style={styles.endButton}>
              <Square size={18} color="#fff" />
              <Text style={styles.endButtonText}>終了</Text>
            </TouchableOpacity>
          </View>
        )}

        <Pressable onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>戻る</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#EEF2FF' }, // うす青グラデっぽい雰囲気
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 90,
    paddingHorizontal: 20,
  },

  header: { alignItems: 'center', marginBottom: 30 },
  taskTitle: {
    fontSize: 20,
    fontWeight: Platform.select({ ios: '700', android: '700' }),
    color: '#111827',
  },
  subTitle: {
    marginTop: 6,
    fontSize: 14,
    color: '#6B7280',
    fontWeight: Platform.select({ ios: '500', android: '500' }),
  },

  timer: {
    fontSize: 64,
    color: '#2563EB',
    fontWeight: Platform.select({ ios: '800', android: '800' }),
    letterSpacing: 2,
    marginBottom: 26,
  },

  primaryButton: {
    width: '100%',
    maxWidth: 320,
    height: 62,
    backgroundColor: '#2F7CF6',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: Platform.select({ ios: '700', android: '700' }),
  },

  actions: {
    width: '100%',
    maxWidth: 320,
    gap: 14,
  },

  pauseButton: {
    height: 58,
    backgroundColor: '#FBBF24',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.15)',
  },
  pauseButtonText: {
    color: '#111827',
    fontSize: 17,
    fontWeight: Platform.select({ ios: '700', android: '700' }),
  },

  endButton: {
    height: 58,
    backgroundColor: '#22C55E',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  endButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: Platform.select({ ios: '700', android: '700' }),
  },

  back: { marginTop: 18, padding: 10 },
  backText: {
    color: '#6B7280',
    fontSize: 13,
    fontWeight: Platform.select({ ios: '600', android: '600' }),
  },
});

export default TaskScreen;
