import { useCallback, useEffect, useState } from 'react';

import { apiService } from '@/data/apiService';
import type { HomeFeedResponse } from '@/types/media';

type HomeFeedState = {
  data: HomeFeedResponse | null;
  error: string | null;
  isLoading: boolean;
};

export function useHomeFeed() {
  const [state, setState] = useState<HomeFeedState>({
    data: null,
    error: null,
    isLoading: true,
  });

  const loadFeed = useCallback(async () => {
    setState((current) => ({ ...current, error: null, isLoading: true }));

    try {
      const data = await apiService.getHomeFeed();
      setState({ data, error: null, isLoading: false });
    } catch (error) {
      setState({
        data: null,
        error: error instanceof Error ? error.message : 'Unable to load EdStream.',
        isLoading: false,
      });
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const timeoutId = setTimeout(() => {
      apiService
        .getHomeFeed()
        .then((data) => {
          if (isMounted) {
            setState({ data, error: null, isLoading: false });
          }
        })
        .catch((error: unknown) => {
          if (isMounted) {
            setState({
              data: null,
              error: error instanceof Error ? error.message : 'Unable to load EdStream.',
              isLoading: false,
            });
          }
        });
    }, 0);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, []);

  return { ...state, retry: loadFeed };
}
