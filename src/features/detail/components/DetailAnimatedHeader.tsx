import { Text, View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type DetailAnimatedHeaderProps = {
  title: string;
  scrollY: SharedValue<number>;
};

export function DetailAnimatedHeader({
  title,
  scrollY,
}: DetailAnimatedHeaderProps) {
  const insets = useSafeAreaInsets();
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
      className="overflow-hidden bg-brand-ink"
      style={{ height: expandedHeight }}
    >
      <Animated.View
        pointerEvents="none"
        className="absolute inset-0 border-b border-white/5 bg-brand-ink px-5"
        style={idleStyle}
      >
        <View
          className="flex-row items-center"
          style={{ paddingTop: insets.top + 14 }}
        >
          <View className="h-8 w-8 items-center justify-center rounded-md bg-white">
            <Text className="text-base font-black text-brand-blue">E</Text>
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-sm font-black text-white">EdStream</Text>
            <Text className="mt-0.5 text-[11px] font-bold uppercase tracking-[1.6px] text-brand-cyan">
              Now watching
            </Text>
          </View>
        </View>
      </Animated.View>
      <Animated.View
        pointerEvents="none"
        className="h-full border-b border-white/10 bg-brand-ink/90 px-5"
        style={headerStyle}
      >
        <Text
          numberOfLines={1}
          className="text-xl font-black text-white"
          style={{ paddingTop: insets.top + 18 }}
        >
          {title}
        </Text>
      </Animated.View>
    </Animated.View>
  );
}
