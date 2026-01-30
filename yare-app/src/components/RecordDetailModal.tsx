import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  Image,
  Dimensions,
} from 'react-native';
import { X, Clock, FileText, Camera } from 'lucide-react-native';
import type { Colors } from '../theme/colors';

type Props = {
  visible: boolean;
  dateLabel: string;
  durationSec: number;
  memo: string;
  photoUri?: string;
  onClose: () => void;
  colors: typeof Colors.light;
};

const formatDuration = (sec: number): string => {
  if (sec < 60) return `${sec}秒`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return s > 0 ? `${m}分${s}秒` : `${m}分`;
};

export const RecordDetailModal: React.FC<Props> = ({
  visible,
  dateLabel,
  durationSec,
  memo,
  photoUri,
  onClose,
  colors,
}) => {
  const [photoExpanded, setPhotoExpanded] = useState(false);

  const handleClose = () => {
    setPhotoExpanded(false);
    onClose();
  };

  const styles = createStyles(colors);

  return (
    <>
      <Modal visible={visible} transparent animationType="fade">
        <Pressable style={styles.backdrop} onPress={handleClose}>
          <Pressable style={styles.card} onPress={() => {}}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.dateText}>{dateLabel}</Text>
              <Pressable onPress={handleClose} hitSlop={12} style={styles.closeBtn}>
                <X size={20} color={colors.textSecondary} />
              </Pressable>
            </View>

            {/* Duration */}
            <View style={styles.row}>
              <View style={styles.rowIcon}>
                <Clock size={16} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.label}>勉強時間</Text>
                <Text style={styles.value}>{formatDuration(durationSec)}</Text>
              </View>
            </View>

            {/* Memo */}
            <View style={styles.row}>
              <View style={styles.rowIcon}>
                <FileText size={16} color={colors.primary} />
              </View>
              <View style={styles.memoContainer}>
                <Text style={styles.label}>メモ</Text>
                <Text style={styles.memo}>{memo}</Text>
              </View>
            </View>

            {/* Photo */}
            {photoUri ? (
              <View style={styles.row}>
                <View style={styles.rowIcon}>
                  <Camera size={16} color={colors.primary} />
                </View>
                <View style={styles.photoContainer}>
                  <Text style={styles.label}>写真</Text>
                  <Pressable
                    style={styles.photoFrame}
                    onPress={() => setPhotoExpanded(true)}
                  >
                    <Image
                      source={{ uri: photoUri }}
                      style={styles.photo}
                      resizeMode="cover"
                    />
                  </Pressable>
                </View>
              </View>
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>

      {/* Expanded Photo Modal */}
      <Modal visible={photoExpanded} transparent animationType="fade">
        <Pressable style={styles.expandedBackdrop} onPress={() => setPhotoExpanded(false)}>
          <Image
            source={{ uri: photoUri }}
            style={styles.expandedPhoto}
            resizeMode="contain"
          />
        </Pressable>
      </Modal>
    </>
  );
};

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 24,
    },
    card: {
      width: '100%',
      maxWidth: 340,
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 20,
    },

    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 20,
    },
    dateText: {
      fontSize: 18,
      fontWeight: Platform.select({ ios: '700', android: '700' }),
      color: colors.text,
    },
    closeBtn: {
      padding: 4,
    },

    row: {
      flexDirection: 'row',
      marginBottom: 16,
    },
    rowIcon: {
      width: 32,
      height: 32,
      borderRadius: 8,
      backgroundColor: colors.primaryMuted,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    label: {
      fontSize: 12,
      color: colors.textSecondary,
      marginBottom: 4,
      fontWeight: Platform.select({ ios: '500', android: '500' }),
    },
    value: {
      fontSize: 16,
      color: colors.text,
      fontWeight: Platform.select({ ios: '700', android: '700' }),
    },
    memoContainer: {
      flex: 1,
    },
    memo: {
      fontSize: 15,
      color: colors.text,
      fontWeight: Platform.select({ ios: '500', android: '500' }),
      lineHeight: 22,
    },

    photoContainer: {
      flex: 1,
    },
    photoFrame: {
      width: '100%',
      height: 140,
      borderRadius: 12,
      overflow: 'hidden',
      backgroundColor: colors.background,
    },
    photo: {
      width: '100%',
      height: '100%',
    },

    expandedBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.95)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    expandedPhoto: {
      width: Dimensions.get('window').width,
      height: Dimensions.get('window').height * 0.8,
    },
  });
