import type { MediaItem } from '@/types/media';

export function createMediaItem(overrides: Partial<MediaItem> = {}): MediaItem {
  const id = overrides.id ?? 'sample-media';
  const title = overrides.title ?? 'Sample Lesson';

  return {
    backdropUrl: `https://example.com/${id}-backdrop.jpg`,
    description: 'A short learning session.',
    eyebrow: 'Featured',
    genres: ['Math', 'Practice'],
    id,
    isPremium: false,
    isTrending: false,
    kind: 'series',
    languages: ['English'],
    maturityNote: 'All learners',
    posterUrl: `https://example.com/${id}-poster.jpg`,
    primaryActionLabel: 'Start',
    rating: 'U',
    releaseYear: 2026,
    runtimeMinutes: 42,
    streamType: 'mp4',
    title,
    trailerUrl: `https://example.com/${id}-trailer.mp4`,
    videoUrl: `https://example.com/${id}-video.mp4`,
    ...overrides,
  };
}
