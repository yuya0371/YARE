// src/screens/HomeScreen.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const HomeScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>YARE ホーム（ダミー）</Text>
      <Text style={styles.text}>今日はもうYAREした？</Text>
      {/* ナビゲーションは app/index.tsx 側でやるので、ここは表示だけ */}
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '600', marginBottom: 16 },
  text: { fontSize: 16, marginBottom: 24 },
});
