import { render } from "@testing-library/react-native";

import { EmptyState } from "@/components/feedback/EmptyState";

jest.mock("@/theme/AppTheme", () => ({
  useAppTheme: () => ({
    colors: {
      border: "#E5E7EB",
      surface: "#FFFFFF",
      text: "#111827",
      textMuted: "#6B7280",
    },
    isDark: false,
  }),
}));

describe("<EmptyState />", () => {
  it("renders the provided title and message", async () => {
    const { getByText } = await render(
      <EmptyState title="No lessons yet" message="Try another learning topic." />,
    );

    expect(getByText("No lessons yet")).toBeTruthy();
    expect(getByText("Try another learning topic.")).toBeTruthy();
  });
});
