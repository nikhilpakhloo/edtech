import type { HomeFeedResponse, MediaItem, ProfileResponse } from '@/types/media';

const mediaItems: MediaItem[] = [
  {
    id: 'future-of-ai',
    title: 'Future of AI Classrooms',
    eyebrow: 'EdStream Original',
    description:
      'A cinematic masterclass on how adaptive learning, safe AI tutors, and real-time feedback loops are changing modern education.',
    kind: 'documentary',
    posterUrl:
      'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=600&auto=format&fit=crop',
    backdropUrl:
      'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1400&auto=format&fit=crop',
    videoUrl:
      'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    trailerUrl:
      'https://devstreaming-cdn.apple.com/videos/streaming/examples/bipbop_16x9/bipbop_16x9_variant.m3u8',
    streamType: 'hls',
    genres: ['AI', 'Pedagogy', 'Future Skills'],
    languages: ['English', 'Hindi'],
    rating: 'U/A 13+',
    releaseYear: 2026,
    runtimeMinutes: 74,
    isPremium: true,
    isTrending: true,
    progressPercent: 0.32,
    maturityNote: 'Mild thematic material',
    primaryActionLabel: 'Continue Learning',
  },
  {
    id: 'design-systems-lab',
    title: 'Design Systems Lab',
    eyebrow: 'New Series',
    description:
      'Go inside the product rooms where designers and engineers build consistent, scalable, production-ready interfaces.',
    kind: 'series',
    posterUrl:
      'https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=600&auto=format&fit=crop',
    backdropUrl:
      'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?q=80&w=1400&auto=format&fit=crop',
    videoUrl:
      'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8',
    trailerUrl:
      'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    streamType: 'hls',
    genres: ['UI/UX', 'Frontend', 'Systems'],
    languages: ['English'],
    rating: 'U',
    releaseYear: 2026,
    seasonCount: 2,
    episodeCount: 16,
    isPremium: false,
    isTrending: true,
    maturityNote: 'Suitable for all learners',
    primaryActionLabel: 'Watch Episode 1',
  },
  {
    id: 'react-native-shiproom',
    title: 'React Native Shiproom',
    eyebrow: 'Developer Track',
    description:
      'A practical build series covering architecture, navigation, performance, app polish, and release readiness for mobile teams.',
    kind: 'series',
    posterUrl:
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=600&auto=format&fit=crop',
    backdropUrl:
      'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=1400&auto=format&fit=crop',
    videoUrl:
      'https://devstreaming-cdn.apple.com/videos/streaming/examples/bipbop_16x9/bipbop_16x9_variant.m3u8',
    trailerUrl:
      'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8',
    streamType: 'hls',
    genres: ['React Native', 'Expo', 'TypeScript'],
    languages: ['English', 'Tamil'],
    rating: 'U/A 7+',
    releaseYear: 2025,
    seasonCount: 1,
    episodeCount: 12,
    isPremium: true,
    isTrending: false,
    progressPercent: 0.64,
    maturityNote: 'Technical content',
    primaryActionLabel: 'Resume Series',
  },
  {
    id: 'math-premier-league',
    title: 'Math Premier League',
    eyebrow: 'Live Challenge',
    description:
      'Teams race through logic, probability, and geometry challenges in a live studio format built for competitive learning.',
    kind: 'live',
    posterUrl:
      'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=600&auto=format&fit=crop',
    backdropUrl:
      'https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=1400&auto=format&fit=crop',
    videoUrl:
      'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    trailerUrl:
      'https://devstreaming-cdn.apple.com/videos/streaming/examples/bipbop_16x9/bipbop_16x9_variant.m3u8',
    streamType: 'hls',
    genres: ['Math', 'Live', 'Competition'],
    languages: ['English', 'Hindi', 'Telugu'],
    rating: 'U',
    releaseYear: 2026,
    isPremium: false,
    isTrending: true,
    maturityNote: 'Live classroom format',
    primaryActionLabel: 'Join Live',
  },
  {
    id: 'history-in-motion',
    title: 'History in Motion',
    eyebrow: 'Top Pick',
    description:
      'Animated timelines, expert commentary, and immersive maps turn major world events into vivid learning journeys.',
    kind: 'documentary',
    posterUrl:
      'https://images.unsplash.com/photo-1461360370896-922624d12aa1?q=80&w=600&auto=format&fit=crop',
    backdropUrl:
      'https://images.unsplash.com/photo-1505664194779-8beaceb93744?q=80&w=1400&auto=format&fit=crop',
    videoUrl:
      'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8',
    trailerUrl:
      'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    streamType: 'hls',
    genres: ['History', 'World Affairs', 'Maps'],
    languages: ['English'],
    rating: 'U/A 13+',
    releaseYear: 2024,
    runtimeMinutes: 58,
    isPremium: false,
    isTrending: false,
    maturityNote: 'Historical conflict references',
    primaryActionLabel: 'Start Lesson',
  },
  {
    id: 'startup-casefiles',
    title: 'Startup Casefiles',
    eyebrow: 'Business School',
    description:
      'Real founder stories unpack strategy, product-market fit, pricing, hiring, and the pressure behind breakout companies.',
    kind: 'series',
    posterUrl:
      'https://images.unsplash.com/photo-1556761175-b413da4baf72?q=80&w=600&auto=format&fit=crop',
    backdropUrl:
      'https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=1400&auto=format&fit=crop',
    videoUrl:
      'https://devstreaming-cdn.apple.com/videos/streaming/examples/bipbop_16x9/bipbop_16x9_variant.m3u8',
    trailerUrl:
      'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8',
    streamType: 'hls',
    genres: ['Business', 'Startups', 'Strategy'],
    languages: ['English', 'Hindi'],
    rating: 'U/A 13+',
    releaseYear: 2025,
    seasonCount: 3,
    episodeCount: 24,
    isPremium: true,
    isTrending: true,
    maturityNote: 'Business case discussion',
    primaryActionLabel: 'Watch Now',
  },
  {
    id: 'code-with-creators',
    title: 'Code with Creators',
    eyebrow: 'Weekend Watch',
    description:
      'Creators build polished apps in public, showing design decisions, engineering tradeoffs, and debugging in real time.',
    kind: 'series',
    posterUrl:
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=600&auto=format&fit=crop',
    backdropUrl:
      'https://images.unsplash.com/photo-1550439062-609e1531270e?q=80&w=1400&auto=format&fit=crop',
    videoUrl:
      'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    trailerUrl:
      'https://devstreaming-cdn.apple.com/videos/streaming/examples/bipbop_16x9/bipbop_16x9_variant.m3u8',
    streamType: 'hls',
    genres: ['Coding', 'Product', 'Creative Tech'],
    languages: ['English'],
    rating: 'U/A 7+',
    releaseYear: 2026,
    seasonCount: 1,
    episodeCount: 9,
    isPremium: false,
    isTrending: false,
    maturityNote: 'Suitable for learners',
    primaryActionLabel: 'Play Latest',
  },
  {
    id: 'exam-mode',
    title: 'Exam Mode',
    eyebrow: 'Focused Prep',
    description:
      'High-intensity revision plans, mock tests, and guided breakdowns for learners preparing for competitive exams.',
    kind: 'series',
    posterUrl:
      'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=600&auto=format&fit=crop',
    backdropUrl:
      'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=1400&auto=format&fit=crop',
    videoUrl:
      'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8',
    trailerUrl:
      'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    streamType: 'hls',
    genres: ['Exams', 'Revision', 'Study Skills'],
    languages: ['English', 'Hindi'],
    rating: 'U',
    releaseYear: 2026,
    seasonCount: 1,
    episodeCount: 20,
    isPremium: true,
    isTrending: false,
    maturityNote: 'Academic preparation',
    primaryActionLabel: 'Start Plan',
  },
];

