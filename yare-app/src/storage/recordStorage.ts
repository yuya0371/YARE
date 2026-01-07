import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "../config/constants";
import { RecordMap, Record } from "../domain/models";

// RecordMap は { [date: string]: Record } みたいな型を想定

async function loadRecordMap(): Promise<RecordMap> {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEYS.records);
    if (!json) return {};
    return JSON.parse(json) as RecordMap;
  } catch (e) {
    console.warn("loadRecordMap error", e);
    return {};
  }
}

async function saveRecordMap(map: RecordMap): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.records, JSON.stringify(map));
  } catch (e) {
    console.warn("saveRecordMap error", e);
  }
}

export async function getRecords(): Promise<RecordMap> {
  return loadRecordMap();
}

export async function saveRecord(record: Record): Promise<void> {
  const map = await loadRecordMap();
  map[record.date] = record;
  await saveRecordMap(map);
}
