import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';

import HomeScreen from '@/app/(tabs)/index';
import { createMediaItem } from '@tests/mediaFixture';

const mockLoadMore = jest.fn();
const mockRefresh = jest.fn();
const mockRetry = jest.fn();

const mockHero = createMediaItem({ id: 'hero', title: 'Hero Course' });
const mockCarouselItems = [
  createMediaItem({ id: 'carousel-one', title: 'Carousel One' }),
  createMediaItem({ id: 'carousel-two', title: 'Carousel Two' }),
];
const mockRailItem = createMediaItem({ id: 'rail-item', title: 'Rail Item' });

jest.mock('@/features/home/hooks/useHomeFeed', () => ({
  useHomeFeed: () => ({
    data: {
      activeMode: 'learn',
      carousel: mockCarouselItems,
      hero: mockHero,
      modes: [
        {
          activeColors: ['#1F80E0', '#0EA5E9', '#00E0FF'],
          eyebrow: 'Watch lessons',
          icon: 'school',
          id: 'learn',
          idleColors: ['#142345', '#0D1830', '#07101F'],
          label: 'Learn',
        },
        {
          activeColors: ['#F5C542', '#F97316', '#DC2626'],
          eyebrow: 'Try drills',
          icon: 'flash',
          id: 'practice',
          idleColors: ['#241A0A', '#151525', '#07101F'],
          label: 'Practice',
        },
      ],
      rails: [
        {
          id: 'rail-one',
          items: [mockRailItem],
          title: 'Continue Learning',
        },
      ],
    },
    error: null,
    hasMore: true,
    isLoading: false,
    isLoadingMore: false,
    isRefreshing: false,
    loadMore: mockLoadMore,
    refresh: mockRefresh,
    retry: mockRetry,
  }),
}));

jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
  },
}));

jest.mock('expo-linear-gradient', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View } = require('react-native');

  return {
    LinearGradient: View,
  };
});

jest.mock('react-native-reanimated-carousel', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View } = require('react-native');

  return {
    __esModule: true,
    default: ({ data, renderItem }: { data: unknown[]; renderItem: (info: { item: unknown; index: number }) => React.ReactNode }) => (
      <View testID="home-carousel">
        {data.map((item, index) => (
          <View key={String(index)}>{renderItem({ item, index })}</View>
        ))}
      </View>
    ),
  };
});

jest.mock('@/components/media/OptimizedImage', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View } = require('react-native');

  return {
    OptimizedImage: View,
  };
});

jest.mock('@/components/media/MediaRail', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Text, View } = require('react-native');

  return {
    MediaRail: ({ rail }: { rail: { title: string } }) => (
      <View>
        <Text>{rail.title}</Text>
      </View>
    ),
  };
});

jest.mock('@/theme/AppTheme', () => ({
  useAppTheme: () => ({
    colors: {
      background: '#020617',
      border: '#D0D7E2',
      surface: '#FFFFFF',
      text: '#0F172A',
      textMuted: '#64748B',
    },
    isDark: false,
  }),
}));

jest.mock('@/utils/responsive', () => ({
  useResponsiveMetrics: () => ({
    carouselCardHeight: 220,
    carouselCardWidth: 300,
    contentWidth: 360,
    headerTopPadding: 16,
    heroImageHeight: 240,
    horizontalPadding: 20,
    isCompact: false,
    sectionGap: 24,
  }),
}));

jest.mock('react-native-safe-area-context', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View } = require('react-native');

  return {
    SafeAreaView: View,
    useSafeAreaInsets: () => ({ bottom: 0, left: 0, right: 0, top: 0 }),
  };
});

describe('HomeScreen carousel', () => {
  beforeEach(() => {
    jest.mocked(router.push).mockClear();
    mockLoadMore.mockClear();
  });

  it('renders carousel items from Home feed data', async () => {
    const screen = await render(<HomeScreen />);

    expect(screen.getByTestId('home-carousel')).toBeTruthy();
    expect(screen.getByText('Carousel One')).toBeTruthy();
    expect(screen.getByText('Carousel Two')).toBeTruthy();
  });

  it('opens detail when a carousel item is pressed', async () => {
    const screen = await render(<HomeScreen />);

    fireEvent.press(screen.getByLabelText('Open Carousel One'));

    await waitFor(() => {
      expect(router.push).toHaveBeenCalledWith({
        pathname: '/detail/[mediaId]',
        params: { mediaId: 'carousel-one' },
      });
    });
  });
});
