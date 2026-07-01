import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

function canUseHaptics() {
  return Platform.OS === 'ios' || Platform.OS === 'android';
}

function androidHaptic(type: Haptics.AndroidHaptics) {
  void Haptics.performAndroidHapticsAsync(type).catch(() => undefined);
}

export function selectionHaptic() {
  if (!canUseHaptics()) {
    return;
  }

  if (Platform.OS === 'android') {
    androidHaptic(Haptics.AndroidHaptics.Context_Click);
    return;
  }

  void Haptics.selectionAsync().catch(() => undefined);
}

export function impactHaptic(style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) {
  if (!canUseHaptics()) {
    return;
  }

  if (Platform.OS === 'android') {
    androidHaptic(Haptics.AndroidHaptics.Long_Press);
    return;
  }

  void Haptics.impactAsync(style).catch(() => undefined);
}

export function toggleHaptic(isOn: boolean) {
  if (!canUseHaptics()) {
    return;
  }

  if (Platform.OS === 'android') {
    androidHaptic(isOn ? Haptics.AndroidHaptics.Toggle_On : Haptics.AndroidHaptics.Toggle_Off);
    return;
  }

  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
}
