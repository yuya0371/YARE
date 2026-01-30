import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

interface StreakHeaderProps {
  current: number;
  max: number;
  cumulative: number;
}

const StreakHeader: React.FC<StreakHeaderProps> = ({ current, max, cumulative }) => {
  return (
    <View style={styles.container}>
      {/* 上段：炎＋数字＋日連続（横並び） */}
      <View style={styles.topRow}>
        <Text style={styles.flame}>🔥</Text>

        <View style={styles.numberBlock}>
          <Text style={styles.current}>{current}</Text>
          <Text style={styles.label}>日連続</Text>
        </View>
      </View>

      {/* 下段：チップ（最長/累積） */}
      <View style={styles.chipsRow}>
        <View style={styles.chip}>
          <Text style={styles.chipIcon}>👤</Text>
          <Text style={styles.chipText}>最長 {max}日</Text>
        </View>

        <View style={styles.chip}>
          <Text style={styles.chipIcon}>📅</Text>
          <Text style={styles.chipText}>累積 {cumulative}日</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },

  flame: {
    fontSize: 38,
    marginRight: 12,
    opacity: 0.95,
  },

  numberBlock: {
    alignItems: 'center',
  },

  current: {
    fontSize: 56,
    lineHeight: 62,
    color: '#F97316',
    fontWeight: Platform.select({ ios: '800', android: '800' }),
  },

  label: {
    marginTop: 4,
    fontSize: 14,
    color: '#374151',
    fontWeight: Platform.select({ ios: '600', android: '600' }),
  },

  chipsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 18,
  },

  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  chipIcon: {
    fontSize: 15,
    marginRight: 8,
  },

  chipText: {
    fontSize: 15,
    color: '#374151',
    fontWeight: Platform.select({ ios: '600', android: '600' }),
  },
});

export { StreakHeader };
