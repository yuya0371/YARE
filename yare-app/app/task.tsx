// app/task.tsx
import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { router } from 'expo-router';

export default function TaskScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>タスク実行画面（ダミー）</Text>
      <Text style={styles.text}>ここにタイマーとメモが入る予定。</Text>

      <Button title="ホームに戻る" onPress={() => router.navigate('/')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
  title: { fontSize: 24, fontWeight: '600', marginBottom: 16 },
  text: { fontSize: 16, marginBottom: 24 },
});
