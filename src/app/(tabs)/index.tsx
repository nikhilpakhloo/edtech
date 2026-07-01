import { router, type Href } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { Button, Chip } from 'react-native-paper';

import { Screen } from '@/components/layout/Screen';

const detailPreviewHref = {
  pathname: '/detail/[mediaId]',
  params: { mediaId: 'phase-1-preview' },
} as unknown as Href;

export default function HomeScreen() {
  return (
    <Screen edges={['top', 'left', 'right']}>
      <View className="flex-1 px-5 pt-4">
        <View className="rounded-lg bg-brand-surface p-5">
          <Chip compact className="self-start bg-brand-elevated" textStyle={{ color: '#AAB4C5' }}>
            Phase 1
          </Chip>
          <Text className="mt-4 text-3xl font-bold text-white">EdStream</Text>
          <Text className="mt-2 text-base leading-6 text-slate-300">
            Expo Router foundation is ready for a Hotstar-inspired home feed.
          </Text>
          <Button
            mode="contained"
            buttonColor="#4F8CFF"
            textColor="#FFFFFF"
            className="mt-5 self-start"
            onPress={() => router.push(detailPreviewHref)}>
            Open Detail Shell
          </Button>
        </View>

        <Pressable className="mt-5 rounded-lg border border-brand-line bg-brand-elevated p-4">
          <Text className="text-sm font-semibold uppercase tracking-wider text-brand-green">
            Next
          </Text>
          <Text className="mt-2 text-lg font-bold text-white">
            Phase 2 adds mock API data, hero banners, and media rails.
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}