export const MEDIA_BY_ID = mediaItems.reduce<Record<string, MediaItem>>((acc, item) => {
  acc[item.id] = item;
  return acc;
}, {});

export const HOME_FEED: HomeFeedResponse = {
  hero: MEDIA_BY_ID['future-of-ai'],
  rails: [
    {
      id: 'continue-learning',
      title: 'Continue Learning',
      subtitle: 'Pick up from your last session',
      items: [
        MEDIA_BY_ID['future-of-ai'],
        MEDIA_BY_ID['react-native-shiproom'],
        MEDIA_BY_ID['exam-mode'],
      ],
    },
    {
      id: 'trending-now',
      title: 'Trending on EdStream',
      subtitle: 'Popular across classrooms this week',
      items: [
        MEDIA_BY_ID['math-premier-league'],
        MEDIA_BY_ID['startup-casefiles'],
        MEDIA_BY_ID['design-systems-lab'],
        MEDIA_BY_ID['future-of-ai'],
      ],
    },
    {
      id: 'frontend-masters',
      title: 'Frontend and Product',
      items: [
        MEDIA_BY_ID['design-systems-lab'],
        MEDIA_BY_ID['react-native-shiproom'],
        MEDIA_BY_ID['code-with-creators'],
      ],
    },
    {
      id: 'documentary-picks',
      title: 'Documentaries That Teach',
      items: [
        MEDIA_BY_ID['history-in-motion'],
        MEDIA_BY_ID['future-of-ai'],
        MEDIA_BY_ID['startup-casefiles'],
      ],
    },
  ],
};

export const PROFILE: ProfileResponse = {
  displayName: 'Nikhil',
  planName: 'EdStream Premium',
  avatarInitials: 'NK',
  settings: [
    {
      id: 'autoplay',
      title: 'Autoplay previews',
      description: 'Show muted previews on content rails',
      value: 'On',
      enabled: true,
    },
    {
      id: 'quality',
      title: 'Streaming quality',
      description: 'Optimized for Wi-Fi and mobile data',
      value: 'High',
    },
    {
      id: 'downloads',
      title: 'Download quality',
      description: 'Ready for offline revision sessions',
      value: 'Standard',
    },
    {
      id: 'language',
      title: 'Preferred languages',
      description: 'Used to personalize your rails',
      value: 'English, Hindi',
    },
  ],
};
