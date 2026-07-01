import { router, Stack, useLocalSearchParams, type Href } from 'expo-router';
import { Image } from 'expo-image';
import { useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Button, Divider } from 'react-native-paper';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import { ErrorState } from '@/components/feedback/ErrorState';
import { DetailSkeleton } from '@/components/feedback/Skeleton';
import { Screen } from '@/components/layout/Screen';
import { LearningVideoPlayer } from '@/components/media/LearningVideoPlayer';
import { MediaRail } from '@/components/media/MediaRail';
import { MetadataPill } from '@/components/media/MetadataPill';
import { DetailAnimatedHeader } from '@/features/detail/components/DetailAnimatedHeader';
import { useMediaDetail } from '@/features/detail/hooks/useMediaDetail';
import type { MediaItem } from '@/types/media';
import { formatRuntime } from '@/utils/formatRuntime';

export default function DetailScreen() {
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
      pathname: '/detail/[mediaId]',
      params: { mediaId: selectedItem.id },
    } as unknown as Href);
  }, []);

  if (isLoading) {
    return (
      <Screen edges={['left', 'right']}>
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
          message={error ?? 'We could not find this EdStream title.'}
          actionLabel="Retry"
          onRetry={retry}
        />
      </Screen>
    );
  }

  return (
    <Screen edges={['left', 'right']}>
      <Stack.Screen options={{ headerShown: false }} />
      <DetailAnimatedHeader title={item.title} scrollY={scrollY} />
      <Animated.ScrollView
        className="flex-1"
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 36 }}>
        <View className="h-[430px] bg-brand-surface">
          <Image
            source={{ uri: item.backdropUrl }}
            cachePolicy="disk"
            contentFit="cover"
            recyclingKey={`detail-${item.id}`}
            transition={220}
            style={StyleSheet.absoluteFill}
          />
          <View className="absolute inset-0 bg-black/25" />
          <View className="absolute bottom-0 left-0 right-0 h-56 bg-brand-ink/95" />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            className="absolute left-4 top-12 h-11 w-11 items-center justify-center rounded-full bg-black/45"
            onPress={() => router.back()}>
            <Ionicons name="chevron-back" color="#FFFFFF" size={25} />
          </Pressable>
          <View className="absolute bottom-0 left-0 right-0 px-5 pb-6">
            <Text className="text-xs font-bold uppercase tracking-[2px] text-brand-green">
              {item.eyebrow}
            </Text>
            <Text className="mt-2 text-4xl font-black text-white">{item.title}</Text>
            <View className="mt-4 flex-row flex-wrap">
              <MetadataPill label={`${item.releaseYear}`} />
              <MetadataPill label={item.rating} />
              <MetadataPill label={formatRuntime(item.runtimeMinutes, item.seasonCount)} />
              <MetadataPill label={item.languages.join(' / ')} />
            </View>
          </View>
        </View>

        <View className="px-5 pt-5">
          <View className="flex-row gap-3">
            <Button
              mode="contained"
              buttonColor="#F8FAFC"
              textColor="#05070D"
              contentStyle={{ height: 48, paddingHorizontal: 12 }}
              labelStyle={{ fontSize: 14, fontWeight: '900' }}>
              {item.primaryActionLabel}
            </Button>
            <Button
              mode="contained-tonal"
              buttonColor="rgba(255,255,255,0.13)"
              textColor="#F8FAFC"
              contentStyle={{ height: 48, paddingHorizontal: 10 }}
              labelStyle={{ fontSize: 14, fontWeight: '800' }}>
              Watchlist
            </Button>
          </View>

          <View className="mt-6">
            <LearningVideoPlayer
              title={item.title}
              videoUrl={item.videoUrl}
              streamType={item.streamType}
            />
          </View>

          <Text className="mt-5 text-base leading-7 text-slate-200">{item.description}</Text>
          <Text className="mt-4 text-sm font-semibold uppercase tracking-[1.5px] text-brand-green">
            {item.genres.join(' - ')}
          </Text>

          <Divider className="my-6 bg-brand-line" />

          <View className="rounded-lg border border-white/10 bg-brand-surface p-4">
            <Text className="text-lg font-bold text-white">Metadata</Text>
            <Text className="mt-3 text-sm leading-6 text-slate-300">
              {item.kind.toUpperCase()} - {item.maturityNote}
              {item.episodeCount ? ` - ${item.episodeCount} episodes` : ''}
            </Text>
          </View>
        </View>

        <View className="mt-8">
          <MediaRail
            rail={{ id: 'related', title: 'More Like This', items: related }}
            onSelectMedia={handleSelectMedia}
          />
        </View>
      </Animated.ScrollView>
    </Screen>
  );
}
