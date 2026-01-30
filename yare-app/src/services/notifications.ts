import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../config/constants';

// 通知のデフォルト設定
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// 通知メッセージのバリエーション
const REMINDER_MESSAGES = [
  { title: '今日はまだYAREてないね', body: '1分だけでいいからやろう！' },
  { title: '今すぐYARE！', body: 'ストリーク消える前に1分だけやろ。' },
  { title: 'ストリーク守ろう', body: '今日もあと少しで終わっちゃうよ。' },
  { title: '今日のYAREは？', body: 'まだ間に合う。1分だけ頑張ろう。' },
];

// 通知ID用のプレフィックス
const NOTIFICATION_ID_PREFIX = 'yare-reminder-';

/**
 * 通知のパーミッションをリクエスト
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('reminders', {
      name: 'リマインダー',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#F97316',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === 'granted';
}

/**
 * 今日のタスクが完了しているかチェック
 */
async function isTodayCompleted(): Promise<boolean> {
  try {
    const recordsJson = await AsyncStorage.getItem(STORAGE_KEYS.records);
    if (!recordsJson) return false;

    const records = JSON.parse(recordsJson);
    const today = new Date();
    const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    return Boolean(records[todayKey]?.completed);
  } catch {
    return false;
  }
}

/**
 * 本日の通知をすべてスケジュール（20:00, 21:00, 22:00, 23:00）
 */
export async function scheduleDailyReminders(): Promise<void> {
  // まず既存の通知をキャンセル
  await cancelAllReminders();

  const now = new Date();
  const hours = [20, 21, 22, 23];

  for (let i = 0; i < hours.length; i++) {
    const hour = hours[i];
    const message = REMINDER_MESSAGES[i];

    // 今日のその時刻を設定
    const triggerDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, 0, 0);

    // すでに過ぎた時刻はスキップ
    if (triggerDate <= now) {
      continue;
    }

    const identifier = `${NOTIFICATION_ID_PREFIX}${hour}`;

    await Notifications.scheduleNotificationAsync({
      identifier,
      content: {
        title: message.title,
        body: message.body,
        sound: true,
        ...(Platform.OS === 'android' && { channelId: 'reminders' }),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
      },
    });
  }
}

/**
 * すべてのリマインダー通知をキャンセル
 */
export async function cancelAllReminders(): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();

  for (const notification of scheduled) {
    if (notification.identifier.startsWith(NOTIFICATION_ID_PREFIX)) {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
    }
  }
}

/**
 * タスク完了時に呼び出し - 残りの通知をキャンセル
 */
export async function onTaskCompleted(): Promise<void> {
  await cancelAllReminders();
}

/**
 * アプリ起動時やフォアグラウンド復帰時に呼び出し
 * - 今日未完了なら通知をスケジュール
 * - 今日完了済みなら通知をキャンセル
 */
export async function syncNotifications(): Promise<void> {
  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) return;

  const completed = await isTodayCompleted();

  if (completed) {
    await cancelAllReminders();
  } else {
    await scheduleDailyReminders();
  }
}

// ============================================
// DEV: テスト用関数
// ============================================

/**
 * DEV: 即時通知を送信（テスト用）
 */
export async function sendTestNotificationNow(): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '今日はまだYAREてないね',
      body: '1分だけでいいからやろう！',
      sound: true,
      ...(Platform.OS === 'android' && { channelId: 'reminders' }),
    },
    trigger: null, // 即時送信
  });
}

/**
 * DEV: 5秒後に通知を送信（テスト用）
 */
export async function sendTestNotificationDelayed(): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '今すぐYARE！',
      body: 'ストリーク消える前に1分だけやろ。',
      sound: true,
      ...(Platform.OS === 'android' && { channelId: 'reminders' }),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 5,
    },
  });
}

/**
 * DEV: スケジュール済み通知を確認
 */
export async function logScheduledNotifications(): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  console.log('=== スケジュール済み通知 ===');
  console.log(`件数: ${scheduled.length}`);
  scheduled.forEach((n, i) => {
    console.log(`[${i + 1}] ID: ${n.identifier}`);
    console.log(`    Title: ${n.content.title}`);
    console.log(`    Trigger:`, n.trigger);
  });
  console.log('===========================');
}

/**
 * 通知タップ時のハンドラを設定
 */
export function setupNotificationListeners(
  onNotificationReceived?: (notification: Notifications.Notification) => void,
  onNotificationResponse?: (response: Notifications.NotificationResponse) => void
): () => void {
  const receivedSubscription = Notifications.addNotificationReceivedListener(
    (notification) => {
      onNotificationReceived?.(notification);
    }
  );

  const responseSubscription = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      onNotificationResponse?.(response);
    }
  );

  return () => {
    receivedSubscription.remove();
    responseSubscription.remove();
  };
}
