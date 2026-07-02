import { Ionicons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ListRenderItem } from 'react-native';
import { FlatList, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { SearchSkeleton } from '@/components/feedback/Skeleton';
import { MediaCard } from '@/components/media/MediaCard';
import { APP_STRINGS } from '@/constants/string';
import { apiService } from '@/data/apiService';
import { useAppTheme } from '@/theme/AppTheme';
import type { MediaItem } from '@/types/media';
import { selectionHaptic } from '@/utils/haptics';
import { getTabBarContentPadding } from '@/utils/tabBar';

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    apiService
      .getAllMedia()
      .then((response) => {
        if (isMounted) {
          setItems(response);
          setError(null);
        }
      })
      .catch((loadError) => {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : APP_STRINGS.errors.unableToLoadSearch);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return items;
    }

    return items.filter((item) => {
      const searchableText = [
        item.title,
        item.eyebrow,
        item.description,
        item.kind,
        item.rating,
        item.releaseYear.toString(),
        ...item.genres,
        ...item.languages,
      ]
        .join(' ')
        .toLowerCase();

      return searchableText.includes(normalizedQuery);
    });
  }, [items, query]);

  const categoryRails = useMemo(
    () => [
      {
        id: 'trending',
        title: APP_STRINGS.search.rails.trending.title,
        subtitle: APP_STRINGS.search.rails.trending.subtitle,
        items: items.filter((item) => item.isTrending),
      },
      {
        id: 'science',
        title: APP_STRINGS.search.rails.science.title,
        subtitle: APP_STRINGS.search.rails.science.subtitle,
        items: items.filter((item) =>
          item.genres.some((genre) => ['Physics', 'Chemistry', 'Biology', 'Science'].includes(genre)),
        ),
      },
      {
        id: 'exam',
        title: APP_STRINGS.search.rails.exam.title,
        subtitle: APP_STRINGS.search.rails.exam.subtitle,
        items: items.filter((item) =>
          item.genres.some((genre) => ['Exams', 'NEET', 'JEE', 'Revision'].includes(genre)),
        ),
      },
      {
        id: 'career',
        title: APP_STRINGS.search.rails.career.title,
        subtitle: APP_STRINGS.search.rails.career.subtitle,
        items: items.filter((item) =>
          item.genres.some((genre) =>
            ['Data Science', 'Finance', 'Communication', 'Soft Skills', 'Business'].includes(genre),
          ),
        ),
      },
      {
        id: 'all',
        title: APP_STRINGS.search.rails.all.title,
        subtitle: APP_STRINGS.search.rails.all.subtitle,
        items,
      },
    ],
    [items],
  );

  const handleSelectMedia = useCallback((item: MediaItem) => {
    router.push({
      pathname: '/detail/[mediaId]',
      params: { mediaId: item.id },
    } as unknown as Href);
  }, []);

  const renderItem = useCallback<ListRenderItem<MediaItem>>(
    ({ item }) => (
      <View className="mr-4">
        <MediaCard item={item} onPress={handleSelectMedia} />
      </View>
    ),
    [handleSelectMedia],
  );

  if (isLoading) {
    return <SearchSkeleton />;
  }

  if (error) {
    return (
      <View className="flex-1 px-5 pt-16" style={{ backgroundColor: colors.background }}>
        <ErrorState title={APP_STRINGS.errors.searchUnavailable} message={error} onRetry={() => setError(null)} />
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <View
        className="border-b px-5 pb-5 pt-14"
        style={{
          backgroundColor: colors.background,
          borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(15,23,42,0.1)',
        }}>
        <Text className="text-3xl font-black" style={{ color: colors.text }}>
          {APP_STRINGS.search.title}
        </Text>
        <Text className="mt-1 text-sm font-semibold" style={{ color: colors.textMuted }}>
          {APP_STRINGS.search.subtitle}
        </Text>

        <View
          className="mt-5 flex-row items-center rounded-lg border px-4"
          style={{
            backgroundColor: colors.surface,
            borderColor: isDark ? 'rgba(255,255,255,0.1)' : colors.border,
          }}>
          <Ionicons name="search" color="#9AA7BC" size={20} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={APP_STRINGS.search.placeholder}
            placeholderTextColor="#64748B"
            className="ml-3 h-12 flex-1 text-base font-semibold"
            style={{ color: colors.text }}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {query ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={APP_STRINGS.accessibility.clearSearch}
              className="h-9 w-9 items-center justify-center"
              onPress={() => {
                selectionHaptic();
                setQuery('');
              }}>
              <Ionicons name="close-circle" color="#9AA7BC" size={20} />
            </Pressable>
          ) : null}
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: getTabBarContentPadding(insets.bottom),
        }}>
        {query.trim() ? (
          filteredItems.length ? (
            <View className="pt-5">
              <Text className="mb-4 px-5 text-sm font-bold" style={{ color: colors.textMuted }}>
                {APP_STRINGS.search.resultLabel(query.trim())}
              </Text>
              <SearchRail
                items={filteredItems}
                renderItem={renderItem}
                subtitle={APP_STRINGS.search.resultSubtitle}
                title={APP_STRINGS.search.resultTitle}
              />
            </View>
          ) : (
            <View className="px-5 pt-10">
              <Text className="mb-4 text-sm font-bold" style={{ color: colors.textMuted }}>
                {APP_STRINGS.search.resultLabel(query.trim())}
              </Text>
              <EmptyState
                title={APP_STRINGS.empty.noMatchesTitle}
                message={APP_STRINGS.empty.noMatchesMessage}
              />
            </View>
          )
        ) : (
          categoryRails.map((rail) =>
            rail.items.length ? (
              <SearchRail
                key={rail.id}
                items={rail.items}
                renderItem={renderItem}
                subtitle={rail.subtitle}
                title={rail.title}
              />
            ) : null,
          )
        )}
      </ScrollView>
    </View>
  );
}

type SearchRailProps = {
  title: string;
  subtitle: string;
  items: MediaItem[];
  renderItem: ListRenderItem<MediaItem>;
};

function SearchRail({ title, subtitle, items, renderItem }: SearchRailProps) {
  const { colors } = useAppTheme();

  return (
    <View className="mb-8">
      <View className="mb-3 px-5">
        <Text className="text-xl font-black" style={{ color: colors.text }}>
          {title}
        </Text>
        <Text className="mt-1 text-sm" style={{ color: colors.textMuted }}>
          {subtitle}
        </Text>
      </View>
      <FlatList
        data={items}
        horizontal
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20 }}
      />
    </View>
  );
}
