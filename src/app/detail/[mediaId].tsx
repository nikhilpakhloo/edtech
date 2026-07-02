import { router, Stack, useLocalSearchParams, type Href } from "expo-router";
import { useCallback } from "react";
import {
  StatusBar as NativeStatusBar,
  Text,
  View,
} from "react-native";
import { Divider } from "react-native-paper";
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated";

import { ErrorState } from "@/components/feedback/ErrorState";
import { DetailSkeleton } from "@/components/feedback/Skeleton";
import { Screen } from "@/components/layout/Screen";
import { LearningVideoPlayer } from "@/components/media/LearningVideoPlayer";
import { MediaRail } from "@/components/media/MediaRail";
import { MetadataPill } from "@/components/media/MetadataPill";
import { APP_STRINGS } from "@/constants/string";
import { DetailAnimatedHeader } from "@/features/detail/components/DetailAnimatedHeader";
import { useMediaDetail } from "@/features/detail/hooks/useMediaDetail";
import { useAppTheme } from "@/theme/AppTheme";
import type { MediaItem } from "@/types/media";

export default function DetailScreen() {
  const videoControlTop = 8;
  const { colors, isDark } = useAppTheme();
  const { mediaId } = useLocalSearchParams<{ mediaId: string }>();
  const { error, isLoading, item, related, retry } = useMediaDetail(mediaId);
  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });
  const handleSelectMedia = useCallback((selectedItem: MediaItem) => {
    router.push({
      pathname: "/detail/[mediaId]",
      params: { mediaId: selectedItem.id },
    } as unknown as Href);
  }, []);

  if (isLoading) {
    return (
      <Screen edges={["left", "right"]}>
        <Stack.Screen options={{ headerShown: false }} />
        <DetailSkeleton />
      </Screen>
    );
  }

  if (error || !item) {
    return (
      <Screen>
        <Stack.Screen options={{ headerShown: false }} />
        <ErrorState
          title={APP_STRINGS.errors.titleUnavailable}
          message={error ?? APP_STRINGS.errors.titleNotFound}
          actionLabel={APP_STRINGS.common.retry}
          onRetry={retry}
        />
      </Screen>
    );
  }

  return (
    <Screen edges={["left", "right"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <NativeStatusBar
        backgroundColor="transparent"
        barStyle={isDark ? "light-content" : "dark-content"}
        translucent
      />
      <DetailAnimatedHeader title={item.title} scrollY={scrollY} />
      <View className="bg-black">
        <LearningVideoPlayer
          title={item.title}
          videoUrl={item.videoUrl}
          streamType={item.streamType}
          posterUrl={item.backdropUrl}
          autoPlay
          elevated
          controlsTop={videoControlTop}
        />
      </View>

      <Animated.ScrollView
        className="flex-1"
        style={{ backgroundColor: colors.background }}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 36 }}
      >
        <View className="px-5 pt-5">
          <View className="mt-5 flex-row flex-wrap">
            <MetadataPill label={item.languages.join(" / ")} />
            <MetadataPill label={item.kind.toUpperCase()} />
            {item.episodeCount ? (
              <MetadataPill label={APP_STRINGS.detail.episodeLabel(item.episodeCount)} />
            ) : null}
          </View>

          <Text className="mt-5 text-base leading-7" style={{ color: colors.text }}>
            {item.description}
          </Text>
          <Text className="mt-4 text-sm font-semibold uppercase tracking-[1.5px] text-brand-cyan">
            {item.genres.join(" - ")}
          </Text>

          <Divider className="my-6" style={{ backgroundColor: colors.border }} />

          <View
            className="rounded-lg border p-4"
            style={{
              backgroundColor: colors.surface,
              borderColor: isDark ? "rgba(255,255,255,0.1)" : colors.border,
            }}>
            <Text className="text-lg font-bold" style={{ color: colors.text }}>
              {APP_STRINGS.detail.metadataTitle}
            </Text>
            <Text className="mt-3 text-sm leading-6" style={{ color: colors.textMuted }}>
              {item.kind.toUpperCase()} - {item.maturityNote}
              {item.episodeCount ? ` - ${APP_STRINGS.detail.episodeLabel(item.episodeCount)}` : ""}
            </Text>
          </View>
        </View>

        <View className="mt-8">
          <MediaRail
            rail={{ id: "related", title: APP_STRINGS.detail.relatedTitle, items: related }}
            onSelectMedia={handleSelectMedia}
          />
        </View>
      </Animated.ScrollView>
    </Screen>
  );
}
