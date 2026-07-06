import type { ImageSourcePropType } from "react-native";

export type AppIconId = "default" | "focus" | "gold";

export type AppIconOption = {
  id: AppIconId;
  label: string;
  description: string;
  previewAsset: ImageSourcePropType;
  previewBackgroundColor: string;
  previewForegroundColor: string;
  androidAliasName: string;
  androidIconDrawable: string;
  androidIconSourceAsset: string;
  defaultEnabled: boolean;
};

export type AppIconSupportStatus = "supported" | "unsupported";

export type AppIconSelectionResult = {
  status: AppIconSupportStatus;
  selectedIconId: AppIconId;
};
