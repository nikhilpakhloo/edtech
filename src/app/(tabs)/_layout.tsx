import { Ionicons } from '@expo/vector-icons';
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
          height: Platform.select({ ios: 92, default: 76 }),
          paddingTop: 10,
          paddingBottom: Platform.select({ ios: 28, default: 12 }),
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
