import { Ionicons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import { memo, useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Button } from 'react-native-paper';

import { MetadataPill } from '@/components/media/MetadataPill';
import { OptimizedImage } from '@/components/media/OptimizedImage';
import { APP_STRINGS } from '@/constants/string';
import { useAppTheme } from '@/theme/AppTheme';
import type { MediaItem } from '@/types/media';
import { formatRuntime } from '@/utils/formatRuntime';
import { impactHaptic } from '@/utils/haptics';

type HeroBannerProps = {
  item: MediaItem;
};

function HeroBannerBase({ item }: HeroBannerProps) {
  const { colors, isDark } = useAppTheme();
  const handleOpen = useCallback(() => {
    impactHaptic();
    router.push({
      pathname: '/detail/[mediaId]',
      params: { mediaId: item.id },
    } as unknown as Href);
  }, [item.id]);

  return (
    <View className="mb-8">
      <View
        className="h-[560px] overflow-hidden"
        style={{ backgroundColor: colors.surface }}>
        <OptimizedImage
          contentFit="cover"
          priority="high"
          recyclingKey={`hero-${item.id}`}
          sourceUri={item.backdropUrl}
          transition={220}
          style={StyleSheet.absoluteFill}
          targetWidth={720}
        />
        <View className="absolute inset-0 bg-black/10" />
        <View className="absolute left-0 top-0 h-56 w-28 bg-brand-ink/75" />
        <View
          className="absolute bottom-0 left-0 right-0 h-96"
          style={{ backgroundColor: isDark ? 'rgba(3,7,18,0.95)' : 'rgba(255,255,255,0.9)' }}
        />
        <View
          className="absolute bottom-28 left-0 right-0 h-28"
          style={{ backgroundColor: isDark ? 'rgba(7,16,31,0.55)' : 'rgba(255,255,255,0.55)' }}
        />

        <View className="absolute left-5 right-5 top-14 flex-row items-center">
          <View className="h-10 w-10 items-center justify-center rounded-lg bg-white">
            <Text className="text-lg font-black text-brand-blue">E</Text>
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-xl font-black" style={{ color: colors.text }}>
              {APP_STRINGS.brand.name}
            </Text>
            <Text className="text-xs font-bold uppercase tracking-[2px] text-brand-cyan">
              {APP_STRINGS.brand.tagline}
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={APP_STRINGS.tabs.search}
            className="h-10 w-10 items-center justify-center rounded-full bg-black/45">
            <Ionicons name="search" color="#FFFFFF" size={20} />
          </Pressable>
        </View>

        <View className="absolute bottom-0 left-0 right-0 px-5 pb-7">
          <View className="mb-3 flex-row items-center">
            <View className="rounded bg-brand-gold px-2 py-1">
              <Text className="text-[10px] font-black uppercase text-brand-ink">
                {APP_STRINGS.media.spotlight}
              </Text>
            </View>
            <Text className="ml-2 text-xs font-bold uppercase tracking-[2px] text-brand-cyan">
              {item.eyebrow}
            </Text>
          </View>
          <Text className="text-5xl font-black" numberOfLines={2} style={{ color: colors.text }}>
            {item.title}
          </Text>
          <View className="mt-4 flex-row flex-wrap">
            <Text className="mr-3 text-sm font-black text-brand-gold">
              {APP_STRINGS.media.premium}
            </Text>
            <MetadataPill label={`${item.releaseYear}`} />
            <MetadataPill label={item.rating} />
            <MetadataPill label={formatRuntime(item.runtimeMinutes, item.seasonCount)} />
          </View>
          <Text numberOfLines={3} className="mt-4 text-base leading-6" style={{ color: colors.text }}>
            {item.description}
          </Text>
          <View className="mt-6 flex-row gap-3">
            <Button
              mode="contained"
              buttonColor="#F8FAFC"
              textColor="#05070D"
              contentStyle={{ height: 46, paddingHorizontal: 10 }}
              labelStyle={{ fontSize: 14, fontWeight: '900' }}
              icon="play"
              onPress={handleOpen}>
              {item.primaryActionLabel}
            </Button>
            <Button
              mode="contained-tonal"
              buttonColor="rgba(31,128,224,0.28)"
              textColor="#F8FAFC"
              contentStyle={{ height: 46, paddingHorizontal: 8 }}
              labelStyle={{ fontSize: 14, fontWeight: '800' }}
              icon="plus"
              onPress={handleOpen}>
              {APP_STRINGS.media.watchlist}
            </Button>
          </View>
        </View>
      </View>
    </View>
  );
}

export const HeroBanner = memo(HeroBannerBase);
