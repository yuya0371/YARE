import React, { useMemo, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Pressable,
  Image,
  Alert,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Camera, CheckCircle } from 'lucide-react-native';

import { completeToday } from '../domain/completeToday';
import { useTheme } from '../theme/useTheme';

type FinishParams = { durationSec?: string };

const formatDuration = (sec: number): string => {
  if (sec < 60) return `${sec}秒`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return s > 0 ? `${m}分${s}秒` : `${m}分`;
};

export default function TaskFinishScreen() {
  const { durationSec } = useLocalSearchParams<FinishParams>();
  const { colors, isDark } = useTheme();

  const sec = useMemo(() => {
    const n = Number(durationSec ?? '0');
    return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
  }, [durationSec]);

  const [memo, setMemo] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const durationLabel = useMemo(() => formatDuration(sec), [sec]);

  const pickPhoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('写真へのアクセスが必要だよ', '設定から写真アクセスを許可してね');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.9,
    });

    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const onComplete = async () => {
    Keyboard.dismiss();

    const trimmed = memo.trim();
    if (trimmed.length < 1) {
      Alert.alert('メモが必要だよ', '1文字以上でOK。ひとことで残そ。');
      return;
    }

    setSaving(true);
    try {
      await completeToday({
        durationSec: sec,
        memo: trimmed,
        photoUri: photoUri ?? undefined,
      });

      router.replace('/');
    } catch (e) {
      Alert.alert('保存に失敗した…', 'もう一回やってみて');
    } finally {
      setSaving(false);
    }
  };

  const onCancel = () => {
    Keyboard.dismiss();
    router.back();
  };

  const styles = createStyles(colors, isDark);

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <ScrollView
            contentContainerStyle={styles.screen}
            keyboardShouldPersistTaps="handled"
          >
            {/* Success Header */}
            <View style={styles.header}>
              <View style={styles.checkCircle}>
                <CheckCircle size={40} color={colors.success} />
              </View>
              <Text style={styles.title}>お疲れさま!</Text>
              <Text style={styles.subTitle}>{durationLabel} 勉強したね</Text>
            </View>

            {/* Memo Input */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>今日やったことをひとことで</Text>
              <View style={styles.memoBox}>
                <TextInput
                  value={memo}
                  onChangeText={setMemo}
                  placeholder="例：英単語10個覚えた"
                  placeholderTextColor={colors.textMuted}
                  multiline
                  style={styles.memoInput}
                  blurOnSubmit={false}
                />
              </View>
            </View>

            {/* Photo Input */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>写真（任意）</Text>
              <Pressable onPress={pickPhoto} style={styles.photoBox}>
                {photoUri ? (
                  <Image source={{ uri: photoUri }} style={styles.photoPreview} />
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <Camera size={28} color={colors.textMuted} />
                    <Text style={styles.photoText}>タップして写真を追加</Text>
                  </View>
                )}
              </Pressable>
            </View>

            {/* Action Buttons */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={onComplete}
              disabled={saving}
              style={[styles.doneButton, saving && styles.doneButtonDisabled]}
            >
              <Text style={styles.doneButtonText}>{saving ? '保存中…' : '完了'}</Text>
            </TouchableOpacity>

            <Pressable onPress={onCancel} style={styles.cancel}>
              <Text style={styles.cancelText}>キャンセル</Text>
            </Pressable>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (
  colors: ReturnType<typeof import('../theme/useTheme').useTheme>['colors'],
  isDark: boolean
) =>
  StyleSheet.create({
    flex: { flex: 1 },
    safe: { flex: 1, backgroundColor: colors.background },

    screen: {
      paddingHorizontal: 24,
      paddingTop: 40,
      paddingBottom: 40,
    },

    header: {
      alignItems: 'center',
      marginBottom: 32,
    },
    checkCircle: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.successMuted,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    title: {
      fontSize: 26,
      textAlign: 'center',
      fontWeight: Platform.select({ ios: '800', android: '800' }),
      color: colors.text,
    },
    subTitle: {
      marginTop: 8,
      fontSize: 16,
      textAlign: 'center',
      color: colors.textSecondary,
    },

    section: {
      marginBottom: 20,
    },
    sectionLabel: {
      fontSize: 14,
      color: colors.textSecondary,
      fontWeight: Platform.select({ ios: '600', android: '600' }),
      marginBottom: 10,
    },

    memoBox: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      backgroundColor: colors.surface,
      padding: 14,
      minHeight: 120,
    },
    memoInput: {
      fontSize: 16,
      color: colors.text,
      textAlignVertical: 'top',
      minHeight: 92,
    },

    photoBox: {
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: colors.border,
      borderRadius: 14,
      backgroundColor: colors.surface,
      height: 160,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    photoPlaceholder: {
      alignItems: 'center',
      gap: 8,
    },
    photoText: {
      fontSize: 14,
      color: colors.textMuted,
    },
    photoPreview: {
      width: '100%',
      height: 160,
    },

    doneButton: {
      marginTop: 8,
      backgroundColor: colors.primary,
      borderRadius: 16,
      paddingVertical: 18,
      alignItems: 'center',
      justifyContent: 'center',
    },
    doneButtonDisabled: { opacity: 0.6 },
    doneButtonText: {
      color: '#FFFFFF',
      fontSize: 17,
      fontWeight: Platform.select({ ios: '700', android: '700' }),
    },

    cancel: {
      marginTop: 16,
      paddingVertical: 12,
    },
    cancelText: {
      textAlign: 'center',
      color: colors.textMuted,
      fontSize: 14,
      fontWeight: Platform.select({ ios: '500', android: '500' }),
    },
  });
