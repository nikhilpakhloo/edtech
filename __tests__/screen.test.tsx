import { Text } from "react-native";
import { render } from "@testing-library/react-native";

import { Screen } from "@/components/layout/Screen";

jest.mock("@/theme/AppTheme", () => ({
  useAppTheme: () => ({
    colors: {
      background: "#FFFFFF",
    },
  }),
}));

describe("<Screen />", () => {
  it("renders its children", async () => {
    const { getByText } = await render(
      <Screen>
        <Text>Home content</Text>
      </Screen>,
    );

    expect(getByText("Home content")).toBeTruthy();
  });
});
