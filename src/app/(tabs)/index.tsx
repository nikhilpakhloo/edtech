import { router, type Href, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import type { ListRenderItem } from "react-native";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ErrorState } from "@/components/common/ErrorState";
import { HomeSkeleton } from "@/components/common/Skeleton";
import { Screen } from "@/components/layout/Screen";
import { HomeModeButtons } from "@/components/media/HomeModeButtons";
import { HomeTopExperience } from "@/components/media/HomeTopExperience";
import { MediaRail } from "@/components/media/MediaRail";
import { APP_STRINGS } from "@/constants/string";
import { useHomeFeed } from "@/features/home/hooks/useHomeFeed";
import { requestNotificationPermissionOnAppEntry } from "@/features/notifications/notification.service";
import { trackClarityEvent } from "@/services/observability";
import { useAppTheme } from "@/theme/AppTheme";
import type {
  HomeModeId,
  HomeModeOption,
  MediaItem,
  MediaRail as MediaRailType,
} from "@/types/media";
import { HOME_FEED_LIST_PROPS } from "@/utils/listPerf";
import { useResponsiveMetrics } from "@/utils/responsive";
import { getTabBarContentPadding } from "@/utils/tabBar";

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
  const { data, error, hasMore, isLoading, isLoadingMore, isRefreshing, loadMore, refresh, retry, silentRefresh } =
    useHomeFeed(activeMode);
  const modeOptions = data?.modes ?? HOME_MODE_OPTIONS;
  const hasFocusedOnce = useRef(false);
  const homeMediaItems = useMemo(
    () =>
      data
        ? [
            data.hero,
            ...data.carousel,
            ...data.rails.flatMap((rail) => rail.items),
          ]
        : [],
    [data],
  );

  const handleSelectMedia = useCallback((item: MediaItem) => {
    trackClarityEvent("home_media_opened", {
      mediaId: item.id,
      mode: activeMode,
      source: "home_feed",
      title: item.title,
    });
    router.push({
      pathname: "/detail/[mediaId]",
      params: { mediaId: item.id },
    } as unknown as Href);
  }, [activeMode]);

  const handleSelectMode = useCallback((mode: HomeModeId) => {
    trackClarityEvent("home_mode_selected", {
      fromMode: activeMode,
      mode,
    });
    setActiveMode(mode);
  }, [activeMode]);

  const handleRefresh = useCallback(() => {
    trackClarityEvent("home_feed_refreshed", {
      mode: activeMode,
    });
    refresh();
  }, [activeMode, refresh]);

  const handleLoadMore = useCallback(() => {
    trackClarityEvent("home_feed_load_more_requested", {
      hasMore,
      mode: activeMode,
    });
    loadMore();
  }, [activeMode, hasMore, loadMore]);

  const renderRail = useCallback<ListRenderItem<MediaRailType>>(
    ({ item }) => (
      <MediaRail
        rail={item}
        onSelectMedia={handleSelectMedia}
      />
    ),
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

  useFocusEffect(
    useCallback(() => {
      void requestNotificationPermissionOnAppEntry();

      if (!hasFocusedOnce.current) {
        hasFocusedOnce.current = true;
        return;
      }

      silentRefresh();
    }, [silentRefresh]),
  );

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
          <HomeModeButtons
            activeMode={activeMode}
            modes={modeOptions}
            onSelectMode={handleSelectMode}
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
        <HomeModeButtons
          activeMode={data.activeMode}
          modes={modeOptions}
          onSelectMode={handleSelectMode}
        />
      </View>
      <FlatList
        {...HOME_FEED_LIST_PROPS}
        style={{ backgroundColor: colors.background }}
        data={data.rails}
        keyExtractor={(rail) => rail.id}
        renderItem={renderRail}
        ListHeaderComponent={
          <HomeTopExperience
            activeMode={activeMode}
            carouselItems={data.carousel}
            hero={data.hero}
            mediaItems={homeMediaItems}
            nextBestAction={data.nextBestAction}
            onSelectMedia={handleSelectMedia}
            studyPlan={data.studyPlan}
          />
        }
        ListFooterComponent={renderFooter}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.45}
        contentContainerStyle={{
          paddingBottom: getTabBarContentPadding(insets.bottom),
        }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#FFFFFF"
            progressBackgroundColor="#10141F"
            colors={["#4F8CFF"]}
          />
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  feedFooter: {
    alignItems: "center",
    height: 72,
    justifyContent: "center",
  },
});
