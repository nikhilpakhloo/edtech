import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/theme/tokens';

const BASE_TAB_BAR_HEIGHT = 64;
const IOS_TAB_BAR_HEIGHT = 64;
const MIN_ANDROID_BOTTOM_PADDING = 12;
const MIN_IOS_BOTTOM_PADDING = 24;

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const bottomPadding =
    Platform.OS === 'ios'
      ? Math.max(insets.bottom, MIN_IOS_BOTTOM_PADDING)
      : Math.max(insets.bottom, MIN_ANDROID_BOTTOM_PADDING);
  const tabBarHeight =
    Platform.OS === 'ios'
      ? IOS_TAB_BAR_HEIGHT + bottomPadding
      : BASE_TAB_BAR_HEIGHT + bottomPadding;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.dark.text,
        tabBarInactiveTintColor: colors.dark.textMuted,
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          height: tabBarHeight,
          paddingTop: 10,
          paddingBottom: bottomPadding,
          borderTopColor: colors.dark.border,
          borderTopWidth: 1,
          backgroundColor: colors.dark.surface,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" color={String(color)} size={size + 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle" color={String(color)} size={size + 3} />
          ),
        }}
      />
    </Tabs>
  );
}
