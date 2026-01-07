import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "../config/constants";
import { Task } from "../domain/models";

export async function getTask(): Promise<Task | null> {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEYS.task);
    if (!json) return null;
    return JSON.parse(json) as Task;
  } catch (e) {
    console.warn("getTask error", e);
    return null;
  }
}

export async function saveTask(task: Task): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.task, JSON.stringify(task));
  } catch (e) {
    console.warn("saveTask error", e);
  }
}
