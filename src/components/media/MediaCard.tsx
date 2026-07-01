import { Image } from 'expo-image';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ProgressBar } from 'react-native-paper';

import type { MediaItem } from '@/types/media';
import { formatRuntime } from '@/utils/formatRuntime';

type MediaCardProps = {
  item: MediaItem;
  onPress: (item: MediaItem) => void;
};

function MediaCardBase({ item, onPress }: MediaCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open ${item.title}`}
      className="mr-3 w-32"
      onPress={() => onPress(item)}>
      <View className="overflow-hidden rounded-md bg-brand-elevated">
        <Image
          source={{ uri: item.posterUrl }}
          cachePolicy="disk"
          contentFit="cover"
          transition={180}
          style={styles.poster}
        />
        {item.isPremium ? (
          <View className="absolute left-2 top-2 rounded bg-black/70 px-2 py-1">
            <Text className="text-[10px] font-bold uppercase text-brand-green">Premium</Text>
          </View>
        ) : null}
        {item.progressPercent ? (
          <ProgressBar
            progress={item.progressPercent}
            color="#4F8CFF"
            style={styles.progress}
          />
        ) : null}
      </View>
      <Text numberOfLines={1} className="mt-2 text-sm font-bold text-white">
        {item.title}
      </Text>
      <Text numberOfLines={1} className="mt-1 text-xs text-slate-400">
        {item.releaseYear} - {formatRuntime(item.runtimeMinutes, item.seasonCount)}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  poster: {
    height: 188,
    width: 128,
  },
  progress: {
    bottom: 0,
    height: 3,
    left: 0,
    position: 'absolute',
    right: 0,
  },
});

export const MediaCard = memo(MediaCardBase);
