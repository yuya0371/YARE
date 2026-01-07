// app/index.tsx
import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { router } from 'expo-router';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>YARE ホーム（ダミー）</Text>
      <Text style={styles.text}>今日はもうYAREした？</Text>

      <Button
        title="タスク開始画面へ"
        onPress={() => router.navigate('./task')}
      />
      <View style={{ height: 12 }} />
      <Button
        title="履歴・統計へ"
        onPress={() => router.navigate('./history-stats')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
  title: { fontSize: 24, fontWeight: '600', marginBottom: 16 },
  text: { fontSize: 16, marginBottom: 24 },
});
