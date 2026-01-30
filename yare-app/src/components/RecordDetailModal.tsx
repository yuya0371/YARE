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

type Props = {
  visible: boolean;
  dateLabel: string;
  durationSec: number;
  memo: string;
  photoUri?: string;
  onClose: () => void;
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
}) => {
  const [photoExpanded, setPhotoExpanded] = useState(false);

  const handleClose = () => {
    setPhotoExpanded(false);
    onClose();
  };

  return (
    <>
      <Modal visible={visible} transparent animationType="fade">
        <Pressable style={styles.backdrop} onPress={handleClose}>
          <Pressable style={styles.card} onPress={() => {}}>
            <View style={styles.header}>
              <Text style={styles.dateText}>{dateLabel}</Text>
              <Pressable onPress={handleClose} hitSlop={12}>
                <Text style={styles.close}>×</Text>
              </Pressable>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>勉強時間</Text>
              <Text style={styles.value}>{formatDuration(durationSec)}</Text>
            </View>

            <View style={[styles.row, { marginTop: 10 }]}>
              <Text style={styles.label}>メモ</Text>
              <Text style={styles.memo}>{memo}</Text>
            </View>

            {photoUri ? (
              <View style={[styles.row, { marginTop: 12 }]}>
                <Text style={styles.label}>写真</Text>
                <Pressable
                  style={styles.photoFrame}
                  onPress={() => setPhotoExpanded(true)}
                >
                  <Image source={{ uri: photoUri }} style={styles.photo} resizeMode="cover" />
                </Pressable>
              </View>
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>

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

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 22,
  },
  card: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  dateText: {
    fontSize: 14,
    fontWeight: Platform.select({ ios: '700', android: '700' }),
    color: '#111827',
  },
  close: {
    fontSize: 18,
    color: '#6B7280',
    fontWeight: Platform.select({ ios: '700', android: '700' }),
  },

  row: {},
  label: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 6,
    fontWeight: Platform.select({ ios: '600', android: '600' }),
  },
  value: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: Platform.select({ ios: '800', android: '800' }),
  },
  memo: {
    fontSize: 13,
    color: '#111827',
    fontWeight: Platform.select({ ios: '600', android: '600' }),
  },

  photoFrame: {
    width: '100%',
    height: 160,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
  },
  photo: {
    width: '100%',
    height: '100%',
  },

  expandedBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  expandedPhoto: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height * 0.8,
  },
});
