import { memo, useCallback } from 'react';
import type { ListRenderItem } from 'react-native';
import { FlatList, Text, View } from 'react-native';

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
    return null;
  }

  return (
    <View className="mb-7">
      <View className="mb-3 px-5">
        <Text className="text-lg font-bold text-white">{rail.title}</Text>
        {rail.subtitle ? (
          <Text className="mt-1 text-sm text-slate-400">{rail.subtitle}</Text>
        ) : null}
      </View>
      <FlatList
        {...HOME_RAIL_LIST_PROPS}
        data={rail.items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 20 }}
      />
    </View>
  );
}

export const MediaRail = memo(MediaRailBase);
