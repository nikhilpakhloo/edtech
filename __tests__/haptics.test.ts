import * as Haptics from "expo-haptics";

import { impactHaptic, selectionHaptic, toggleHaptic } from "@/utils/haptics";

jest.mock("expo-haptics", () => ({
  ImpactFeedbackStyle: {
    Light: "light",
  },
  NotificationFeedbackType: {
    Success: "success",
  },
  notificationAsync: jest.fn(() => Promise.resolve()),
}));

describe("haptics helpers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("uses success notification haptics for every app haptic helper", () => {
    selectionHaptic();
    impactHaptic();
    toggleHaptic(true);

    expect(Haptics.notificationAsync).toHaveBeenCalledTimes(3);
    expect(Haptics.notificationAsync).toHaveBeenCalledWith(
      Haptics.NotificationFeedbackType.Success,
    );
  });
});
