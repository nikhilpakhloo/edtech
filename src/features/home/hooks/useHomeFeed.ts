import { useCallback, useEffect, useState } from 'react';

import { APP_STRINGS } from '@/constants/string';
import { apiService } from '@/data/apiService';
import type { HomeFeedResponse, HomeModeId } from '@/types/media';

type HomeFeedState = {
  data: HomeFeedResponse | null;
  error: string | null;
  hasMore: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
  isRefreshing: boolean;
  nextPage: number;
};

const HOME_RAIL_PAGE_SIZE = 6;

export function useHomeFeed(mode: HomeModeId) {
  const [state, setState] = useState<HomeFeedState>({
    data: null,
    error: null,
    hasMore: true,
    isLoading: true,
    isLoadingMore: false,
    isRefreshing: false,
    nextPage: 1,
  });

  const loadFeed = useCallback(async (loadMode: 'initial' | 'refresh' | 'silent' = 'initial') => {
    setState((current) => ({
      ...current,
      error: null,
      hasMore: loadMode === 'refresh' ? current.hasMore : true,
      isLoading: loadMode === 'initial' || loadMode === 'refresh',
      isLoadingMore: false,
      isRefreshing: false,
      nextPage: loadMode === 'refresh' ? current.nextPage : 1,
    }));

    try {
      const data = await apiService.getHomeFeed(mode);
      setState({
        data,
        error: null,
        hasMore: true,
        isLoading: false,
        isLoadingMore: false,
        isRefreshing: false,
        nextPage: 1,
      });
    } catch (error) {
      setState((current) => ({
        data: loadMode === 'refresh' || loadMode === 'silent' ? current.data : null,
        error: error instanceof Error ? error.message : APP_STRINGS.errors.unableToLoadEdStream,
        hasMore: loadMode === 'refresh' ? current.hasMore : true,
        isLoading: false,
        isLoadingMore: false,
        isRefreshing: false,
        nextPage: loadMode === 'refresh' ? current.nextPage : 1,
      }));
    }
  }, [mode]);

  const loadMore = useCallback(async () => {
    if (!state.data || state.isLoading || state.isRefreshing || state.isLoadingMore || !state.hasMore) {
      return;
    }

    setState((current) => ({
      ...current,
      error: null,
      isLoadingMore: true,
    }));

    try {
      const response = await apiService.getHomeRailPage({
        mode,
        page: state.nextPage,
        pageSize: HOME_RAIL_PAGE_SIZE,
      });

      setState((current) => {
        if (!current.data || response.activeMode !== current.data.activeMode) {
          return {
            ...current,
            isLoadingMore: false,
          };
        }

        return {
          ...current,
          data: {
            ...current.data,
            rails: [...current.data.rails, ...response.rails],
          },
          hasMore: response.hasMore,
          isLoadingMore: false,
          nextPage: response.page + 1,
        };
      });
    } catch (error) {
      setState((current) => ({
        ...current,
        error: error instanceof Error ? error.message : APP_STRINGS.errors.unableToLoadEdStream,
        isLoadingMore: false,
      }));
    }
  }, [mode, state.data, state.hasMore, state.isLoading, state.isLoadingMore, state.isRefreshing, state.nextPage]);

  useEffect(() => {
    let isMounted = true;

    setState((current) => ({
      ...current,
      error: null,
      hasMore: true,
      isLoading: true,
      isLoadingMore: false,
      isRefreshing: false,
      nextPage: 1,
    }));

    const timeoutId = setTimeout(() => {
      apiService
        .getHomeFeed(mode)
        .then((data) => {
          if (isMounted) {
            setState({
              data,
              error: null,
              hasMore: true,
              isLoading: false,
              isLoadingMore: false,
              isRefreshing: false,
              nextPage: 1,
            });
          }
        })
        .catch((error: unknown) => {
          if (isMounted) {
            setState({
              data: null,
              error: error instanceof Error ? error.message : APP_STRINGS.errors.unableToLoadEdStream,
              hasMore: true,
              isLoading: false,
              isLoadingMore: false,
              isRefreshing: false,
              nextPage: 1,
            });
          }
        });
    }, 0);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [mode]);

  const refresh = useCallback(() => loadFeed('refresh'), [loadFeed]);
  const retry = useCallback(() => loadFeed('initial'), [loadFeed]);
  const silentRefresh = useCallback(() => loadFeed('silent'), [loadFeed]);

  return {
    ...state,
    loadMore,
    refresh,
    retry,
    silentRefresh,
  };
}
