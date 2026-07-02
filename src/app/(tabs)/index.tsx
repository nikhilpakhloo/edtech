import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, type Href } from "expo-router";
import { memo, useCallback, useRef, useState, type ComponentProps } from "react";
import type { ListRenderItem } from "react-native";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Carousel, {
  type CarouselRenderItem,
  type ICarouselInstance,
} from "react-native-reanimated-carousel";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ErrorState } from "@/components/feedback/ErrorState";
import { HomeSkeleton } from "@/components/feedback/Skeleton";
import { Screen } from "@/components/layout/Screen";
import { MediaRail } from "@/components/media/MediaRail";
import { OptimizedImage } from "@/components/media/OptimizedImage";
import { APP_STRINGS } from "@/constants/string";
import { useHomeFeed } from "@/features/home/hooks/useHomeFeed";
import { useAppTheme } from "@/theme/AppTheme";
import type {
  HomeModeId,
  HomeModeOption,
  MediaItem,
  MediaRail as MediaRailType,
} from "@/types/media";
import { impactHaptic, selectionHaptic } from "@/utils/haptics";
import { HOME_FEED_LIST_PROPS } from "@/utils/listPerf";
import { useResponsiveMetrics } from "@/utils/responsive";
import { getTabBarContentPadding } from "@/utils/tabBar";

const CAROUSEL_MODE_CONFIG = {
  snapDirection: "left",
  stackInterval: 28,
  scaleInterval: 0.06,
  opacityInterval: 0.12,
} as const;

const HOME_MODE_OPTIONS: HomeModeOption[] = [
  {
    id: "learn",
    label: APP_STRINGS.home.modes.learn.label,
    eyebrow: APP_STRINGS.home.modes.learn.eyebrow,
    icon: "school",
    activeColors: ["#1F80E0", "#0EA5E9", "#00E0FF"],
    idleColors: ["#142345", "#0D1830", "#07101F"],
  },
  {
    id: "practice",
    label: APP_STRINGS.home.modes.practice.label,
    eyebrow: APP_STRINGS.home.modes.practice.eyebrow,
    icon: "flash",
    activeColors: ["#F5C542", "#F97316", "#DC2626"],
    idleColors: ["#241A0A", "#151525", "#07101F"],
  },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const metrics = useResponsiveMetrics();
  const [activeMode, setActiveMode] = useState<HomeModeId>("learn");
  const { data, error, hasMore, isLoading, isLoadingMore, isRefreshing, loadMore, refresh, retry } =
    useHomeFeed(activeMode);
  const modeOptions = data?.modes ?? HOME_MODE_OPTIONS;

  const handleSelectMedia = useCallback((item: MediaItem) => {
    router.push({
      pathname: "/detail/[mediaId]",
      params: { mediaId: item.id },
    } as unknown as Href);
  }, []);

  const renderRail = useCallback<ListRenderItem<MediaRailType>>(
    ({ item }) => <MediaRail rail={item} onSelectMedia={handleSelectMedia} />,
    [handleSelectMedia],
  );
  const renderFooter = useCallback(() => {
    if (!isLoadingMore && !hasMore) {
      return null;
    }

    return (
      <View style={styles.feedFooter}>
        {isLoadingMore ? <ActivityIndicator color="#4F8CFF" /> : null}
      </View>
    );
  }, [hasMore, isLoadingMore]);

  if (isLoading || isRefreshing) {
    return (
      <Screen edges={["left", "right"]}>
        <View
          style={{
            backgroundColor: colors.background,
            paddingHorizontal: metrics.horizontalPadding,
            paddingTop: metrics.headerTopPadding,
          }}
        >
          <MemoizedModeButtons
            activeMode={activeMode}
            modes={modeOptions}
            onSelectMode={setActiveMode}
          />
        </View>
        <HomeSkeleton />
      </Screen>
    );
  }

  if (error || !data) {
    return (
      <Screen edges={["top", "left", "right"]}>
        <ErrorState
          title={APP_STRINGS.errors.feedUnavailable}
          message={error ?? APP_STRINGS.errors.noContentReturned}
          onRetry={retry}
        />
      </Screen>
    );
  }

  return (
    <Screen edges={["left", "right"]}>
      <View
        style={{
          backgroundColor: colors.background,
          paddingHorizontal: metrics.horizontalPadding,
          paddingTop: metrics.headerTopPadding,
        }}
      >
        <MemoizedModeButtons
          activeMode={data.activeMode}
          modes={modeOptions}
          onSelectMode={setActiveMode}
        />
      </View>
      <FlatList
        {...HOME_FEED_LIST_PROPS}
        style={{ backgroundColor: colors.background }}
        data={data.rails}
        keyExtractor={(rail) => rail.id}
        renderItem={renderRail}
        ListHeaderComponent={
          <MemoizedHomeTopExperience
            activeMode={activeMode}
            carouselItems={data.carousel}
            hero={data.hero}
            onSelectMedia={handleSelectMedia}
          />
        }
        ListFooterComponent={renderFooter}
        onEndReached={loadMore}
        onEndReachedThreshold={0.45}
        contentContainerStyle={{
          paddingBottom: getTabBarContentPadding(insets.bottom),
        }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refresh}
            tintColor="#FFFFFF"
            progressBackgroundColor="#10141F"
            colors={["#4F8CFF"]}
          />
        }
      />
    </Screen>
  );
}

