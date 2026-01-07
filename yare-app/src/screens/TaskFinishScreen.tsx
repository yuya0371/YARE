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

import { completeToday } from '../domain/completeToday';

type FinishParams = { durationSec?: string };

export default function TaskFinishScreen() {
  const { durationSec } = useLocalSearchParams<FinishParams>();

  const sec = useMemo(() => {
    const n = Number(durationSec ?? '0');
    return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
  }, [durationSec]);

  const [memo, setMemo] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const durationLabel = useMemo(() => `${sec}秒 勉強したね`, [sec]);

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

      router.replace('/'); // 保存後ホームへ
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
            <Text style={styles.emoji}>🎉</Text>
            <Text style={styles.title}>お疲れさま！</Text>
            <Text style={styles.subTitle}>{durationLabel}</Text>

            <Text style={styles.sectionLabel}>今日やったことをひとことで残そ。</Text>
            <View style={styles.memoBox}>
              <TextInput
                value={memo}
                onChangeText={setMemo}
                placeholder="例：英単語10個覚えた"
                placeholderTextColor="#9CA3AF"
                multiline
                style={styles.memoInput}
                blurOnSubmit={false}
              />
            </View>

            <Text style={[styles.sectionLabel, { marginTop: 16 }]}>写真（任意）</Text>
            <Pressable onPress={pickPhoto} style={styles.photoBox}>
              {photoUri ? (
                <Image source={{ uri: photoUri }} style={styles.photoPreview} />
              ) : (
                <>
                  <Text style={styles.photoIcon}>📷</Text>
                  <Text style={styles.photoText}>写真を追加</Text>
                </>
              )}
            </Pressable>

            <TouchableOpacity
              activeOpacity={0.9}
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

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safe: { flex: 1, backgroundColor: '#EEF2FF' },

  screen: {
    paddingHorizontal: 22,
    paddingTop: 54,
    paddingBottom: 40,
  },

  emoji: { fontSize: 30, textAlign: 'center', marginBottom: 10 },
  title: {
    fontSize: 22,
    textAlign: 'center',
    fontWeight: Platform.select({ ios: '800', android: '800' }),
    color: '#111827',
  },
  subTitle: {
    marginTop: 6,
    fontSize: 13,
    textAlign: 'center',
    color: '#6B7280',
    marginBottom: 22,
  },

  sectionLabel: {
    fontSize: 13,
    color: '#374151',
    fontWeight: Platform.select({ ios: '600', android: '600' }),
    marginBottom: 10,
  },

  memoBox: {
    borderWidth: 2,
    borderColor: '#F97316',
    borderRadius: 12,
    backgroundColor: '#fff',
    padding: 12,
    minHeight: 120,
  },
  memoInput: {
    fontSize: 16,
    color: '#111827',
    textAlignVertical: 'top',
    minHeight: 96,
  },

  photoBox: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#F97316',
    borderRadius: 12,
    backgroundColor: '#fff',
    minHeight: 120,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  photoIcon: { fontSize: 22, marginBottom: 6 },
  photoText: { fontSize: 13, color: '#6B7280' },
  photoPreview: { width: '100%', height: '100%' },

  doneButton: {
    marginTop: 18,
    backgroundColor: '#F97316',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneButtonDisabled: { opacity: 0.7 },
  doneButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: Platform.select({ ios: '800', android: '800' }),
  },

  cancel: { marginTop: 14, paddingVertical: 10 },
  cancelText: { textAlign: 'center', color: '#6B7280', fontSize: 13 },
});
