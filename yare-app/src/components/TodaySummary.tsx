import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

interface TodaySummaryProps {
  completed: boolean;
  durationMin?: number;
  memoPreview?: string;
}

const TodaySummary: React.FC<TodaySummaryProps> = ({ completed, durationMin, memoPreview }) => {
  const showDetail = useMemo(() => {
    return completed && typeof durationMin === 'number' && typeof memoPreview === 'string';
  }, [completed, durationMin, memoPreview]);

  return (
    <View style={[styles.card, completed ? styles.cardCompleted : styles.cardPending]}>
      <Text style={[styles.statusText, completed ? styles.completedText : styles.pendingText]}>
        {completed ? '今日もYAREたね！' : '今日はまだYAREてないね'}
      </Text>

      {showDetail && (
        <View style={styles.detailWrap}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>今日の勉強時間</Text>
            <Text style={styles.detailValue}>{durationMin}分</Text>
          </View>

          <Text style={styles.memoText} numberOfLines={2}>
            {memoPreview ? `「${memoPreview}」` : '「」'}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: 18,
    paddingVertical: 20,
    paddingHorizontal: 18,
    borderWidth: 1,

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },

  cardPending: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
  },

  cardCompleted: {
    backgroundColor: '#ECFDF5',
    borderColor: 'rgba(5, 150, 105, 0.20)',
  },

  statusText: {
    fontSize: 22,
    fontWeight: Platform.select({ ios: '800', android: '800' }),
    textAlign: 'center',
  },

  pendingText: {
    color: '#F46A0A',
  },

  completedText: {
    color: '#059669',
  },

  detailWrap: {
    marginTop: 14,
  },

  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  detailLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: Platform.select({ ios: '600', android: '600' }),
  },

  detailValue: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: Platform.select({ ios: '700', android: '700' }),
  },

  memoText: {
    marginTop: 8,
    fontSize: 13,
    color: '#374151',
  },
});

export { TodaySummary };
