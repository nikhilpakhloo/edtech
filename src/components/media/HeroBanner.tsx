import { Image } from 'expo-image';
import { router, type Href } from 'expo-router';
import { memo, useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from 'react-native-paper';

import { MetadataPill } from '@/components/media/MetadataPill';
import type { MediaItem } from '@/types/media';
import { formatRuntime } from '@/utils/formatRuntime';

type HeroBannerProps = {
  item: MediaItem;
};

function HeroBannerBase({ item }: HeroBannerProps) {
  const handleOpen = useCallback(() => {
    router.push({
      pathname: '/detail/[mediaId]',
      params: { mediaId: item.id },
    } as unknown as Href);
  }, [item.id]);

  return (
    <View className="mb-8">
      <View className="h-[470px] overflow-hidden bg-brand-surface">
        <Image
          source={{ uri: item.backdropUrl }}
          cachePolicy="disk"
          contentFit="cover"
          recyclingKey={`hero-${item.id}`}
          transition={220}
          style={StyleSheet.absoluteFill}
        />
        <View className="absolute inset-0 bg-black/20" />
        <View className="absolute bottom-0 left-0 right-0 h-72 bg-brand-ink/95" />
        <View className="absolute bottom-0 left-0 right-0 px-5 pb-7">
          <Text className="text-xs font-bold uppercase tracking-[2px] text-brand-green">
            {item.eyebrow}
          </Text>
          <Text className="mt-2 text-4xl font-black text-white">{item.title}</Text>
          <View className="mt-3 flex-row flex-wrap">
            <MetadataPill label={`${item.releaseYear}`} />
            <MetadataPill label={item.rating} />
            <MetadataPill label={formatRuntime(item.runtimeMinutes, item.seasonCount)} />
          </View>
          <Text numberOfLines={3} className="mt-4 text-base leading-6 text-slate-200">
            {item.description}
          </Text>
          <View className="mt-6 flex-row gap-3">
            <Button
              mode="contained"
              buttonColor="#F8FAFC"
              textColor="#05070D"
              contentStyle={{ height: 46, paddingHorizontal: 10 }}
              labelStyle={{ fontSize: 14, fontWeight: '900' }}
              onPress={handleOpen}>
              {item.primaryActionLabel}
            </Button>
            <Button
              mode="contained-tonal"
              buttonColor="rgba(255,255,255,0.14)"
              textColor="#F8FAFC"
              contentStyle={{ height: 46, paddingHorizontal: 8 }}
              labelStyle={{ fontSize: 14, fontWeight: '800' }}
              onPress={handleOpen}>
              Details
            </Button>
          </View>
        </View>
      </View>
    </View>
  );
}

export const HeroBanner = memo(HeroBannerBase);
