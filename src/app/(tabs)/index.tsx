import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, type Href } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import type { ListRenderItem } from 'react-native';
import {
  Dimensions,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ErrorState } from '@/components/feedback/ErrorState';
import { HomeSkeleton } from '@/components/feedback/Skeleton';
import { MediaRail } from '@/components/media/MediaRail';
import { Screen } from '@/components/layout/Screen';
import { useHomeFeed } from '@/features/home/hooks/useHomeFeed';
import type { MediaItem, MediaRail as MediaRailType } from '@/types/media';
import { HOME_FEED_LIST_PROPS } from '@/utils/listPerf';
import { getTabBarContentPadding } from '@/utils/tabBar';

type HomeMode = 'learn' | 'practice';

const SCREEN_WIDTH = Dimensions.get('window').width;
const FOR_YOU_CARD_WIDTH = Math.min(SCREEN_WIDTH - 72, 330);
const FOR_YOU_CARD_HEIGHT = 244;
const FOR_YOU_SIDE_PADDING = Math.max((SCREEN_WIDTH - FOR_YOU_CARD_WIDTH) / 2, 20);
const FOR_YOU_SNAP_INTERVAL = FOR_YOU_CARD_WIDTH + 18;

const MODE_OPTIONS: {
  id: HomeMode;
  label: string;
  eyebrow: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  {
    id: 'learn',
    label: 'Learn',
    eyebrow: 'Courses & stories',
    icon: 'school',
  },
  {
    id: 'practice',
    label: 'Practice',
    eyebrow: 'Live drills & exams',
    icon: 'flash',
  },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [activeMode, setActiveMode] = useState<HomeMode>('learn');
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

  const modeFeed = useMemo(() => {
    if (!data) {
      return null;
    }

    const byId = data.rails.flatMap((rail) => rail.items).reduce<Record<string, MediaItem>>(
      (acc, item) => {
        acc[item.id] = item;
        return acc;
      },
      { [data.hero.id]: data.hero },
    );

    if (activeMode === 'practice') {
      return {
        hero: byId['math-premier-league'] ?? data.hero,
        carousel: [
          byId['math-premier-league'],
          byId['exam-mode'],
          byId['startup-casefiles'],
          byId['code-with-creators'],
        ].filter(Boolean) as MediaItem[],
        rails: [
          {
            id: 'live-and-practice',
            title: 'Live Practice Arenas',
            subtitle: 'Challenges, revision, and competition-ready sessions',
            items: [
              byId['math-premier-league'],
              byId['exam-mode'],
              byId['startup-casefiles'],
            ].filter(Boolean) as MediaItem[],
          },
          {
            id: 'skill-sprints',
            title: 'Skill Sprints',
            subtitle: 'Short tracks for sharper daily progress',
            items: [
              byId['code-with-creators'],
              byId['react-native-shiproom'],
              byId['design-systems-lab'],
            ].filter(Boolean) as MediaItem[],
          },
          ...data.rails.filter((rail) => rail.id === 'trending-now'),
        ],
      };
    }

    return {
      hero: data.hero,
      carousel: [
        data.hero,
        byId['design-systems-lab'],
        byId['react-native-shiproom'],
        byId['history-in-motion'],
      ].filter(Boolean) as MediaItem[],
      rails: [
        ...data.rails.filter((rail) =>
          ['continue-learning', 'frontend-masters', 'documentary-picks'].includes(rail.id),
        ),
      ],
    };
  }, [activeMode, data]);

  if (isLoading) {
    return (
      <Screen edges={['left', 'right']}>
        <HomeSkeleton />
      </Screen>
    );
  }

  if (error || !data || !modeFeed) {
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
        data={modeFeed.rails}
        keyExtractor={(rail) => rail.id}
        renderItem={renderRail}
        ListHeaderComponent={
          <HomeTopExperience
            activeMode={activeMode}
            carouselItems={modeFeed.carousel}
            hero={modeFeed.hero}
            onSelectMedia={handleSelectMedia}
            onSelectMode={setActiveMode}
          />
        }
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

type HomeTopExperienceProps = {
  activeMode: HomeMode;
  hero: MediaItem;
  carouselItems: MediaItem[];
  onSelectMode: (mode: HomeMode) => void;
  onSelectMedia: (item: MediaItem) => void;
};

function HomeTopExperience({
  activeMode,
  hero,
  carouselItems,
  onSelectMode,
  onSelectMedia,
}: HomeTopExperienceProps) {
  const renderCarouselItem = useCallback<ListRenderItem<MediaItem>>(
    ({ item, index }) => (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Open ${item.title}`}
        className="mr-4"
        style={styles.snapCardWrap}
        onPress={() => onSelectMedia(item)}>
        <View style={[styles.stackLayer, styles.stackLayerBack]} />
        <View style={[styles.stackLayer, styles.stackLayerMid]} />
        <View className="overflow-hidden rounded-lg border border-white/10 bg-brand-surface">
          <Image
            source={{ uri: item.backdropUrl }}
            cachePolicy="disk"
            contentFit="cover"
            transition={180}
            style={styles.snapImage}
          />
          <View className="absolute inset-0 bg-black/25" />
          <View className="absolute bottom-0 left-0 right-0 bg-brand-ink/80 px-4 py-3">
            <Text className="text-[11px] font-black uppercase tracking-[1.5px] text-brand-cyan">
              #{index + 1} for you
            </Text>
            <Text numberOfLines={1} className="mt-1 text-lg font-black text-white">
              {item.title}
            </Text>
          </View>
        </View>
      </Pressable>
    ),
    [onSelectMedia],
  );

  return (
    <View className="pb-2 pt-14">
      <View className="px-5">
        <View className="mb-5 flex-row gap-3">
          {MODE_OPTIONS.map((option) => {
            const isActive = option.id === activeMode;

            return (
              <Pressable
                key={option.id}
                accessibilityRole="button"
                accessibilityState={{ selected: isActive }}
                className={`flex-1 rounded-lg border p-3 ${
                  isActive
                    ? 'border-brand-cyan bg-brand-blue'
                    : 'border-white/10 bg-brand-surface'
                }`}
                onPress={() => onSelectMode(option.id)}>
                <View className="flex-row items-center">
                  <View
                    className={`h-9 w-9 items-center justify-center rounded-md ${
                      isActive ? 'bg-white' : 'bg-white/10'
                    }`}>
                    <Ionicons
                      name={option.icon}
                      color={isActive ? '#1F80E0' : '#FFFFFF'}
                      size={19}
                    />
                  </View>
                  <View className="ml-3 flex-1">
                    <Text className="text-base font-black text-white">{option.label}</Text>
                    <Text
                      numberOfLines={1}
                      className={isActive ? 'text-xs font-bold text-white' : 'text-xs text-slate-400'}>
                      {option.eyebrow}
                    </Text>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Open ${hero.title}`}
          className="overflow-hidden rounded-lg border border-white/10 bg-brand-surface"
          onPress={() => onSelectMedia(hero)}>
          <Image
            source={{ uri: hero.backdropUrl }}
            cachePolicy="disk"
            contentFit="cover"
            transition={200}
            style={styles.bannerImage}
          />
          <View className="absolute inset-0 bg-black/25" />
          <View className="absolute bottom-0 left-0 right-0 bg-brand-ink/85 px-4 py-4">
            <Text className="text-[11px] font-black uppercase tracking-[1.8px] text-brand-gold">
              {activeMode === 'learn' ? 'Featured lesson' : 'Featured challenge'}
            </Text>
            <Text numberOfLines={2} className="mt-1 text-2xl font-black text-white">
              {hero.title}
            </Text>
            <Text numberOfLines={2} className="mt-2 text-sm leading-5 text-slate-300">
              {hero.description}
            </Text>
          </View>
        </Pressable>
      </View>

      <View className="mt-6">
        <View className="mb-3 px-5">
          <Text className="text-xl font-black text-white">For You</Text>
          <Text className="mt-1 text-sm text-slate-400">
            Swipe through curated {activeMode === 'learn' ? 'learning journeys' : 'practice picks'}
          </Text>
        </View>
        <FlatList
          data={carouselItems}
          horizontal
          keyExtractor={(item) => item.id}
          renderItem={renderCarouselItem}
          snapToInterval={FOR_YOU_SNAP_INTERVAL}
          snapToAlignment="center"
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.snapList}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bannerImage: {
    height: 260,
    width: '100%',
  },
  snapCardWrap: {
    height: FOR_YOU_CARD_HEIGHT + 22,
    width: FOR_YOU_CARD_WIDTH,
  },
  snapImage: {
    height: FOR_YOU_CARD_HEIGHT,
    width: FOR_YOU_CARD_WIDTH,
  },
  snapList: {
    paddingHorizontal: FOR_YOU_SIDE_PADDING,
  },
  stackLayer: {
    borderRadius: 8,
    position: 'absolute',
  },
  stackLayerBack: {
    backgroundColor: 'rgba(20,35,69,0.72)',
    height: FOR_YOU_CARD_HEIGHT - 26,
    left: 24,
    top: 24,
    width: FOR_YOU_CARD_WIDTH - 44,
  },
  stackLayerMid: {
    backgroundColor: 'rgba(31,128,224,0.26)',
    height: FOR_YOU_CARD_HEIGHT - 12,
    left: 12,
    top: 12,
    width: FOR_YOU_CARD_WIDTH - 22,
  },
});
