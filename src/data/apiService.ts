import { APP_STRINGS } from '@/constants/string';
import mockCatalog from '@/data/mockCatalog.json';
import type {
  DetailAction,
  DetailContentSection,
  DetailMetadataGroup,
  DetailMetric,
  HomeFeedResponse,
  HomeModeId,
  HomeModeOption,
  HomeRailPageResponse,
  MediaDetailResponse,
  MediaItem,
  MediaRail,
  PaginatedMediaResponse,
  ProfileResponse,
  SearchBrowseResponse,
} from '@/types/media';

const NETWORK_DELAY_MS = 650;
const HOME_MORE_RAIL_TITLES = {
  learn: [
    APP_STRINGS.home.rails.deepLearningTracks.title,
    APP_STRINGS.home.rails.documentaryPicks.title,
    APP_STRINGS.home.rails.continueLearning.title,
  ],
  practice: [
    APP_STRINGS.home.rails.skillSprints.title,
    APP_STRINGS.home.rails.livePracticeArenas.title,
    APP_STRINGS.home.rails.practiceRecommended.title,
  ],
} as const;

type MockCatalog = {
  mediaItems: MediaItem[];
  home: {
    defaultMode: HomeModeId;
    modes: HomeModeOption[];
    feeds: Record<HomeModeId, MockHomeFeed>;
  };
  search: {
    rails: MockSearchRail[];
  };
  profile: ProfileResponse;
};

type MockHomeFeed = {
  heroId: string;
  carouselIds: string[];
  rails: MockMediaRail[];
};

type MockMediaRail = {
  id: string;
  title: string;
  subtitle?: string;
  itemIds: string[];
};

type MockSearchRail = {
  id: string;
  title: string;
  subtitle: string;
  filter: {
    genres?: string[];
    isTrending?: boolean;
  };
};

const catalog = mockCatalog as MockCatalog;

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

function clone<T>(payload: T): T {
  return JSON.parse(JSON.stringify(payload)) as T;
}

function getMediaById() {
  return catalog.mediaItems.reduce<Record<string, MediaItem>>((acc, item) => {
    acc[item.id] = item;
    return acc;
  }, {});
}

function resolveMediaList(ids: string[]) {
  const byId = getMediaById();

  return ids.map((id) => byId[id]).filter(Boolean);
}

function resolveRail(rail: MockMediaRail): MediaRail {
  return {
    id: rail.id,
    items: resolveMediaList(rail.itemIds),
    subtitle: rail.subtitle,
    title: rail.title,
  };
}

function rotateMediaItems(page: number, pageSize: number, mode: HomeModeId) {
  const offset = mode === 'practice' ? 2 : 0;

  return Array.from({ length: pageSize }, (_, index) => {
    const itemIndex = (offset + (page - 1) * pageSize + index) % catalog.mediaItems.length;

    return catalog.mediaItems[itemIndex];
  });
}

function buildHomeMoreRail(mode: HomeModeId, page: number, pageSize: number): MediaRail {
  const titleOptions = HOME_MORE_RAIL_TITLES[mode];
  const title = titleOptions[(page - 1) % titleOptions.length];

  return {
    id: `${mode}-more-${page}`,
    items: rotateMediaItems(page, pageSize, mode),
    subtitle:
      mode === 'learn'
        ? APP_STRINGS.home.modes.learn.swipeSuffix
        : APP_STRINGS.home.modes.practice.swipeSuffix,
    title,
  };
}

function matchesSearchRail(item: MediaItem, rail: MockSearchRail) {
  const { filter } = rail;

  if (typeof filter.isTrending === 'boolean' && item.isTrending !== filter.isTrending) {
    return false;
  }

  if (filter.genres?.length) {
    return item.genres.some((genre) => filter.genres?.includes(genre));
  }

  return true;
}

function searchMediaItems(items: MediaItem[], query: string) {
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
}

