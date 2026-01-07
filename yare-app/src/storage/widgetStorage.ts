import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "../config/constants";
import { WidgetState } from "../domain/models";

const defaultWidget: WidgetState = {
  today: {
    date: "",
    completed: false,
    currentStreak: 0,
  },
};

export async function getWidgetState(): Promise<WidgetState> {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEYS.widget);
    if (!json) return defaultWidget;
    return { ...defaultWidget, ...(JSON.parse(json) as WidgetState) };
  } catch (e) {
    console.warn("getWidgetState error", e);
    return defaultWidget;
  }
}

export async function saveWidgetState(state: WidgetState): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.widget, JSON.stringify(state));
  } catch (e) {
    console.warn("saveWidgetState error", e);
  }
}
