import { fireEvent, render } from '@testing-library/react-native';

import { MediaCard } from '@/components/media/MediaCard';
import type { MediaItem } from '@/types/media';

jest.mock('@/components/media/OptimizedImage', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View } = require('react-native');

  return {
    OptimizedImage: View,
  };
});

jest.mock('@/theme/AppTheme', () => ({
  useAppTheme: () => ({
    colors: {
      border: '#D0D7E2',
      elevated: '#FFFFFF',
      text: '#0F172A',
      textMuted: '#64748B',
    },
    isDark: false,
  }),
}));

const mediaItem: MediaItem = {
  backdropUrl: 'https://example.com/backdrop.jpg',
  description: 'A fast practice session for algebra.',
  eyebrow: 'Practice',
  genres: ['Math', 'Practice'],
  id: 'math-practice',
  isPremium: false,
  isTrending: true,
  kind: 'series',
  languages: ['English'],
  maturityNote: 'All learners',
  posterUrl: 'https://example.com/poster.jpg',
  primaryActionLabel: 'Start',
  rating: 'U',
  releaseYear: 2026,
  runtimeMinutes: 42,
  streamType: 'mp4',
  title: 'Math Practice',
  trailerUrl: 'https://example.com/trailer.mp4',
  videoUrl: 'https://example.com/video.mp4',
};

describe('MediaCard', () => {
  it('renders title and metadata', async () => {
    const screen = await render(<MediaCard item={mediaItem} onPress={jest.fn()} />);

    expect(screen.getByText('Math Practice')).toBeTruthy();
    expect(screen.getByText('English - 42m')).toBeTruthy();
  });

  it('calls onPress with the selected item', async () => {
    const onPress = jest.fn();
    const screen = await render(<MediaCard item={mediaItem} onPress={onPress} />);

    fireEvent.press(screen.getByRole('button'));

    expect(onPress).toHaveBeenCalledWith(mediaItem);
  });

  it('matches the rendered snapshot', async () => {
    const screen = await render(<MediaCard item={mediaItem} onPress={jest.fn()} />);

    expect(screen.toJSON()).toMatchInlineSnapshot(`
<View
  accessibilityLabel="Open Math Practice"
  accessibilityRole="button"
  accessibilityState={
    {
      "busy": undefined,
      "checked": undefined,
      "disabled": undefined,
      "expanded": undefined,
      "selected": undefined,
    }
  }
  accessibilityValue={
    {
      "max": undefined,
      "min": undefined,
      "now": undefined,
      "text": undefined,
    }
  }
  accessible={true}
  className="mr-3 w-32"
  collapsable={false}
  focusable={true}
  onBlur={[Function]}
  onClick={[Function]}
  onFocus={[Function]}
  onResponderGrant={[Function]}
  onResponderMove={[Function]}
  onResponderRelease={[Function]}
  onResponderTerminate={[Function]}
  onResponderTerminationRequest={[Function]}
  onStartShouldSetResponder={[Function]}
  style={
    [
      false,
    ]
  }
>
  <View
    className="overflow-hidden rounded-md border"
    style={
      {
        "backgroundColor": "#FFFFFF",
        "borderColor": "#D0D7E2",
      }
    }
  >
    <View
      contentFit="cover"
      priority="low"
      recyclingKey="math-practice"
      sourceUri="https://example.com/poster.jpg"
      style={
        {
          "height": 188,
          "width": 128,
        }
      }
      targetWidth={128}
      transition={180}
    />
    <View
      className="absolute right-2 top-2 rounded-full bg-brand-blue px-2 py-1"
    >
      <Text
        className="text-[10px] font-black uppercase text-white"
      >
        Top
      </Text>
    </View>
    <View
      className="absolute bottom-0 left-0 right-0 h-16 bg-black/45"
    />
    <View
      className="absolute bottom-3 left-2 h-7 w-7 items-center justify-center rounded-full bg-white/90"
    >
      <Text
        allowFontScaling={false}
        selectable={false}
        style={
          [
            {
              "color": "#030712",
              "fontSize": 13,
            },
            undefined,
            {
              "fontFamily": "ionicons",
              "fontStyle": "normal",
              "fontWeight": "normal",
            },
            {},
          ]
        }
      >
        
      </Text>
    </View>
  </View>
  <Text
    className="mt-2 text-sm font-bold"
    numberOfLines={1}
    style={
      {
        "color": "#0F172A",
      }
    }
  >
    Math Practice
  </Text>
  <Text
    className="mt-1 text-xs"
    numberOfLines={1}
    style={
      {
        "color": "#64748B",
      }
    }
  >
    English - 42m
  </Text>
</View>
`);
  });
});
