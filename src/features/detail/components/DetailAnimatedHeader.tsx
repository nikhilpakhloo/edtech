import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/theme/tokens';

type DetailAnimatedHeaderProps = {
  title: string;
  scrollY: SharedValue<number>;
};

export function DetailAnimatedHeader({ title, scrollY }: DetailAnimatedHeaderProps) {
  const insets = useSafeAreaInsets();

  const headerStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, [120, 220], [0, 1], Extrapolation.CLAMP);
    const translateY = interpolate(scrollY.value, [120, 220], [-8, 0], Extrapolation.CLAMP);

    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  return (
    <Animated.View
      className="absolute left-0 right-0 top-0 z-20 border-b border-brand-line bg-brand-ink/95 px-4"
      style={[{ paddingTop: insets.top + 8, paddingBottom: 12 }, headerStyle]}>
      <View className="flex-row items-center">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          className="h-10 w-10 items-center justify-center rounded-full bg-white/10"
          onPress={() => router.back()}>
          <Ionicons name="chevron-back" color={colors.dark.text} size={24} />
        </Pressable>
        <Text numberOfLines={1} className="ml-3 flex-1 text-base font-black text-white">
          {title}
        </Text>
      </View>
    </Animated.View>
  );
}
