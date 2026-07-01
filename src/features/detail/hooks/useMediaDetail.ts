import { useCallback, useEffect, useState } from 'react';

import { apiService } from '@/data/apiService';
import type { MediaItem } from '@/types/media';

type MediaDetailState = {
  item: MediaItem | null;
  related: MediaItem[];
  error: string | null;
  isLoading: boolean;
};

export function useMediaDetail(mediaId?: string) {
  const [state, setState] = useState<MediaDetailState>({
    item: null,
    related: [],
    error: null,
    isLoading: true,
  });

  const loadDetail = useCallback(async () => {
    if (!mediaId) {
      setState({
        item: null,
        related: [],
        error: 'Missing media id.',
        isLoading: false,
      });
      return;
    }

    setState((current) => ({ ...current, error: null, isLoading: true }));

    try {
      const [item, related] = await Promise.all([
        apiService.getMediaDetail(mediaId),
        apiService.getRelatedMedia(mediaId),
      ]);
      setState({ item, related, error: null, isLoading: false });
    } catch (error) {
      setState({
        item: null,
        related: [],
        error: error instanceof Error ? error.message : 'Unable to load title.',
        isLoading: false,
      });
    }
  }, [mediaId]);

  useEffect(() => {
    let isMounted = true;

    const timeoutId = setTimeout(() => {
      if (!mediaId) {
        if (isMounted) {
          setState({
            item: null,
            related: [],
            error: 'Missing media id.',
            isLoading: false,
          });
        }
        return;
      }

      Promise.all([apiService.getMediaDetail(mediaId), apiService.getRelatedMedia(mediaId)])
        .then(([item, related]) => {
          if (isMounted) {
            setState({ item, related, error: null, isLoading: false });
          }
        })
        .catch((error: unknown) => {
          if (isMounted) {
            setState({
              item: null,
              related: [],
              error: error instanceof Error ? error.message : 'Unable to load title.',
              isLoading: false,
            });
          }
        });
    }, 0);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [mediaId]);

  return { ...state, retry: loadDetail };
}
