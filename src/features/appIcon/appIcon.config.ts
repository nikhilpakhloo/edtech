import { getAppIcon, setAppIcon } from "@mozzius/expo-dynamic-app-icon";

export type AppIconId = "education" | "graduate" | "thesis";

export interface AppIconOption {
  id: AppIconId;
  label: string;
  description: string;
  previewAsset: any;
}

export const APP_ICON_OPTIONS: AppIconOption[] = [
  {
    id: "education",
    label: "EdStream",
    description: "Learning without limits",
    previewAsset: require("../../../assets/appIcon/education.png"),
  },
  {
    id: "graduate",
    label: "Graduate",
    description: "For focused learners",
    previewAsset: require("../../../assets/appIcon/graduate.png"),
  },
  {
    id: "thesis",
    label: "Thesis",
    description: "Premium gold edition",
    previewAsset: require("../../../assets/appIcon/thesis.png"),
  },
];

export function getSelectedAppIconId(): AppIconId {
  const current = getAppIcon();
  if (!current || current === "DEFAULT") {
    return "education";
  }
  return current as AppIconId;
}

export function getAppIconOption(iconId: AppIconId): AppIconOption {
  return APP_ICON_OPTIONS.find((icon) => icon.id === iconId) || APP_ICON_OPTIONS[0];
}

export function selectAppIcon(iconId: AppIconId): boolean {
  try {
    const result = setAppIcon(iconId);
    return result !== false;
  } catch (e) {
    return false;
  }
}
