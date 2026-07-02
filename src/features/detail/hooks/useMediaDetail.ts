import { useCallback, useEffect, useState } from 'react';

import { APP_STRINGS } from '@/constants/string';
import { apiService } from '@/data/apiService';
import type { MediaDetailResponse, MediaItem } from '@/types/media';

type MediaDetailState = {
  detail: MediaDetailResponse | null;
  item: MediaItem | null;
  related: MediaItem[];
  error: string | null;
  isLoading: boolean;
};

export function useMediaDetail(mediaId?: string) {
  const [state, setState] = useState<MediaDetailState>({
    detail: null,
    item: null,
    related: [],
    error: null,
    isLoading: true,
  });

  const loadDetail = useCallback(async () => {
    if (!mediaId) {
      setState({
        detail: null,
        item: null,
        related: [],
        error: APP_STRINGS.errors.missingMediaId,
        isLoading: false,
      });
      return;
    }

    setState((current) => ({ ...current, error: null, isLoading: true }));

    try {
      const detail = await apiService.getMediaDetailView(mediaId);
      setState({
        detail,
        item: detail.item,
        related: detail.related,
        error: null,
        isLoading: false,
      });
    } catch (error) {
      setState({
        detail: null,
        item: null,
        related: [],
        error: error instanceof Error ? error.message : APP_STRINGS.errors.unableToLoadTitle,
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
            detail: null,
            item: null,
            related: [],
            error: APP_STRINGS.errors.missingMediaId,
            isLoading: false,
          });
        }
        return;
      }

      apiService
        .getMediaDetailView(mediaId)
        .then((detail) => {
          if (isMounted) {
            setState({
              detail,
              item: detail.item,
              related: detail.related,
              error: null,
              isLoading: false,
            });
          }
        })
        .catch((error: unknown) => {
          if (isMounted) {
            setState({
              detail: null,
              item: null,
              related: [],
              error: error instanceof Error ? error.message : APP_STRINGS.errors.unableToLoadTitle,
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
