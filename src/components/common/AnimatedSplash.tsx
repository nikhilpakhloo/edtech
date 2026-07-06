import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

import { APP_ICON_OPTIONS, getAppIconOption } from '@/features/appIcon/appIcon.config';
import type { AppIconOption } from '@/features/appIcon/appIcon.types';
import { getSelectedAppIconId } from '@/features/appIcon/appIcon.service';
import { useAppTheme } from '@/theme/AppTheme';

type AnimatedSplashProps = {
  onFinish: () => void;
};

export function AnimatedSplash({ onFinish }: AnimatedSplashProps) {
  const { isDark } = useAppTheme();
  const [selectedAppIcon, setSelectedAppIcon] = useState<AppIconOption>(
    APP_ICON_OPTIONS[0],
  );
  const [containerOpacity] = useState(() => new Animated.Value(1));
  const [logoScale] = useState(() => new Animated.Value(0.82));
  const [logoOpacity] = useState(() => new Animated.Value(0));
  const [ringScale] = useState(() => new Animated.Value(0.75));
  const [ringOpacity] = useState(() => new Animated.Value(0.55));
  const [orbitRotation] = useState(() => new Animated.Value(0));
  const [shineSweep] = useState(() => new Animated.Value(0));
  const [progress] = useState(() => new Animated.Value(0));
  const [titleTranslate] = useState(() => new Animated.Value(12));
  const [titleOpacity] = useState(() => new Animated.Value(0));
  const orbitRotate = orbitRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  const shineTranslate = shineSweep.interpolate({
    inputRange: [0, 1],
    outputRange: [-118, 118],
  });

  useEffect(() => {
    getSelectedAppIconId().then((iconId) => {
      const selectedIcon = getAppIconOption(iconId);

      if (selectedIcon) {
        setSelectedAppIcon(selectedIcon);
      }
    });

    const pulse = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(ringScale, {
            duration: 1100,
            easing: Easing.out(Easing.cubic),
            toValue: 1.24,
            useNativeDriver: true,
          }),
          Animated.timing(ringScale, {
            duration: 0,
            toValue: 0.75,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(ringOpacity, {
            duration: 1100,
            easing: Easing.out(Easing.cubic),
            toValue: 0,
            useNativeDriver: true,
          }),
          Animated.timing(ringOpacity, {
            duration: 0,
            toValue: 0.55,
            useNativeDriver: true,
          }),
        ]),
      ]),
    );
    const orbit = Animated.loop(
      Animated.timing(orbitRotation, {
        duration: 2800,
        easing: Easing.linear,
        toValue: 1,
        useNativeDriver: true,
      }),
    );
    const shine = Animated.loop(
      Animated.sequence([
        Animated.delay(420),
        Animated.timing(shineSweep, {
          duration: 820,
          easing: Easing.inOut(Easing.cubic),
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(shineSweep, {
          duration: 0,
          toValue: 0,
          useNativeDriver: true,
        }),
      ]),
    );

    pulse.start();
    orbit.start();
    shine.start();

    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoOpacity, {
          duration: 360,
          easing: Easing.out(Easing.cubic),
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          damping: 12,
          mass: 0.8,
          stiffness: 120,
          toValue: 1,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(titleOpacity, {
          duration: 460,
          easing: Easing.out(Easing.cubic),
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(titleTranslate, {
          duration: 460,
          easing: Easing.out(Easing.cubic),
          toValue: 0,
          useNativeDriver: true,
        }),
        Animated.timing(progress, {
          duration: 1800,
          easing: Easing.inOut(Easing.cubic),
          toValue: 1,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(320),
      Animated.timing(containerOpacity, {
        duration: 360,
        easing: Easing.out(Easing.cubic),
        toValue: 0,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      pulse.stop();
      orbit.stop();
      shine.stop();
      if (finished) {
        onFinish();
      }
    });

    return () => {
      pulse.stop();
      orbit.stop();
      shine.stop();
    };
  }, [
    containerOpacity,
    logoOpacity,
    logoScale,
    onFinish,
    orbitRotation,
    progress,
    ringOpacity,
    ringScale,
    shineSweep,
    titleOpacity,
    titleTranslate,
  ]);

  return (
    <Animated.View
      pointerEvents="auto"
      className="absolute inset-0 z-[999]"
      style={{ opacity: containerOpacity }}>
      <View
        className="absolute inset-0"
        style={{ backgroundColor: isDark ? '#030712' : '#FFFFFF' }}
      />
      <View className="flex-1 items-center justify-center px-8">
        <View className="mb-2 h-[150px] w-[150px] items-center justify-center">
          <Animated.View
            className="absolute h-[138px] w-[138px] items-center justify-center"
            style={{
              opacity: titleOpacity,
              transform: [{ rotate: orbitRotate }],
            }}>
            <View className="absolute top-0 h-3 w-3 rounded-sm bg-brand-cyan" />
            <View className="absolute bottom-0 h-2.5 w-2.5 rounded-sm bg-brand-gold" />
            <View className="absolute left-0 h-2 w-2 rounded-sm bg-brand-blue" />
            <View className="absolute right-0 h-2 w-2 rounded-sm bg-brand-green" />
          </Animated.View>
          <Animated.View
            className="absolute h-[116px] w-[116px] rounded-full border-2 border-brand-cyan/60"
            style={[
              {
                opacity: ringOpacity,
                transform: [{ scale: ringScale }],
              },
            ]}
          />
          <Animated.View
            className="h-24 w-24 overflow-hidden rounded-3xl"
            style={[
              styles.logoShadow,
              {
                opacity: logoOpacity,
                transform: [{ scale: logoScale }],
              },
            ]}>
            <LinearGradient
              colors={isDark ? ['#07101F', '#0D1830'] : ['#FFFFFF', '#E8F1FF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="flex-1 items-center justify-center">
              <Animated.View
                className="absolute bottom-0 top-0 w-8 bg-white/30"
                style={{
                  transform: [{ translateX: shineTranslate }, { rotate: '18deg' }],
                }}
              />
              <Image
                source={selectedAppIcon.previewAsset}
                contentFit="contain"
                style={styles.splashIcon}
              />
            </LinearGradient>
          </Animated.View>
        </View>

        <Animated.View
          style={{
            opacity: titleOpacity,
            transform: [{ translateY: titleTranslate }],
          }}>
          <Text
            className="text-center text-[34px] font-black"
            style={{ color: isDark ? '#FFFFFF' : '#101828' }}>
            {selectedAppIcon.label}
          </Text>
          <Text className="mt-1.5 text-center text-[13px] font-extrabold uppercase text-[#00A6D6]">
            {selectedAppIcon.description}
          </Text>
        </Animated.View>

        <View className="mt-7 h-1 w-[168px] overflow-hidden rounded-full bg-slate-400/25">
          <Animated.View
            className="h-1 w-full rounded-full bg-brand-cyan"
            style={{ transform: [{ scaleX: progress }], transformOrigin: 'left' }}
          />
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  logoShadow: {
    elevation: 12,
    shadowColor: '#1F80E0',
    shadowOffset: { height: 10, width: 0 },
    shadowOpacity: 0.28,
    shadowRadius: 22,
  },
  splashIcon: {
    height: 72,
    width: 72,
  },
});
