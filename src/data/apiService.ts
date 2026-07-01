import { HOME_FEED, MEDIA_BY_ID, PROFILE } from '@/data/mockMedia';
import type { HomeFeedResponse, MediaItem, ProfileResponse } from '@/types/media';

const NETWORK_DELAY_MS = 650;

function delay<T>(payload: T, timeout = NETWORK_DELAY_MS): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(payload), timeout);
  });
}

function rejectAfterDelay(message: string, timeout = NETWORK_DELAY_MS): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(message)), timeout);
  });
}

export const apiService = {
  getHomeFeed(): Promise<HomeFeedResponse> {
    return delay(HOME_FEED);
  },

  getAllMedia(): Promise<MediaItem[]> {
    return delay(Object.values(MEDIA_BY_ID), 320);
  },

  searchMedia(query: string): Promise<MediaItem[]> {
    const normalizedQuery = query.trim().toLowerCase();
    const allMedia = Object.values(MEDIA_BY_ID);

    if (!normalizedQuery) {
      return delay(allMedia, 220);
    }

    const matches = allMedia.filter((item) => {
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

    return delay(matches, 260);
  },

  getMediaDetail(id: string): Promise<MediaItem> {
    const item = MEDIA_BY_ID[id];

    if (!item) {
      return rejectAfterDelay('This title is no longer available.');
    }

    return delay(item, 450);
  },

  getRelatedMedia(id: string): Promise<MediaItem[]> {
    const selected = MEDIA_BY_ID[id];

    if (!selected) {
      return delay([]);
    }

    const related = Object.values(MEDIA_BY_ID)
      .filter((item) => item.id !== id)
      .filter((item) => item.genres.some((genre) => selected.genres.includes(genre)))
      .slice(0, 6);

    return delay(related.length ? related : Object.values(MEDIA_BY_ID).slice(0, 6), 500);
  },

  getProfile(): Promise<ProfileResponse> {
    return delay(PROFILE, 300);
  },
};
