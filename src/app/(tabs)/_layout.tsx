import { Tabs } from 'expo-router';
import { Platform } from 'react-native';

import { colors } from '@/theme/tokens';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.dark.text,
        tabBarInactiveTintColor: colors.dark.textMuted,
        tabBarStyle: {
          position: 'absolute',
          height: Platform.select({ ios: 84, default: 68 }),
          paddingTop: 8,
          paddingBottom: Platform.select({ ios: 24, default: 10 }),
          borderTopColor: colors.dark.border,
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
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
        }}
      />
    </Tabs>
  );
}
