import { Ionicons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import type { ListRenderItem } from 'react-native';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { SearchSkeleton } from '@/components/common/Skeleton';
import { MediaCard } from '@/components/media/MediaCard';
import { APP_STRINGS } from '@/constants/string';
import { apiService } from '@/data/apiService';
import { useAppTheme } from '@/theme/AppTheme';
import type { MediaItem, MediaRail as MediaRailType } from '@/types/media';
import { selectionHaptic } from '@/utils/haptics';
import { SEARCH_RAIL_LIST_PROPS } from '@/utils/listPerf';
import { useResponsiveMetrics } from '@/utils/responsive';
import { getTabBarContentPadding } from '@/utils/tabBar';

const SEARCH_RAIL_ITEM_WIDTH = 156;
const SEARCH_PAGE_SIZE = 6;

type SearchResultsState = {
  items: MediaItem[];
  query: string;
  page: number;
  hasMore: boolean;
  isLoadingMore: boolean;
};

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();
  const metrics = useResponsiveMetrics();
  const [query, setQuery] = useState('');
  const [browseRails, setBrowseRails] = useState<MediaRailType[]>([]);
  const [searchState, setSearchState] = useState<SearchResultsState>({
    hasMore: false,
    items: [],
    isLoadingMore: false,
    page: 0,
    query: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const normalizedQuery = useMemo(() => query.trim().toLowerCase(), [query]);
  const displayQuery = useMemo(() => query.trim(), [query]);
  const searchResults = searchState.query === normalizedQuery ? searchState.items : [];
  const canLoadMore =
    Boolean(normalizedQuery) &&
    searchState.query === normalizedQuery &&
    searchState.hasMore &&
    !searchState.isLoadingMore;

  const loadBrowseRails = useCallback(async () => {
    const response = await apiService.getSearchBrowse();
    setBrowseRails(response.rails);
    setError(null);
  }, []);

  const loadSearchPage = useCallback(
    async (searchQuery: string, page: number, mode: 'replace' | 'append') => {
      if (!searchQuery) {
        return;
      }

      if (mode === 'append') {
        setSearchState((current) => ({ ...current, isLoadingMore: true }));
      }

      const response = await apiService.getMediaPage({
        page,
        pageSize: SEARCH_PAGE_SIZE,
        query: searchQuery,
      });

      setSearchState((current) => ({
        hasMore: response.hasMore,
        items: mode === 'append' && current.query === searchQuery
          ? [...current.items, ...response.items]
          : response.items,
        isLoadingMore: false,
        page: response.page,
        query: searchQuery,
      }));
      setError(null);
    },
    [],
  );

  useEffect(() => {
    let isMounted = true;

    apiService
      .getSearchBrowse()
      .then((response) => {
        if (isMounted) {
          setBrowseRails(response.rails);
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

  useEffect(() => {
    if (!normalizedQuery) {
      return;
    }

    let isMounted = true;

    apiService
      .getMediaPage({
        page: 1,
        pageSize: SEARCH_PAGE_SIZE,
        query: normalizedQuery,
      })
      .then((response) => {
        if (isMounted) {
          setSearchState({
            hasMore: response.hasMore,
            items: response.items,
            isLoadingMore: false,
            page: response.page,
            query: normalizedQuery,
          });
          setError(null);
        }
      })
      .catch((loadError) => {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : APP_STRINGS.errors.unableToLoadSearch);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [normalizedQuery]);

  const handleSelectMedia = useCallback((item: MediaItem) => {
    router.push({
      pathname: '/detail/[mediaId]',
      params: { mediaId: item.id },
    } as unknown as Href);
  }, []);

  const renderItem = useCallback<ListRenderItem<MediaItem>>(
    ({ item }) => (
      <View className="mr-4">
        <MediaCard
          item={item}
          onPress={handleSelectMedia}
        />
      </View>
    ),
    [handleSelectMedia],
  );
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);

    Promise.all([
      loadBrowseRails(),
      normalizedQuery ? loadSearchPage(normalizedQuery, 1, 'replace') : Promise.resolve(),
    ])
      .catch((loadError) => {
        setError(loadError instanceof Error ? loadError.message : APP_STRINGS.errors.unableToLoadSearch);
      })
      .finally(() => {
        setIsRefreshing(false);
      });
  }, [loadBrowseRails, loadSearchPage, normalizedQuery]);
  const handleLoadMore = useCallback(() => {
    if (!canLoadMore) {
      return;
    }

    loadSearchPage(normalizedQuery, searchState.page + 1, 'append').catch((loadError) => {
      setSearchState((current) => ({ ...current, isLoadingMore: false }));
      setError(loadError instanceof Error ? loadError.message : APP_STRINGS.errors.unableToLoadSearch);
    });
  }, [canLoadMore, loadSearchPage, normalizedQuery, searchState.page]);

  if (isLoading) {
    return <SearchSkeleton />;
  }

  if (error) {
    return (
      <View
        className="flex-1"
        style={{
          backgroundColor: colors.background,
          paddingHorizontal: metrics.horizontalPadding,
          paddingTop: metrics.headerTopPadding,
        }}>
        <ErrorState
          title={APP_STRINGS.errors.searchUnavailable}
          message={error}
          onRetry={() => setError(null)}
        />
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <View
        className="border-b"
        style={{
          backgroundColor: colors.background,
          borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(15,23,42,0.1)',
          paddingBottom: metrics.isCompact ? 16 : 20,
          paddingHorizontal: metrics.horizontalPadding,
          paddingTop: metrics.headerTopPadding,
        }}>
        <Text className="text-3xl font-black" style={{ color: colors.text }}>
          {APP_STRINGS.search.title}
        </Text>
        <Text className="mt-1 text-sm font-semibold" style={{ color: colors.textMuted }}>
          {APP_STRINGS.search.subtitle}
        </Text>

        <View
          className="flex-row items-center rounded-lg border px-4"
          style={{
            backgroundColor: colors.surface,
            borderColor: isDark ? 'rgba(255,255,255,0.1)' : colors.border,
            marginTop: metrics.isCompact ? 16 : 20,
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
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#FFFFFF"
            progressBackgroundColor="#10141F"
            colors={['#4F8CFF']}
          />
        }
        contentContainerStyle={{
          paddingBottom: getTabBarContentPadding(insets.bottom),
        }}>
        {displayQuery ? (
          searchResults.length ? (
            <View className="pt-5">
              <Text
                className="mb-4 text-sm font-bold"
                style={{ color: colors.textMuted, paddingHorizontal: metrics.horizontalPadding }}>
                {APP_STRINGS.search.resultLabel(displayQuery)}
              </Text>
              <MemoizedSearchRail
                items={searchResults}
                renderItem={renderItem}
                subtitle={APP_STRINGS.search.resultSubtitle}
                title={APP_STRINGS.search.resultTitle}
                hasMore={searchState.hasMore}
                isLoadingMore={searchState.isLoadingMore}
                onEndReached={handleLoadMore}
              />
            </View>
          ) : (
            <View
              style={{
                paddingHorizontal: metrics.horizontalPadding,
                paddingTop: metrics.isCompact ? 32 : 40,
              }}>
              <Text className="mb-4 text-sm font-bold" style={{ color: colors.textMuted }}>
                {APP_STRINGS.search.resultLabel(displayQuery)}
              </Text>
              <EmptyState
                title={APP_STRINGS.empty.noMatchesTitle}
                message={APP_STRINGS.empty.noMatchesMessage}
              />
            </View>
          )
        ) : (
          browseRails.map((rail) =>
            rail.items.length ? (
              <MemoizedSearchRail
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
  subtitle?: string;
  items: MediaItem[];
  renderItem: ListRenderItem<MediaItem>;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onEndReached?: () => void;
};

function SearchRail({
  title,
  subtitle,
  items,
  renderItem,
  hasMore = false,
  isLoadingMore = false,
  onEndReached,
}: SearchRailProps) {
  const { colors } = useAppTheme();
  const metrics = useResponsiveMetrics();
  const renderFooter = useCallback(() => {
    if (!isLoadingMore && !hasMore) {
      return null;
    }

    return (
      <View className="h-full w-12 items-center justify-center">
        {isLoadingMore ? <ActivityIndicator color="#4F8CFF" /> : null}
      </View>
    );
  }, [hasMore, isLoadingMore]);

  return (
    <View style={{ marginBottom: metrics.isCompact ? 24 : 32 }}>
      <View style={{ marginBottom: 12, paddingHorizontal: metrics.horizontalPadding }}>
        <Text className="text-xl font-black" style={{ color: colors.text }}>
          {title}
        </Text>
        {subtitle ? (
          <Text className="mt-1 text-sm" style={{ color: colors.textMuted }}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <FlatList
        {...SEARCH_RAIL_LIST_PROPS}
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        getItemLayout={(_, index) => ({
          index,
          length: SEARCH_RAIL_ITEM_WIDTH,
          offset: SEARCH_RAIL_ITEM_WIDTH * index,
        })}
        contentContainerStyle={{ paddingHorizontal: metrics.horizontalPadding }}
        ListFooterComponent={renderFooter}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.35}
      />
    </View>
  );
}

const MemoizedSearchRail = memo(SearchRail);
