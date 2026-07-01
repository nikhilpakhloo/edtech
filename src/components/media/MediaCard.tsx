import { Image } from 'expo-image';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ProgressBar } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

import { useAppTheme } from '@/theme/AppTheme';
import type { MediaItem } from '@/types/media';
import { formatRuntime } from '@/utils/formatRuntime';
import { impactHaptic } from '@/utils/haptics';

type MediaCardProps = {
  item: MediaItem;
  onPress: (item: MediaItem) => void;
};

function MediaCardBase({ item, onPress }: MediaCardProps) {
  const { colors, isDark } = useAppTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open ${item.title}`}
      className="mr-3 w-32"
      style={({ pressed }) => [pressed && styles.pressed]}
      onPress={() => {
        impactHaptic();
        onPress(item);
      }}>
      <View
        className="overflow-hidden rounded-md border"
        style={{
          backgroundColor: colors.elevated,
          borderColor: isDark ? 'rgba(255,255,255,0.1)' : colors.border,
        }}>
        <Image
          source={{ uri: item.posterUrl }}
          cachePolicy="disk"
          contentFit="cover"
          recyclingKey={item.id}
          transition={180}
          style={styles.poster}
        />
        {item.isPremium ? (
          <View className="absolute left-2 top-2 flex-row items-center rounded bg-brand-gold px-2 py-1">
            <Ionicons name="flash" color="#030712" size={10} />
            <Text className="ml-1 text-[10px] font-black uppercase text-brand-ink">VIP</Text>
          </View>
        ) : null}
        {item.isTrending ? (
          <View className="absolute right-2 top-2 rounded-full bg-brand-blue px-2 py-1">
            <Text className="text-[10px] font-black uppercase text-white">Top</Text>
          </View>
        ) : null}
        <View className="absolute bottom-0 left-0 right-0 h-16 bg-black/45" />
        <View className="absolute bottom-3 left-2 h-7 w-7 items-center justify-center rounded-full bg-white/90">
          <Ionicons name="play" color="#030712" size={13} />
        </View>
        {item.progressPercent ? (
          <ProgressBar
            progress={item.progressPercent}
            color="#1F80E0"
            style={styles.progress}
          />
        ) : null}
      </View>
      <Text numberOfLines={1} className="mt-2 text-sm font-bold" style={{ color: colors.text }}>
        {item.title}
      </Text>
      <Text numberOfLines={1} className="mt-1 text-xs" style={{ color: colors.textMuted }}>
        {item.languages[0]} - {formatRuntime(item.runtimeMinutes, item.seasonCount)}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.98 }],
  },
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
