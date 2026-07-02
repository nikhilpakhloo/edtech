import { router } from 'expo-router';
import { memo, useCallback } from 'react';
import type { ListRenderItem } from 'react-native';
import { FlatList, Pressable, Text, View } from 'react-native';

import { EmptyState } from '@/components/feedback/EmptyState';
import { MediaCard } from '@/components/media/MediaCard';
import { APP_STRINGS } from '@/constants/string';
import { useAppTheme } from '@/theme/AppTheme';
import type { MediaItem, MediaRail as MediaRailType } from '@/types/media';
import { selectionHaptic } from '@/utils/haptics';
import { HOME_RAIL_LIST_PROPS } from '@/utils/listPerf';

type MediaRailProps = {
  rail: MediaRailType;
  onSelectMedia: (item: MediaItem) => void;
};

function MediaRailBase({ rail, onSelectMedia }: MediaRailProps) {
  const { colors } = useAppTheme();
  const renderItem = useCallback<ListRenderItem<MediaItem>>(
    ({ item }) => <MediaCard item={item} onPress={onSelectMedia} />,
    [onSelectMedia],
  );
  const handleViewAll = useCallback(() => {
    selectionHaptic();
    router.push('/search');
  }, []);

  if (!rail.items.length) {
    return (
      <View className="mb-7">
        <View className="mb-3 px-5">
          <Text className="text-lg font-bold" style={{ color: colors.text }}>
            {rail.title}
          </Text>
        </View>
        <EmptyState
          title={APP_STRINGS.empty.railTitle}
          message={APP_STRINGS.empty.railMessage}
        />
      </View>
    );
  }

  return (
    <View className="mb-8">
      <View className="mb-3 flex-row items-end justify-between px-5">
        <View className="flex-1 pr-4">
          <Text className="text-xl font-black" style={{ color: colors.text }}>
            {rail.title}
          </Text>
          {rail.subtitle ? (
            <Text className="mt-1 text-sm" style={{ color: colors.textMuted }}>
              {rail.subtitle}
            </Text>
          ) : null}
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={APP_STRINGS.accessibility.viewAllRail(rail.title)}
          className="min-h-10 justify-center px-1"
          onPress={handleViewAll}>
          <Text className="text-xs font-black uppercase tracking-[1.5px] text-brand-blue">
            {APP_STRINGS.common.viewAll}
          </Text>
        </Pressable>
      </View>
      <FlatList
        {...HOME_RAIL_LIST_PROPS}
        data={rail.items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        getItemLayout={(_, index) => ({
          index,
          length: 140,
          offset: 140 * index,
        })}
        contentContainerStyle={{ paddingHorizontal: 20 }}
      />
    </View>
  );
}

export const MediaRail = memo(MediaRailBase);
