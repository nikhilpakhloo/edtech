export type MediaKind = 'movie' | 'series' | 'live' | 'documentary';
export type StreamType = 'hls' | 'mp4';

export type MediaItem = {
  id: string;
  title: string;
  eyebrow: string;
  description: string;
  kind: MediaKind;
  posterUrl: string;
  backdropUrl: string;
  videoUrl: string;
  trailerUrl: string;
  streamType: StreamType;
  logoUrl?: string;
  genres: string[];
  languages: string[];
  rating: 'U' | 'U/A 7+' | 'U/A 13+' | 'U/A 16+' | 'A';
  releaseYear: number;
  runtimeMinutes?: number;
  seasonCount?: number;
  episodeCount?: number;
  isPremium: boolean;
  isTrending: boolean;
  progressPercent?: number;
  maturityNote: string;
  primaryActionLabel: string;
};

export type MediaRail = {
  id: string;
  title: string;
  subtitle?: string;
  reason?: string;
  items: MediaItem[];
};

export type StudyPlanItem = {
  id: string;
  label: string;
  mediaId: string;
  title: string;
  durationMinutes: number;
  status: 'next' | 'locked-after-video' | 'locked-after-practice' | 'ready' | 'done';
};

export type NextBestAction = {
  title: string;
  subtitle: string;
  lastPlayedLesson?: string;
  mediaId: string;
  progressPercent: number;
  timeRemainingMinutes: number;
  ctaLabel: string;
};

export type HomeModeId = 'learn' | 'practice';

export type HomeModeOption = {
  id: HomeModeId;
  label: string;
  eyebrow: string;
  icon: string;
  activeColors: [string, string, string];
  idleColors: [string, string, string];
};

export type HomeFeedResponse = {
  activeMode: HomeModeId;
  carousel: MediaItem[];
  hero: MediaItem;
  modes: HomeModeOption[];
  nextBestAction?: NextBestAction;
  rails: MediaRail[];
  studyPlan?: StudyPlanItem[];
};

export type HomeRailPageResponse = {
  activeMode: HomeModeId;
  rails: MediaRail[];
  page: number;
  pageSize: number;
  hasMore: boolean;
};

export type ProfileSetting = {
  id: string;
  title: string;
  description: string;
  value: string;
  enabled?: boolean;
};

export type ProfileDashboardStat = {
  id: string;
  label: string;
  value: string;
  suffix: string;
};

export type ProfileQuickAction = {
  id: string;
  label: string;
  caption: string;
  icon: string;
};

export type ProfileDashboard = {
  headline: string;
  summary: string;
  stats: ProfileDashboardStat[];
  quickActions: ProfileQuickAction[];
  streakMessage: string;
};

export type ProfileResponse = {
  displayName: string;
  planName: string;
  avatarInitials: string;
  dashboard?: ProfileDashboard;
  settings: ProfileSetting[];
};

export type SearchBrowseResponse = {
  rails: MediaRail[];
};

export type PaginatedMediaResponse = {
  items: MediaItem[];
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
};

export type DetailAction = {
  id: 'primary' | 'watchlist' | 'download' | 'share';
  label: string;
  icon: string;
  kind: 'primary' | 'secondary';
};

export type DetailMetric = {
  id: string;
  label: string;
  value: string;
};

export type DetailMetadataGroup = {
  id: string;
  title: string;
  values: string[];
};

export type DetailContentSection = {
  id: string;
  title: string;
  body?: string;
  bullets?: string[];
};

export type MediaDetailResponse = {
  item: MediaItem;
  actions: DetailAction[];
  metrics: DetailMetric[];
  metadataGroups: DetailMetadataGroup[];
  sections: DetailContentSection[];
  related: MediaItem[];
};
