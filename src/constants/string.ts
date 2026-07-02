export const APP_STRINGS = {
  brand: {
    name: 'EdStream',
    tagline: 'Learn like cinema',
    artist: 'EdStream',
  },
  common: {
    live: 'Live',
    retry: 'Retry',
    tryAgain: 'Try Again',
    viewAll: 'View all',
  },
  tabs: {
    search: 'Search',
    home: 'Home',
    profile: 'My Space',
  },
  accessibility: {
    openTitle: (title: string) => `Open ${title}`,
    viewAllRail: (title: string) => `View all ${title}`,
    clearSearch: 'Clear search',
    editProfile: 'Edit profile',
    muteVideo: 'Mute video',
    unmuteVideo: 'Unmute video',
  },
  errors: {
    noContentReturned: 'No content was returned.',
    unableToLoadEdStream: 'Unable to load EdStream.',
    unableToLoadSearch: 'Unable to load search.',
    titleNoLongerAvailable: 'This title is no longer available.',
    missingMediaId: 'Missing media id.',
    unableToLoadTitle: 'Unable to load title.',
    titleUnavailable: 'Title unavailable',
    titleNotFound: 'We could not find this EdStream title.',
    feedUnavailable: 'Feed unavailable',
    searchUnavailable: 'Search unavailable',
  },
  empty: {
    railTitle: 'Nothing here yet',
    railMessage: 'This rail is ready, but the mock service did not return titles for it.',
    noMatchesTitle: 'No matches',
    noMatchesMessage: 'Try searching another topic, language, or learning track.',
  },
  home: {
    modes: {
      learn: {
        label: 'Learn',
        eyebrow: 'Courses & stories',
        featured: 'Featured lesson',
        swipeSuffix: 'learning journeys',
      },
      practice: {
        label: 'Practice',
        eyebrow: 'Live drills & exams',
        featured: 'Featured challenge',
        swipeSuffix: 'practice picks',
      },
    },
    rails: {
      continueLearningLast: {
        title: 'Continue Learning',
        subtitle: 'Pick up from your last session',
      },
      trendingOnEdStream: {
        title: 'Trending on EdStream',
        subtitle: 'Popular across classrooms this week',
      },
      frontendAndProduct: {
        title: 'Frontend and Product',
      },
      documentaryPicksDefault: {
        title: 'Documentaries That Teach',
      },
      examAndSkills: {
        title: 'Exam Prep and Life Skills',
        subtitle: 'Focused tracks for tests, confidence, and career readiness',
      },
      livePracticeArenas: {
        title: 'Live Practice Arenas',
        subtitle: 'Challenges, revision, and competition-ready sessions',
      },
      skillSprints: {
        title: 'Exam and Skill Sprints',
        subtitle: 'Focused runs for tests, speed, and applied confidence',
      },
      practiceRecommended: {
        title: 'Recommended Practice',
        subtitle: 'Hands-on sessions picked for your next milestone',
      },
      continueLearning: {
        title: 'Continue Learning',
        subtitle: 'Resume courses and cinematic lessons',
      },
      deepLearningTracks: {
        title: 'Deep Learning Tracks',
        subtitle: 'Structured series for product, code, and design',
      },
      documentaryPicks: {
        title: 'Documentaries That Teach',
        subtitle: 'Story-led lessons for broader context',
      },
    },
    forYou: 'For You',
    forYouRank: (rank: number) => `#${rank} for you`,
    swipeThroughCurated: (suffix: string) => `Swipe through curated ${suffix}`,
  },
  search: {
    title: 'Search',
    subtitle: 'Find lessons, live challenges, documentaries, and exam tracks.',
    placeholder: 'Search by title, skill, language...',
    resultLabel: (query: string) => `Showing results for "${query}"`,
    resultTitle: 'Search Results',
    resultSubtitle: 'Matching titles from the full EdStream catalog',
    rails: {
      trending: {
        title: 'Trending Searches',
        subtitle: 'Popular across EdStream right now',
      },
      science: {
        title: 'Science Labs',
        subtitle: 'Physics, chemistry, biology, and concept builders',
      },
      exam: {
        title: 'Exam Prep',
        subtitle: 'NEET, JEE, revision, and timed practice',
      },
      career: {
        title: 'Career and Communication',
        subtitle: 'Data, finance, public speaking, and job-ready skills',
      },
      all: {
        title: 'All Learning',
        subtitle: 'Everything in the mock catalog',
      },
    },
  },
  profile: {
    eyebrow: 'Your learning hub',
    title: 'My Space',
    subtitle: 'Track progress, manage downloads, and tune your EdStream experience.',
    stats: {
      streak: { label: 'Streak', suffix: 'days' },
      saved: { label: 'Saved', suffix: 'offline' },
      progress: { label: 'Progress', suffix: '%' },
    },
    quickActions: {
      downloads: { label: 'Downloads', caption: 'Ready offline' },
      watchlist: { label: 'Watchlist', caption: 'Saved lessons' },
      certificates: { label: 'Certificates', caption: 'Achievements' },
    },
    preferencesTitle: 'Preferences',
    preferencesSubtitle: 'Personalize playback, language, and downloads.',
    settings: {
      autoplay: {
        title: 'Autoplay previews',
        description: 'Show muted previews on content rails',
        value: 'On',
      },
      quality: {
        title: 'Streaming quality',
        description: 'Optimized for Wi-Fi and mobile data',
        value: 'High',
      },
      downloads: {
        title: 'Download quality',
        description: 'Ready for offline revision sessions',
        value: 'Standard',
      },
      language: {
        title: 'Preferred languages',
        description: 'Used to personalize your rails',
        value: 'English, Hindi',
      },
    },
    streakTitle: 'Keep your streak alive',
    streakMessage: 'Finish one lesson today to unlock your next weekly milestone.',
  },
  detail: {
    metadataTitle: 'Metadata',
    relatedTitle: 'More Like This',
    episodeLabel: (count: number) => `${count} episodes`,
  },
  media: {
    premiumBadge: 'VIP',
    trendingBadge: 'Top',
    spotlight: 'Spotlight',
    premium: 'Premium',
    watchlist: 'Watchlist',
  },
  format: {
    season: (count: number) => `${count} season${count > 1 ? 's' : ''}`,
    minutes: (count: number) => `${count}m`,
    hoursMinutes: (hours: number, minutes: number) => `${hours}h ${minutes}m`,
  },
} as const;
