import { Platform } from 'react-native';

export function getTabBarContentPadding(bottomInset: number) {
  const minimumBottomInset = Platform.OS === 'ios' ? 24 : 12;
  const safeBottom = Math.max(bottomInset, minimumBottomInset);

  return 64 + safeBottom + 24;
}
