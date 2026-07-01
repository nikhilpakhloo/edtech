import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, type Href } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
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
import Carousel, {
  type CarouselRenderItem,
  type ICarouselInstance,
} from 'react-native-reanimated-carousel';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ErrorState } from '@/components/feedback/ErrorState';
import { HomeSkeleton } from '@/components/feedback/Skeleton';
import { MediaRail } from '@/components/media/MediaRail';
import { Screen } from '@/components/layout/Screen';
import { useHomeFeed } from '@/features/home/hooks/useHomeFeed';
import { useAppTheme } from '@/theme/AppTheme';
import type { MediaItem, MediaRail as MediaRailType } from '@/types/media';
import { impactHaptic, selectionHaptic } from '@/utils/haptics';
import { HOME_FEED_LIST_PROPS } from '@/utils/listPerf';
import { getTabBarContentPadding } from '@/utils/tabBar';

type HomeMode = 'learn' | 'practice';

const SCREEN_WIDTH = Dimensions.get('window').width;
const FOR_YOU_CARD_WIDTH = Math.min(SCREEN_WIDTH * 0.76, 330);
const FOR_YOU_CARD_HEIGHT = 360;
const FOR_YOU_CAROUSEL_HEIGHT = FOR_YOU_CARD_HEIGHT + 28;

