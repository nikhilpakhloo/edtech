import { fireEvent, render } from "@testing-library/react-native";

import { ErrorState } from "@/components/common/ErrorState";
import { selectionHaptic } from "@/utils/haptics";

jest.mock("@/theme/AppTheme", () => ({
  useAppTheme: () => ({
    colors: {
      primary: "#1F80E0",
      text: "#111827",
      textMuted: "#6B7280",
    },
  }),
}));

jest.mock("@/utils/haptics", () => ({
  selectionHaptic: jest.fn(),
}));

describe("<ErrorState />", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the title and message", async () => {
    const { getByText } = await render(
      <ErrorState title="Feed unavailable" message="Please try again." />,
    );

    expect(getByText("Feed unavailable")).toBeTruthy();
    expect(getByText("Please try again.")).toBeTruthy();
  });

  it("calls haptics and retry handler when the action is pressed", async () => {
    const onRetry = jest.fn();
    const { getByText } = await render(
      <ErrorState
        title="Search unavailable"
        message="Refresh the page."
        actionLabel="Retry"
        onRetry={onRetry}
      />,
    );

    fireEvent.press(getByText("Retry"));

    expect(selectionHaptic).toHaveBeenCalledTimes(1);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
