import { router, type Href } from 'expo-router';
import { useCallback } from 'react';
import type { ListRenderItem } from 'react-native';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';
import { Button } from 'react-native-paper';

import { HeroBanner } from '@/components/media/HeroBanner';
import { MediaRail } from '@/components/media/MediaRail';
import { Screen } from '@/components/layout/Screen';
import { useHomeFeed } from '@/features/home/hooks/useHomeFeed';
import type { MediaItem, MediaRail as MediaRailType } from '@/types/media';
import { HOME_FEED_LIST_PROPS } from '@/utils/listPerf';

export default function HomeScreen() {
  const { data, error, isLoading, retry } = useHomeFeed();

  const handleSelectMedia = useCallback((item: MediaItem) => {
    router.push({
      pathname: '/detail/[mediaId]',
      params: { mediaId: item.id },
    } as unknown as Href);
  }, []);

  const renderRail = useCallback<ListRenderItem<MediaRailType>>(
    ({ item }) => <MediaRail rail={item} onSelectMedia={handleSelectMedia} />,
    [handleSelectMedia],
  );

  if (isLoading) {
    return (
      <Screen edges={['top', 'left', 'right']}>
        <View className="flex-1 items-center justify-center px-5">
          <ActivityIndicator color="#4F8CFF" size="large" />
          <Text className="mt-4 text-base font-semibold text-white">Loading EdStream</Text>
          <Text className="mt-1 text-center text-sm text-slate-400">
            Preparing your personalized media rails.
          </Text>
        </View>
      </Screen>
    );
  }

  if (error || !data) {
    return (
      <Screen edges={['top', 'left', 'right']}>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center text-2xl font-bold text-white">Feed unavailable</Text>
          <Text className="mt-2 text-center text-base text-slate-400">
            {error ?? 'No content was returned.'}
          </Text>
          <Button mode="contained" buttonColor="#4F8CFF" className="mt-5" onPress={retry}>
            Try Again
          </Button>
        </View>
      </Screen>
    );
  }

  return (
    <Screen edges={['left', 'right']}>
      <FlatList
        {...HOME_FEED_LIST_PROPS}
        data={data.rails}
        keyExtractor={(rail) => rail.id}
        renderItem={renderRail}
        ListHeaderComponent={<HeroBanner item={data.hero} />}
        contentContainerStyle={{ paddingBottom: 110 }}
      />
    </Screen>
  );
}
