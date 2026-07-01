import { Text, View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAppTheme } from "@/theme/AppTheme";

type DetailAnimatedHeaderProps = {
  title: string;
  scrollY: SharedValue<number>;
};

export function DetailAnimatedHeader({
  title,
  scrollY,
}: DetailAnimatedHeaderProps) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();
  const expandedHeight = insets.top + 56;

  const idleStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, 54],
      [1, 0],
      Extrapolation.CLAMP,
    );
    const translateY = interpolate(
      scrollY.value,
      [0, 54],
      [0, -6],
      Extrapolation.CLAMP,
    );

    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  const headerStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [28, 88],
      [0, 1],
      Extrapolation.CLAMP,
    );
    const translateY = interpolate(
      scrollY.value,
      [28, 88],
      [-8, 0],
      Extrapolation.CLAMP,
    );

    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  return (
    <Animated.View
      className="overflow-hidden"
      style={{ backgroundColor: colors.background, height: expandedHeight }}
    >
      <Animated.View
        pointerEvents="none"
        className="absolute inset-0 border-b px-5"
        style={[
          idleStyle,
          {
            backgroundColor: colors.background,
            borderBottomColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(15,23,42,0.1)",
          },
        ]}
      >
        <View
          className="flex-row items-center"
          style={{ paddingTop: insets.top + 14 }}
        >
          <View className="h-8 w-8 items-center justify-center rounded-md bg-white">
            <Text className="text-base font-black text-brand-blue">E</Text>
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-sm font-black" style={{ color: colors.text }}>
              EdStream
            </Text>
            <Text className="mt-0.5 text-[11px] font-bold uppercase tracking-[1.6px] text-brand-cyan">
              Now watching
            </Text>
          </View>
        </View>
      </Animated.View>
      <Animated.View
        pointerEvents="none"
        className="h-full border-b px-5"
        style={[
          headerStyle,
          {
            backgroundColor: isDark ? "rgba(3,7,18,0.94)" : "rgba(255,255,255,0.94)",
            borderBottomColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(15,23,42,0.12)",
          },
        ]}
      >
        <Text
          numberOfLines={1}
          className="text-xl font-black"
          style={{ color: colors.text, paddingTop: insets.top + 18 }}
        >
          {title}
        </Text>
      </Animated.View>
    </Animated.View>
  );
}
