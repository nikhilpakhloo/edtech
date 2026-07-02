import * as Haptics from "expo-haptics";

function successHaptic() {
  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
    () => undefined,
  );
}

export function selectionHaptic() {
  successHaptic();
}

export function impactHaptic(_style?: Haptics.ImpactFeedbackStyle) {
  successHaptic();
}

export function toggleHaptic(_isOn?: boolean) {
  successHaptic();
}