type HomeTopExperienceProps = {
  activeMode: HomeModeId;
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
  const metrics = useResponsiveMetrics();
  const carouselHeight = metrics.carouselCardHeight + 28;
  const customCarouselConfig = useCallback(
    () => ({ type: "positive" as const, viewCount: 5 }),
    [],
  );
  const configurePanGesture = useCallback((gesture: Parameters<NonNullable<ComponentProps<typeof Carousel>["onConfigurePanGesture"]>>[0]) => {
    gesture.activeOffsetX([-12, 12]).failOffsetY([-8, 8]);
  }, []);

  const renderCarouselItem = useCallback<CarouselRenderItem<MediaItem>>(
    ({ item, index }) => (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={APP_STRINGS.accessibility.openTitle(item.title)}
        className="mr-4"
        style={{
          height: metrics.carouselCardHeight,
          width: metrics.carouselCardWidth,
        }}
        onPress={() => {
          impactHaptic();
          onSelectMedia(item);
        }}
      >
        <View
          className="overflow-hidden rounded-lg border"
          style={{
            backgroundColor: colors.surface,
            borderColor: isDark ? "rgba(255,255,255,0.1)" : colors.border,
          }}
        >
          <OptimizedImage
            contentFit="cover"
            priority="normal"
            recyclingKey={`carousel-${item.id}`}
            sourceUri={item.backdropUrl}
            transition={180}
            style={{
              height: metrics.carouselCardHeight,
              width: metrics.carouselCardWidth,
            }}
            targetWidth={metrics.carouselCardWidth}
          />
          <View className="absolute inset-0 bg-black/25" />
          <View className="absolute bottom-0 left-0 right-0 bg-brand-ink/80 px-4 py-3">
            <Text className="text-[11px] font-black uppercase tracking-[1.5px] text-brand-cyan">
              {APP_STRINGS.home.forYouRank(index + 1)}
            </Text>
            <Text
              numberOfLines={1}
              className="mt-1 text-lg font-black text-white"
            >
              {item.title}
            </Text>
          </View>
        </View>
      </Pressable>
    ),
    [
      colors.border,
      colors.surface,
      isDark,
      metrics.carouselCardHeight,
      metrics.carouselCardWidth,
      onSelectMedia,
    ],
  );

  return (
    <View className="pb-2">
      <View style={{ paddingHorizontal: metrics.horizontalPadding }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={APP_STRINGS.accessibility.openTitle(hero.title)}
          className="overflow-hidden rounded-lg border"
          style={{
            backgroundColor: colors.surface,
            borderColor: isDark ? "rgba(255,255,255,0.1)" : colors.border,
          }}
          onPress={() => {
            impactHaptic();
            onSelectMedia(hero);
          }}
        >
          <OptimizedImage
            contentFit="cover"
            priority="high"
            recyclingKey={`home-hero-${hero.id}`}
            sourceUri={hero.backdropUrl}
            transition={200}
            style={{ height: metrics.heroImageHeight, width: "100%" }}
            targetWidth={metrics.contentWidth}
          />
          <View className="absolute inset-0 bg-black/25" />
          <View
            className="absolute bottom-0 left-0 right-0 bg-brand-ink/85"
            style={{
              paddingHorizontal: metrics.isCompact ? 12 : 16,
              paddingVertical: metrics.isCompact ? 12 : 16,
            }}
          >
            <Text className="text-[11px] font-black uppercase tracking-[1.8px] text-brand-gold">
              {activeMode === "learn"
                ? APP_STRINGS.home.modes.learn.featured
                : APP_STRINGS.home.modes.practice.featured}
            </Text>
            <Text
              numberOfLines={2}
              className="mt-1 font-black text-white"
              style={{ fontSize: metrics.isCompact ? 20 : 24, lineHeight: metrics.isCompact ? 25 : 30 }}
            >
              {hero.title}
            </Text>
            <Text
              numberOfLines={2}
              className="mt-2 text-sm text-slate-300"
              style={{ lineHeight: 20 }}
            >
              {hero.description}
            </Text>
          </View>
        </Pressable>
      </View>

      <View style={{ marginTop: metrics.sectionGap }}>
        <View style={{ marginBottom: 12, paddingHorizontal: metrics.horizontalPadding }}>
          <Text className="text-xl font-black" style={{ color: colors.text }}>
            {APP_STRINGS.home.forYou}
          </Text>
          <Text className="mt-1 text-sm" style={{ color: colors.textMuted }}>
            {APP_STRINGS.home.swipeThroughCurated(
              activeMode === "learn"
                ? APP_STRINGS.home.modes.learn.swipeSuffix
                : APP_STRINGS.home.modes.practice.swipeSuffix,
            )}
          </Text>
        </View>
        <View style={[styles.snapCarouselFrame, { height: carouselHeight }]}>
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
            modeConfig={CAROUSEL_MODE_CONFIG}
            customConfig={customCarouselConfig}
            onConfigurePanGesture={configurePanGesture}
            style={styles.snapCarousel}
            width={metrics.carouselCardWidth}
            height={carouselHeight}
            windowSize={5}
          />
        </View>
      </View>
    </View>
  );
}

const MemoizedHomeTopExperience = memo(HomeTopExperience);

type ModeButtonsProps = {
  activeMode: HomeModeId;
  modes: HomeModeOption[];
  onSelectMode: (mode: HomeModeId) => void;
};

function ModeButtons({ activeMode, modes, onSelectMode }: ModeButtonsProps) {
  return (
    <View className="mb-5 flex-row gap-3">
      {modes.map((option) => {
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
            }}
          >
            <LinearGradient
              colors={isActive ? option.activeColors : option.idleColors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.modeBorderGradient}
            >
              <View
                className={`flex-row items-center rounded-full ${
                  isActive ? "bg-brand-ink/20" : "bg-brand-ink/80"
                }`}
                style={styles.modeButtonInner}
              >
                <View
                  className={`h-8 w-8 items-center justify-center rounded-full ${
                    isActive ? "bg-white" : "bg-white/10"
                  }`}
                >
                  <Ionicons
                    name={option.icon as keyof typeof Ionicons.glyphMap}
                    color={
                      isActive && option.id === "practice"
                        ? "#B45309"
                        : isActive
                          ? "#1F80E0"
                          : "#FFFFFF"
                    }
                    size={20}
                  />
                </View>
                <View className="ml-3 flex-1">
                  <Text className="text-sm font-black text-white">
                    {option.label}
                  </Text>
                  <Text
                    numberOfLines={1}
                    className={
                      isActive
                        ? "text-[10px] font-bold text-white"
                        : "text-[10px] text-slate-300"
                    }
                  >
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

const MemoizedModeButtons = memo(ModeButtons);

const styles = StyleSheet.create({
  feedFooter: {
    alignItems: "center",
    height: 72,
    justifyContent: "center",
  },
  modeButtonActive: {
    shadowColor: "#1F80E0",
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
  snapCarousel: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },
  snapCarouselFrame: {
    alignItems: "center",
    overflow: "visible",
    width: "100%",
  },
});
