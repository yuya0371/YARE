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
import { Play, Pause, Square, Clock } from 'lucide-react-native';

import { useTheme } from '../theme/useTheme';

function formatHHMMSS(totalSec: number) {
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

const TaskScreen: React.FC = () => {
  const router = useRouter();
  const { colors, isDark } = useTheme();

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
    router.push({ pathname: '/task-finish', params: { durationSec: String(elapsedSec) } });
  };

  const styles = createStyles(colors, isDark);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.screen}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.clockCircle}>
            <Clock size={32} color={colors.primary} />
          </View>
          <Text style={styles.taskTitle}>今日のYARE</Text>
          <Text style={styles.subTitle}>1分だけでいいからね</Text>
        </View>

        {/* Timer Display */}
        <View style={styles.timerContainer}>
          <Text style={styles.timer}>{timeText}</Text>
          {hasStarted && (
            <Text style={styles.timerStatus}>
              {isRunning ? '計測中...' : '一時停止中'}
            </Text>
          )}
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          {!hasStarted ? (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={onStart}
              style={styles.primaryButton}
            >
              <Play size={22} color="#FFFFFF" fill="#FFFFFF" />
              <Text style={styles.primaryButtonText}>開始</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.actions}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={onTogglePause}
                style={styles.secondaryButton}
              >
                {isRunning ? (
                  <Pause size={20} color={colors.text} />
                ) : (
                  <Play size={20} color={colors.text} fill={colors.text} />
                )}
                <Text style={styles.secondaryButtonText}>
                  {isRunning ? '一時停止' : '再開'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={onEnd}
                style={styles.endButton}
              >
                <Square size={20} color="#FFFFFF" fill="#FFFFFF" />
                <Text style={styles.endButtonText}>終了</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Back */}
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>キャンセル</Text>
        </Pressable>
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
      alignItems: 'center',
      justifyContent: 'flex-start',
      paddingTop: 60,
      paddingHorizontal: 24,
    },

    header: {
      alignItems: 'center',
      marginBottom: 40,
    },
    clockCircle: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.primaryMuted,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 20,
    },
    taskTitle: {
      fontSize: 24,
      fontWeight: Platform.select({ ios: '700', android: '700' }),
      color: colors.text,
    },
    subTitle: {
      marginTop: 8,
      fontSize: 15,
      color: colors.textSecondary,
      fontWeight: Platform.select({ ios: '500', android: '500' }),
    },

    timerContainer: {
      alignItems: 'center',
      marginBottom: 48,
    },
    timer: {
      fontSize: 72,
      color: colors.primary,
      fontWeight: Platform.select({ ios: '800', android: '800' }),
      letterSpacing: 2,
      fontVariant: ['tabular-nums'],
    },
    timerStatus: {
      marginTop: 8,
      fontSize: 14,
      color: colors.textSecondary,
    },

    controls: {
      width: '100%',
      maxWidth: 340,
    },

    primaryButton: {
      height: 60,
      backgroundColor: colors.primary,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: 12,
    },
    primaryButtonText: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: Platform.select({ ios: '700', android: '700' }),
    },

    actions: {
      gap: 14,
    },

    secondaryButton: {
      height: 56,
      backgroundColor: colors.surface,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    secondaryButtonText: {
      color: colors.text,
      fontSize: 17,
      fontWeight: Platform.select({ ios: '600', android: '600' }),
    },

    endButton: {
      height: 56,
      backgroundColor: colors.success,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: 10,
    },
    endButtonText: {
      color: '#FFFFFF',
      fontSize: 17,
      fontWeight: Platform.select({ ios: '700', android: '700' }),
    },

    back: {
      marginTop: 24,
      padding: 12,
    },
    backText: {
      color: colors.textMuted,
      fontSize: 14,
      fontWeight: Platform.select({ ios: '500', android: '500' }),
    },
  });

export default TaskScreen;
