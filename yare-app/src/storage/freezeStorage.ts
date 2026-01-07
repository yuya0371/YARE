import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "../config/constants";
import { Freeze } from "../domain/models";

const defaultFreeze: Freeze = {
  availableCount: 0,
  lastResetMonth: "",
  equipped: false,
};

export async function getFreeze(): Promise<Freeze> {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEYS.freeze);
    if (!json) return defaultFreeze;
    return { ...defaultFreeze, ...(JSON.parse(json) as Freeze) };
  } catch (e) {
    console.warn("getFreeze error", e);
    return defaultFreeze;
  }
}

export async function saveFreeze(freeze: Freeze): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.freeze, JSON.stringify(freeze));
  } catch (e) {
    console.warn("saveFreeze error", e);
  }
}
