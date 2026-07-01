import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

function canUseHaptics() {
  return Platform.OS === 'ios' || Platform.OS === 'android';
}

export function selectionHaptic() {
  if (!canUseHaptics()) {
    return;
  }

  void Haptics.selectionAsync();
}

export function impactHaptic(style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) {
  if (!canUseHaptics()) {
    return;
  }

  void Haptics.impactAsync(style);
}
