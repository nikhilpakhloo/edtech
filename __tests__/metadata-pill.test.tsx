import { render } from "@testing-library/react-native";

import { MetadataPill } from "@/components/media/MetadataPill";

jest.mock("@/theme/AppTheme", () => ({
  useAppTheme: () => ({
    colors: {
      border: "#E5E7EB",
      text: "#111827",
    },
    isDark: false,
  }),
}));

describe("<MetadataPill />", () => {
  it("renders the metadata label", async () => {
    const { getByText } = await render(<MetadataPill label="English" />);

    expect(getByText("English")).toBeTruthy();
  });
});
