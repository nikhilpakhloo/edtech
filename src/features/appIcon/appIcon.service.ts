import { NativeModules, Platform } from "react-native";

import { APP_ICON_ALIAS_NAMES, getAppIconOption } from "./appIcon.config";
import { getStoredAppIconId, storeAppIconId } from "./appIcon.storage";
import type { AppIconId, AppIconSelectionResult } from "./appIcon.types";

type NativeAppIconModule = {
  isSupported?: () => Promise<boolean>;
  setIcon?: (aliasName: string, allAliasNames: string[]) => Promise<boolean>;
};

const nativeAppIconModule = NativeModules.EdStreamAppIcon as
  | NativeAppIconModule
  | undefined;

export async function getSelectedAppIconId() {
  return getStoredAppIconId();
}

export async function isDynamicAppIconSupported() {
  if (Platform.OS !== "android" || !nativeAppIconModule?.setIcon) {
    return false;
  }

  if (!nativeAppIconModule.isSupported) {
    return true;
  }

  return nativeAppIconModule.isSupported();
}

export async function selectAppIcon(
  iconId: AppIconId,
): Promise<AppIconSelectionResult> {
  const icon = getAppIconOption(iconId);

  if (!icon) {
    return {
      status: "unsupported",
      selectedIconId: await getStoredAppIconId(),
    };
  }

  const supported = await isDynamicAppIconSupported();

  if (!supported) {
    return {
      status: "unsupported",
      selectedIconId: await getStoredAppIconId(),
    };
  }

  await nativeAppIconModule?.setIcon?.(
    icon.androidAliasName,
    APP_ICON_ALIAS_NAMES,
  );
  await storeAppIconId(iconId);

  return {
    status: "supported",
    selectedIconId: iconId,
  };
}
