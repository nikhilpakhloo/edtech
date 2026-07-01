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
  items: MediaItem[];
};

export type HomeFeedResponse = {
  hero: MediaItem;
  rails: MediaRail[];
};

export type ProfileSetting = {
  id: string;
  title: string;
  description: string;
  value: string;
  enabled?: boolean;
};

export type ProfileResponse = {
  displayName: string;
  planName: string;
  avatarInitials: string;
  settings: ProfileSetting[];
};
