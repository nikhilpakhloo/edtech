import { fireEvent, render } from '@testing-library/react-native';

import { MediaRail } from '@/components/media/MediaRail';
import { createMediaItem } from '@tests/mediaFixture';
import type { MediaItem } from '@/types/media';

jest.mock('@/components/media/MediaCard', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Pressable, Text } = require('react-native');

  return {
    MediaCard: ({ item, onPress }: { item: MediaItem; onPress: (item: MediaItem) => void }) => (
      <Pressable accessibilityRole="button" onPress={() => onPress(item)}>
        <Text>{item.title}</Text>
      </Pressable>
    ),
  };
});

jest.mock('@/theme/AppTheme', () => ({
  useAppTheme: () => ({
    colors: {
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
    horizontalPadding: 20,
    isCompact: false,
  }),
}));

jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
  },
}));

describe('MediaRail', () => {
  it('renders rail title subtitle and items', async () => {
    const screen = await render(
      <MediaRail
        rail={{
          id: 'recommended',
          items: [
            createMediaItem({ id: 'algebra', title: 'Algebra Sprint' }),
            createMediaItem({ id: 'geometry', title: 'Geometry Lab' }),
          ],
          subtitle: 'Fresh picks',
          title: 'Recommended',
        }}
        onSelectMedia={jest.fn()}
      />,
    );

    expect(screen.getByText('Recommended')).toBeTruthy();
    expect(screen.getByText('Fresh picks')).toBeTruthy();
    expect(screen.getByText('Algebra Sprint')).toBeTruthy();
    expect(screen.getByText('Geometry Lab')).toBeTruthy();
  });

  it('calls onSelectMedia when an item is pressed', async () => {
    const item = createMediaItem({ id: 'science', title: 'Science Drill' });
    const onSelectMedia = jest.fn();
    const screen = await render(
      <MediaRail
        rail={{ id: 'practice', items: [item], title: 'Practice' }}
        onSelectMedia={onSelectMedia}
      />,
    );

    fireEvent.press(screen.getByText('Science Drill'));

    expect(onSelectMedia).toHaveBeenCalledWith(item);
  });

  it('renders empty state when the rail has no items', async () => {
    const screen = await render(
      <MediaRail rail={{ id: 'empty', items: [], title: 'Empty Rail' }} onSelectMedia={jest.fn()} />,
    );

    expect(screen.getByText('Empty Rail')).toBeTruthy();
    expect(screen.getByText('Nothing here yet')).toBeTruthy();
  });
});
