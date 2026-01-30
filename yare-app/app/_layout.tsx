// app/_layout.tsx
import { Stack } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { syncNotifications, setupNotificationListeners } from '../src/services/notifications';

export default function RootLayout() {
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    // アプリ起動時に通知を同期
    syncNotifications();

    // 通知リスナーを設定
    const unsubscribe = setupNotificationListeners();

    // フォアグラウンド復帰時に通知を同期
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        syncNotifications();
      }
      appState.current = nextAppState;
    });

    return () => {
      unsubscribe();
      subscription.remove();
    };
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="task" />
      <Stack.Screen name="task-finish" />
      <Stack.Screen name="history-stats" />
    </Stack>
  );
}