const MODE_OPTIONS: {
  id: HomeMode;
  label: string;
  eyebrow: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeColors: [string, string, string];
  idleColors: [string, string, string];
}[] = [
  {
    id: 'learn',
    label: 'Learn',
    eyebrow: 'Courses & stories',
    icon: 'school',
    activeColors: ['#1F80E0', '#0EA5E9', '#00E0FF'],
    idleColors: ['#142345', '#0D1830', '#07101F'],
  },
  {
    id: 'practice',
    label: 'Practice',
    eyebrow: 'Live drills & exams',
    icon: 'flash',
    activeColors: ['#F5C542', '#F97316', '#DC2626'],
    idleColors: ['#241A0A', '#151525', '#07101F'],
  },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
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
            title: 'Exam and Skill Sprints',
            subtitle: 'Focused runs for tests, speed, and applied confidence',
            items: [
              byId['exam-mode'],
              byId['math-premier-league'],
              byId['code-with-creators'],
            ].filter(Boolean) as MediaItem[],
          },
          {
            id: 'practice-recommended',
            title: 'Recommended Practice',
            subtitle: 'Hands-on sessions picked for your next milestone',
            items: [
              byId['startup-casefiles'],
              byId['react-native-shiproom'],
              byId['exam-mode'],
            ].filter(Boolean) as MediaItem[],
          },
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
        {
          id: 'continue-learning-learn',
          title: 'Continue Learning',
          subtitle: 'Resume courses and cinematic lessons',
          items: [
            data.hero,
            byId['react-native-shiproom'],
            byId['design-systems-lab'],
          ].filter(Boolean) as MediaItem[],
        },
        {
          id: 'deep-learning-tracks',
          title: 'Deep Learning Tracks',
          subtitle: 'Structured series for product, code, and design',
          items: [
            byId['design-systems-lab'],
            byId['react-native-shiproom'],
            byId['code-with-creators'],
          ].filter(Boolean) as MediaItem[],
        },
        {
          id: 'documentary-picks-learn',
          title: 'Documentaries That Teach',
          subtitle: 'Story-led lessons for broader context',
          items: [
            byId['history-in-motion'],
            data.hero,
            byId['startup-casefiles'],
          ].filter(Boolean) as MediaItem[],
        },
      ],
    };
  }, [activeMode, data]);

  if (isLoading || isRefreshing) {
    return (
      <Screen edges={['left', 'right']}>
        <View className="px-5 pt-14" style={{ backgroundColor: colors.background }}>
          <ModeButtons activeMode={activeMode} onSelectMode={setActiveMode} />
        </View>
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
      <View className="px-5 pt-14" style={{ backgroundColor: colors.background }}>
        <ModeButtons activeMode={activeMode} onSelectMode={setActiveMode} />
      </View>
      <FlatList
        {...HOME_FEED_LIST_PROPS}
        style={{ backgroundColor: colors.background }}
        data={modeFeed.rails}
        keyExtractor={(rail) => rail.id}
        renderItem={renderRail}
        ListHeaderComponent={
          <HomeTopExperience
            activeMode={activeMode}
            carouselItems={modeFeed.carousel}
            hero={modeFeed.hero}
            onSelectMedia={handleSelectMedia}
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
  onSelectMedia: (item: MediaItem) => void;
};

function HomeTopExperience({
  activeMode,
  hero,
  carouselItems,
  onSelectMedia,
}: HomeTopExperienceProps) {
  const carouselRef = useRef<ICarouselInstance>(null);
  const { colors, isDark } = useAppTheme();

  const renderCarouselItem = useCallback<CarouselRenderItem<MediaItem>>(
    ({ item, index }) => (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Open ${item.title}`}
        className="mr-4"
        style={styles.snapCardWrap}
        onPress={() => {
          impactHaptic();
          onSelectMedia(item);
        }}>
        <View
          className="overflow-hidden rounded-lg border"
          style={{
            backgroundColor: colors.surface,
            borderColor: isDark ? 'rgba(255,255,255,0.1)' : colors.border,
          }}>
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
    [colors.border, colors.surface, isDark, onSelectMedia],
  );

  return (
    <View className="pb-2">
      <View className="px-5">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Open ${hero.title}`}
          className="overflow-hidden rounded-lg border"
          style={{
            backgroundColor: colors.surface,
            borderColor: isDark ? 'rgba(255,255,255,0.1)' : colors.border,
          }}
          onPress={() => {
            impactHaptic();
            onSelectMedia(hero);
          }}>
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
          <Text className="text-xl font-black" style={{ color: colors.text }}>
            For You
          </Text>
          <Text className="mt-1 text-sm" style={{ color: colors.textMuted }}>
            Swipe through curated {activeMode === 'learn' ? 'learning journeys' : 'practice picks'}
          </Text>
        </View>
        <View style={styles.snapCarouselFrame}>
          <Carousel
            ref={carouselRef}
            data={carouselItems}
            loop
            pagingEnabled
            snapEnabled
            autoPlay={false}
            autoPlayInterval={2200}
            renderItem={renderCarouselItem}
            mode="horizontal-stack"
            modeConfig={{
              snapDirection: 'left',
              stackInterval: 28,
              scaleInterval: 0.06,
              opacityInterval: 0.12,
            }}
            customConfig={() => ({ type: 'positive', viewCount: 5 })}
            onConfigurePanGesture={(gesture) => {
              gesture.activeOffsetX([-12, 12]).failOffsetY([-8, 8]);
            }}
            style={styles.snapCarousel}
            width={FOR_YOU_CARD_WIDTH}
            height={FOR_YOU_CAROUSEL_HEIGHT}
            windowSize={5}
          />
        </View>
      </View>
    </View>
  );
}

type ModeButtonsProps = {
  activeMode: HomeMode;
  onSelectMode: (mode: HomeMode) => void;
};

function ModeButtons({ activeMode, onSelectMode }: ModeButtonsProps) {
  return (
    <View className="mb-5 flex-row gap-3">
      {MODE_OPTIONS.map((option) => {
        const isActive = option.id === activeMode;

        return (
          <Pressable
            key={option.id}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            className="flex-1 overflow-hidden rounded-full"
            style={isActive ? styles.modeButtonActive : styles.modeButtonIdle}
            onPress={() => {
              selectionHaptic();
              onSelectMode(option.id);
            }}>
            <LinearGradient
              colors={isActive ? option.activeColors : option.idleColors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.modeBorderGradient}>
              <View
                className={`flex-row items-center rounded-full ${
                  isActive ? 'bg-brand-ink/20' : 'bg-brand-ink/80'
                }`}
                style={styles.modeButtonInner}>
                <View
                  className={`h-8 w-8 items-center justify-center rounded-full ${
                    isActive ? 'bg-white' : 'bg-white/10'
                  }`}>
                  <Ionicons
                    name={option.icon}
                    color={
                      isActive && option.id === 'practice'
                        ? '#B45309'
                        : isActive
                          ? '#1F80E0'
                          : '#FFFFFF'
                    }
                    size={20}
                  />
                </View>
                <View className="ml-3 flex-1">
                  <Text className="text-sm font-black text-white">{option.label}</Text>
                  <Text
                    numberOfLines={1}
                    className={
                      isActive
                        ? 'text-[10px] font-bold text-white'
                        : 'text-[10px] text-slate-300'
                    }>
                    {option.eyebrow}
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bannerImage: {
    height: 260,
    width: '100%',
  },
  modeButtonActive: {
    shadowColor: '#1F80E0',
    shadowOffset: { height: 6, width: 0 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
  },
  modeButtonIdle: {
    opacity: 0.92,
  },
  modeBorderGradient: {
    borderRadius: 999,
    padding: 1.4,
  },
  modeButtonInner: {
    minHeight: 54,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  snapCardWrap: {
    height: FOR_YOU_CARD_HEIGHT,
    width: FOR_YOU_CARD_WIDTH,
  },
  snapImage: {
    height: FOR_YOU_CARD_HEIGHT,
    width: FOR_YOU_CARD_WIDTH,
  },
  snapCarousel: {
    alignItems: 'center',
    height: FOR_YOU_CAROUSEL_HEIGHT,
    justifyContent: 'center',
    overflow: 'visible',
    width: FOR_YOU_CARD_WIDTH,
  },
  snapCarouselFrame: {
    alignItems: 'center',
    height: FOR_YOU_CAROUSEL_HEIGHT,
    overflow: 'visible',
    width: SCREEN_WIDTH,
  },
});
