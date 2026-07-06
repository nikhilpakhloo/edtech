import AsyncStorage from "@react-native-async-storage/async-storage";

import { DEFAULT_APP_ICON_ID } from "./appIcon.config";
import type { AppIconId } from "./appIcon.types";

const APP_ICON_STORAGE_KEY = "edstream:selectedAppIcon";
const APP_ICON_IDS = new Set<AppIconId>(["default", "focus", "gold"]);

export async function getStoredAppIconId(): Promise<AppIconId> {
  const storedIconId = await AsyncStorage.getItem(APP_ICON_STORAGE_KEY);

  if (storedIconId && APP_ICON_IDS.has(storedIconId as AppIconId)) {
    return storedIconId as AppIconId;
  }

  return DEFAULT_APP_ICON_ID;
}

export async function storeAppIconId(iconId: AppIconId) {
  await AsyncStorage.setItem(APP_ICON_STORAGE_KEY, iconId);
}
