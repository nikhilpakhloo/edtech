import { router, type Href } from 'expo-router';
import { useCallback } from 'react';
import type { ListRenderItem } from 'react-native';
import { FlatList, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ErrorState } from '@/components/feedback/ErrorState';
import { HomeSkeleton } from '@/components/feedback/Skeleton';
import { HeroBanner } from '@/components/media/HeroBanner';
import { MediaRail } from '@/components/media/MediaRail';
import { Screen } from '@/components/layout/Screen';
import { useHomeFeed } from '@/features/home/hooks/useHomeFeed';
import type { MediaItem, MediaRail as MediaRailType } from '@/types/media';
import { HOME_FEED_LIST_PROPS } from '@/utils/listPerf';
import { getTabBarContentPadding } from '@/utils/tabBar';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { data, error, isLoading, isRefreshing, refresh, retry } = useHomeFeed();

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
      <Screen edges={['left', 'right']}>
        <HomeSkeleton />
      </Screen>
    );
  }

  if (error || !data) {
    return (
      <Screen edges={['top', 'left', 'right']}>
        <ErrorState
          title="Feed unavailable"
          message={error ?? 'No content was returned.'}
          onRetry={retry}
        />
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
        contentContainerStyle={{ paddingBottom: getTabBarContentPadding(insets.bottom) }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refresh}
            tintColor="#FFFFFF"
            progressBackgroundColor="#10141F"
            colors={['#4F8CFF']}
          />
        }
      />
    </Screen>
  );
}