function getRuntimeLabel(item: MediaItem) {
  if (item.seasonCount) {
    return APP_STRINGS.format.season(item.seasonCount);
  }

  if (item.runtimeMinutes) {
    const hours = Math.floor(item.runtimeMinutes / 60);
    const remainingMinutes = item.runtimeMinutes % 60;

    return hours
      ? APP_STRINGS.format.hoursMinutes(hours, remainingMinutes)
      : APP_STRINGS.format.minutes(remainingMinutes);
  }

  return APP_STRINGS.common.live;
}

function getProgressLabel(item: MediaItem) {
  if (!item.progressPercent) {
    return item.isTrending ? APP_STRINGS.detail.trendingMetric : APP_STRINGS.detail.newMetric;
  }

  return `${Math.round(item.progressPercent * 100)}%`;
}

function getRelatedItems(id: string) {
  const selected = getMediaById()[id];

  if (!selected) {
    return [];
  }

  const related = catalog.mediaItems
    .filter((item) => item.id !== id)
    .filter((item) => item.genres.some((genre) => selected.genres.includes(genre)))
    .slice(0, 6);

  return related.length ? related : catalog.mediaItems.slice(0, 6);
}

function buildDetailActions(item: MediaItem): DetailAction[] {
  return [
    {
      id: 'primary',
      icon: 'play',
      kind: 'primary',
      label: item.primaryActionLabel,
    },
    {
      id: 'watchlist',
      icon: 'bookmark-outline',
      kind: 'secondary',
      label: APP_STRINGS.media.watchlist,
    },
    {
      id: 'download',
      icon: 'download-outline',
      kind: 'secondary',
      label: APP_STRINGS.detail.downloadAction,
    },
    {
      id: 'share',
      icon: 'share-social-outline',
      kind: 'secondary',
      label: APP_STRINGS.detail.shareAction,
    },
  ];
}

function buildDetailMetrics(item: MediaItem): DetailMetric[] {
  return [
    { id: 'runtime', label: APP_STRINGS.detail.metrics.runtime, value: getRuntimeLabel(item) },
    { id: 'level', label: APP_STRINGS.detail.metrics.level, value: item.rating },
    { id: 'progress', label: APP_STRINGS.detail.metrics.progress, value: getProgressLabel(item) },
    { id: 'year', label: APP_STRINGS.detail.metrics.year, value: String(item.releaseYear) },
  ];
}

function buildMetadataGroups(item: MediaItem): DetailMetadataGroup[] {
  return [
    {
      id: 'languages',
      title: APP_STRINGS.detail.metadata.languages,
      values: item.languages,
    },
    {
      id: 'genres',
      title: APP_STRINGS.detail.metadata.genres,
      values: item.genres,
    },
    {
      id: 'format',
      title: APP_STRINGS.detail.metadata.format,
      values: [
        item.kind.toUpperCase(),
        item.streamType.toUpperCase(),
        item.isPremium ? APP_STRINGS.media.premium : APP_STRINGS.detail.included,
      ],
    },
    {
      id: 'guidance',
      title: APP_STRINGS.detail.metadata.guidance,
      values: [item.maturityNote],
    },
  ];
}

function buildDetailSections(item: MediaItem): DetailContentSection[] {
  return [
    {
      id: 'overview',
      title: APP_STRINGS.detail.sections.overview,
      body: item.description,
    },
    {
      id: 'outcomes',
      title: APP_STRINGS.detail.sections.outcomes,
      bullets: item.genres.slice(0, 3).map((genre) => APP_STRINGS.detail.outcomeForGenre(genre)),
    },
    {
      id: 'session',
      title: APP_STRINGS.detail.sections.session,
      bullets: [
        APP_STRINGS.detail.sessionBullet(getRuntimeLabel(item)),
        item.episodeCount
          ? APP_STRINGS.detail.episodeBullet(item.episodeCount)
          : APP_STRINGS.detail.selfPacedBullet,
        APP_STRINGS.detail.languageBullet(item.languages.join(' / ')),
      ],
    },
  ];
}

