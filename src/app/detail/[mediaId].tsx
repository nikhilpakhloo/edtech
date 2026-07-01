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
import { DetailAnimatedHeader } from "@/features/detail/components/DetailAnimatedHeader";
import { useMediaDetail } from "@/features/detail/hooks/useMediaDetail";
import type { MediaItem } from "@/types/media";

export default function DetailScreen() {
  const videoControlTop = 8;
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
          title="Title unavailable"
          message={error ?? "We could not find this EdStream title."}
          actionLabel="Retry"
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
        barStyle="light-content"
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
              <MetadataPill label={`${item.episodeCount} episodes`} />
            ) : null}
          </View>

          <Text className="mt-5 text-base leading-7 text-slate-200">
            {item.description}
          </Text>
          <Text className="mt-4 text-sm font-semibold uppercase tracking-[1.5px] text-brand-cyan">
            {item.genres.join(" - ")}
          </Text>

          <Divider className="my-6 bg-brand-line" />

          <View className="rounded-lg border border-white/10 bg-brand-surface p-4">
            <Text className="text-lg font-bold text-white">Metadata</Text>
            <Text className="mt-3 text-sm leading-6 text-slate-300">
              {item.kind.toUpperCase()} - {item.maturityNote}
              {item.episodeCount ? ` - ${item.episodeCount} episodes` : ""}
            </Text>
          </View>
        </View>

        <View className="mt-8">
          <MediaRail
            rail={{ id: "related", title: "More Like This", items: related }}
            onSelectMedia={handleSelectMedia}
          />
        </View>
      </Animated.ScrollView>
    </Screen>
  );
}
