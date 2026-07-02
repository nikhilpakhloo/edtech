import { useCallback, useEffect, useState } from 'react';

import { APP_STRINGS } from '@/constants/string';
import { apiService } from '@/data/apiService';
import type { HomeFeedResponse } from '@/types/media';

type HomeFeedState = {
  data: HomeFeedResponse | null;
  error: string | null;
  isLoading: boolean;
  isRefreshing: boolean;
};

export function useHomeFeed() {
  const [state, setState] = useState<HomeFeedState>({
    data: null,
    error: null,
    isLoading: true,
    isRefreshing: false,
  });

  const loadFeed = useCallback(async (mode: 'initial' | 'refresh' = 'initial') => {
    setState((current) => ({
      ...current,
      error: null,
      isLoading: mode === 'initial',
      isRefreshing: mode === 'refresh',
    }));

    try {
      const data = await apiService.getHomeFeed();
      setState({ data, error: null, isLoading: false, isRefreshing: false });
    } catch (error) {
      setState((current) => ({
        data: mode === 'refresh' ? current.data : null,
        error: error instanceof Error ? error.message : APP_STRINGS.errors.unableToLoadEdStream,
        isLoading: false,
        isRefreshing: false,
      }));
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const timeoutId = setTimeout(() => {
      apiService
        .getHomeFeed()
        .then((data) => {
          if (isMounted) {
            setState({ data, error: null, isLoading: false, isRefreshing: false });
          }
        })
        .catch((error: unknown) => {
          if (isMounted) {
            setState({
              data: null,
              error: error instanceof Error ? error.message : APP_STRINGS.errors.unableToLoadEdStream,
              isLoading: false,
              isRefreshing: false,
            });
          }
        });
    }, 0);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, []);

  return {
    ...state,
    refresh: () => loadFeed('refresh'),
    retry: () => loadFeed('initial'),
  };
}
