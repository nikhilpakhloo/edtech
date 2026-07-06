import { memo, useCallback, useMemo } from 'react';
import type { GestureResponderEvent } from 'react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ProgressBar } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

import { OptimizedImage } from '@/components/media/OptimizedImage';
import { APP_STRINGS } from '@/constants/string';
import { useBookmarkStatus } from '@/features/bookmarks/useBookmarks';
import { useAppTheme } from '@/theme/AppTheme';
import type { MediaItem } from '@/types/media';
import { formatRuntime } from '@/utils/formatRuntime';
import { impactHaptic } from '@/utils/haptics';

type MediaCardProps = {
  isBookmarked?: boolean;
  item: MediaItem;
  onToggleBookmark?: (item: MediaItem) => void;
  onPress: (item: MediaItem) => void;
};

function MediaCardBase({
  isBookmarked,
  item,
  onPress,
  onToggleBookmark,
}: MediaCardProps) {
  const { colors, isDark } = useAppTheme();
  const bookmarkStatus = useBookmarkStatus(item.id);
  const resolvedIsBookmarked = isBookmarked ?? bookmarkStatus.isBookmarked;
  const metadata = useMemo(
    () => `${item.languages[0]} - ${formatRuntime(item.runtimeMinutes, item.seasonCount)}`,
    [item.languages, item.runtimeMinutes, item.seasonCount],
  );
  const handlePress = useCallback(() => {
    impactHaptic();
    onPress(item);
  }, [item, onPress]);
  const handleToggleBookmark = useCallback((event: GestureResponderEvent) => {
    event.stopPropagation();
    impactHaptic();
    if (onToggleBookmark) {
      onToggleBookmark(item);
      return;
    }

    void bookmarkStatus.toggleBookmark();
  }, [bookmarkStatus, item, onToggleBookmark]);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={APP_STRINGS.accessibility.openTitle(item.title)}
      className="mr-3 w-32"
      style={({ pressed }) => [pressed && styles.pressed]}
      onPress={handlePress}>
      <View
        className="overflow-hidden rounded-md border"
        style={{
          backgroundColor: colors.elevated,
          borderColor: isDark ? 'rgba(255,255,255,0.1)' : colors.border,
        }}>
        <OptimizedImage
          contentFit="cover"
          priority="low"
          recyclingKey={item.id}
          sourceUri={item.posterUrl}
          style={styles.poster}
          targetWidth={128}
          transition={180}
        />
        {item.isPremium ? (
          <View className="absolute left-2 top-2 flex-row items-center rounded bg-brand-gold px-2 py-1">
            <Ionicons name="flash" color="#030712" size={10} />
            <Text className="ml-1 text-[10px] font-black uppercase text-brand-ink">
              {APP_STRINGS.media.premiumBadge}
            </Text>
          </View>
        ) : null}
        {item.isTrending ? (
          <View className="absolute right-2 top-2 rounded-full bg-brand-blue px-2 py-1">
            <Text className="text-[10px] font-black uppercase text-white">
              {APP_STRINGS.media.trendingBadge}
            </Text>
          </View>
        ) : null}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            resolvedIsBookmarked
              ? `Remove ${item.title} from bookmarks`
              : `Bookmark ${item.title}`
          }
          className="absolute bottom-3 right-2 h-7 w-7 items-center justify-center rounded-full"
          style={styles.bookmarkButton}
          onPress={handleToggleBookmark}>
          <Ionicons
            name={resolvedIsBookmarked ? 'bookmark' : 'bookmark-outline'}
            color={resolvedIsBookmarked ? '#F5C542' : '#FFFFFF'}
            size={15}
          />
        </Pressable>
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
        {metadata}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.82,
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
  bookmarkButton: {
    backgroundColor: 'rgba(3,7,18,0.72)',
  },
});

export const MediaCard = memo(MediaCardBase);
