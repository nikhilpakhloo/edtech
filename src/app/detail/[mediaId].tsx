import { Stack, useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';
import { Button } from 'react-native-paper';

import { Screen } from '@/components/layout/Screen';

export default function DetailScreen() {
  const { mediaId } = useLocalSearchParams<{ mediaId: string }>();

  return (
    <Screen>
      <Stack.Screen options={{ headerShown: false }} />
      <View className="flex-1 px-5 pt-4">
        <View className="h-64 justify-end rounded-lg bg-brand-surface p-5">
          <Text className="text-sm font-semibold uppercase tracking-wider text-brand-blue">
            Detail Shell
          </Text>
          <Text className="mt-2 text-3xl font-bold text-white">{mediaId}</Text>
          <Text className="mt-2 text-base leading-6 text-slate-300">
            Phase 2 will replace this placeholder with a dynamic hero, metadata,
            actions, and related media rails.
          </Text>
          <Button mode="contained" buttonColor="#4F8CFF" textColor="#FFFFFF" className="mt-5">
            Primary Action
          </Button>
        </View>
      </View>
    </Screen>
  );
}
