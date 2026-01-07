import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "../config/constants";
import { Streak } from "../domain/models";

const defaultStreak: Streak = {
  currentStreak: 0,
  maxStreak: 0,
  cumulativeStreak: 0,
  lastCompletedDate: null,
};

export async function getStreak(): Promise<Streak> {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEYS.streak);
    if (!json) return defaultStreak;
    return { ...defaultStreak, ...(JSON.parse(json) as Streak) };
  } catch (e) {
    console.warn("getStreak error", e);
    return defaultStreak;
  }
}

export async function saveStreak(streak: Streak): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.streak, JSON.stringify(streak));
  } catch (e) {
    console.warn("saveStreak error", e);
  }
}
