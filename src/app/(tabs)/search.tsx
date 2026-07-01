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
          setError(loadError instanceof Error ? loadError.message : 'Unable to load search.');
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
        title: 'Trending Searches',
        subtitle: 'Popular across EdStream right now',
        items: items.filter((item) => item.isTrending),
      },
      {
        id: 'science',
        title: 'Science Labs',
        subtitle: 'Physics, chemistry, biology, and concept builders',
        items: items.filter((item) =>
          item.genres.some((genre) => ['Physics', 'Chemistry', 'Biology', 'Science'].includes(genre)),
        ),
      },
      {
        id: 'exam',
        title: 'Exam Prep',
        subtitle: 'NEET, JEE, revision, and timed practice',
        items: items.filter((item) =>
          item.genres.some((genre) => ['Exams', 'NEET', 'JEE', 'Revision'].includes(genre)),
        ),
      },
      {
        id: 'career',
        title: 'Career and Communication',
        subtitle: 'Data, finance, public speaking, and job-ready skills',
        items: items.filter((item) =>
          item.genres.some((genre) =>
            ['Data Science', 'Finance', 'Communication', 'Soft Skills', 'Business'].includes(genre),
          ),
        ),
      },
      {
        id: 'all',
        title: 'All Learning',
        subtitle: 'Everything in the mock catalog',
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
        <ErrorState title="Search unavailable" message={error} onRetry={() => setError(null)} />
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
          Search
        </Text>
        <Text className="mt-1 text-sm font-semibold" style={{ color: colors.textMuted }}>
          Find lessons, live challenges, documentaries, and exam tracks.
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
            placeholder="Search by title, skill, language..."
            placeholderTextColor="#64748B"
            className="ml-3 h-12 flex-1 text-base font-semibold"
            style={{ color: colors.text }}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {query ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Clear search"
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
                {`Showing results for "${query.trim()}"`}
              </Text>
              <SearchRail
                items={filteredItems}
                renderItem={renderItem}
                subtitle="Matching titles from the full EdStream catalog"
                title="Search Results"
              />
            </View>
          ) : (
            <View className="px-5 pt-10">
              <Text className="mb-4 text-sm font-bold" style={{ color: colors.textMuted }}>
                {`Showing results for "${query.trim()}"`}
              </Text>
              <EmptyState
                title="No matches"
                message="Try searching another topic, language, or learning track."
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
