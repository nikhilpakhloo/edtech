import { memo, useCallback } from 'react';
import type { ListRenderItem } from 'react-native';
import { FlatList, Text, View } from 'react-native';

import { EmptyState } from '@/components/feedback/EmptyState';
import { MediaCard } from '@/components/media/MediaCard';
import type { MediaItem, MediaRail as MediaRailType } from '@/types/media';
import { HOME_RAIL_LIST_PROPS } from '@/utils/listPerf';

type MediaRailProps = {
  rail: MediaRailType;
  onSelectMedia: (item: MediaItem) => void;
};

function MediaRailBase({ rail, onSelectMedia }: MediaRailProps) {
  const renderItem = useCallback<ListRenderItem<MediaItem>>(
    ({ item }) => <MediaCard item={item} onPress={onSelectMedia} />,
    [onSelectMedia],
  );

  if (!rail.items.length) {
    return (
      <View className="mb-7">
        <View className="mb-3 px-5">
          <Text className="text-lg font-bold text-white">{rail.title}</Text>
        </View>
        <EmptyState
          title="Nothing here yet"
          message="This rail is ready, but the mock service did not return titles for it."
        />
      </View>
    );
  }

  return (
    <View className="mb-8">
      <View className="mb-3 flex-row items-end justify-between px-5">
        <View className="flex-1 pr-4">
          <Text className="text-xl font-black text-white">{rail.title}</Text>
          {rail.subtitle ? (
            <Text className="mt-1 text-sm text-slate-400">{rail.subtitle}</Text>
          ) : null}
        </View>
        <Text className="text-xs font-black uppercase tracking-[1.5px] text-brand-blue">
          View all
        </Text>
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