function buildMediaDetailResponse(item: MediaItem): MediaDetailResponse {
  return {
    actions: buildDetailActions(item),
    item,
    metadataGroups: buildMetadataGroups(item),
    metrics: buildDetailMetrics(item),
    related: getRelatedItems(item.id),
    sections: buildDetailSections(item),
  };
}

export const apiService = {
  getHomeFeed(mode: HomeModeId = catalog.home.defaultMode): Promise<HomeFeedResponse> {
    const feed = catalog.home.feeds[mode] ?? catalog.home.feeds[catalog.home.defaultMode];
    const byId = getMediaById();
    const hero = byId[feed.heroId] ?? catalog.mediaItems[0];

    return delay(
      clone({
        activeMode: mode,
        carousel: resolveMediaList(feed.carouselIds),
        hero,
        modes: catalog.home.modes,
        rails: feed.rails.map(resolveRail),
      }),
    );
  },

  getHomeRailPage({
    mode = catalog.home.defaultMode,
    page = 1,
    pageSize = 6,
  }: {
    mode?: HomeModeId;
    page?: number;
    pageSize?: number;
  }): Promise<HomeRailPageResponse> {
    const safePage = Math.max(1, page);
    const safePageSize = Math.max(1, pageSize);

    return delay(
      clone({
        activeMode: mode,
        hasMore: true,
        page: safePage,
        pageSize: safePageSize,
        rails: [buildHomeMoreRail(mode, safePage, safePageSize)],
      }),
      420,
    );
  },

  getAllMedia(): Promise<MediaItem[]> {
    return delay(clone(catalog.mediaItems), 320);
  },

  getSearchBrowse(): Promise<SearchBrowseResponse> {
    const rails = catalog.search.rails.map((rail) => ({
      id: rail.id,
      items: catalog.mediaItems.filter((item) => matchesSearchRail(item, rail)),
      subtitle: rail.subtitle,
      title: rail.title,
    }));

    return delay(clone({ rails }), 360);
  },

  searchMedia(query: string): Promise<MediaItem[]> {
    return delay(clone(searchMediaItems(catalog.mediaItems, query)), query.trim() ? 260 : 220);
  },

  getMediaPage({
    page = 1,
    pageSize = 6,
    query = '',
  }: {
    page?: number;
    pageSize?: number;
    query?: string;
  }): Promise<PaginatedMediaResponse> {
    const allItems = searchMediaItems(catalog.mediaItems, query);
    const safePage = Math.max(1, page);
    const safePageSize = Math.max(1, pageSize);
    const startIndex = (safePage - 1) * safePageSize;
    const items = allItems.slice(startIndex, startIndex + safePageSize);

    return delay(
      clone({
        hasMore: startIndex + safePageSize < allItems.length,
        items,
        page: safePage,
        pageSize: safePageSize,
        total: allItems.length,
      }),
      query.trim() ? 320 : 240,
    );
  },

  getMediaDetail(id: string): Promise<MediaItem> {
    const item = getMediaById()[id];

    if (!item) {
      return rejectAfterDelay(APP_STRINGS.errors.titleNoLongerAvailable);
    }

    return delay(clone(item), 450);
  },

  getMediaDetailView(id: string): Promise<MediaDetailResponse> {
    const item = getMediaById()[id];

    if (!item) {
      return rejectAfterDelay(APP_STRINGS.errors.titleNoLongerAvailable);
    }

    return delay(clone(buildMediaDetailResponse(item)), 520);
  },

  getRelatedMedia(id: string): Promise<MediaItem[]> {
    return delay(clone(getRelatedItems(id)), 500);
  },

  getProfile(): Promise<ProfileResponse> {
    return delay(clone(catalog.profile), 300);
  },
};
