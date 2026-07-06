import rawAppIcons from "./appIcon.registry.json";
import type { AppIconId, AppIconOption } from "./appIcon.types";

const previewAssets: Record<AppIconId, AppIconOption["previewAsset"]> = {
  default: require("../../../assets/appIcon/education.png"),
  focus: require("../../../assets/appIcon/graduate.png"),
  gold: require("../../../assets/appIcon/thesis.png"),
};

export const APP_ICON_OPTIONS = rawAppIcons.map((icon) => ({
  ...icon,
  previewAsset: previewAssets[icon.id as AppIconId],
})) as AppIconOption[];

export const DEFAULT_APP_ICON_ID: AppIconId = "default";

export const APP_ICON_ALIAS_NAMES = APP_ICON_OPTIONS.map(
  (icon) => icon.androidAliasName,
);

export function getAppIconOption(iconId: AppIconId) {
  return APP_ICON_OPTIONS.find((icon) => icon.id === iconId);
}
