// app/_layout.tsx
import { Stack } from 'expo-router';
import React from 'react';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ title: 'YARE' }}
      />
      <Stack.Screen
        name="task"
        options={{ title: '今日のYARE' }}
      />
      <Stack.Screen
        name="history-stats"
        options={{ title: '履歴と統計' }}
      />
    </Stack>
  );
}
