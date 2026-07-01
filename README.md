# EdStream

![Expo](https://img.shields.io/badge/Expo-SDK%2057-000020?style=for-the-badge&logo=expo&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![NativeWind](https://img.shields.io/badge/NativeWind%20%2F%20Uniwind-Tailwind%20RN-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white)
![React Native Paper](https://img.shields.io/badge/React%20Native%20Paper-MD3-6750A4?style=for-the-badge&logo=materialdesign&logoColor=white)

EdStream is a high-fidelity React Native streaming interface inspired by Disney+ Hotstar for the House of Edtech Advanced UI Clone assessment. The app is designed around immersive hero banners, fast horizontal media rails, rich detail pages, and a clean production architecture where every UI surface is data-driven, typed, themed, and optimized for mobile scrolling performance.

This project follows Expo SDK 57 documentation: Node.js `22.13.x` or newer, React Native `0.86`, React `19.2.3`, and Expo SDK packages installed through `npx expo install`.

## Technical Architecture Overview

### Scalable Folder Structure

```txt
EdStream/
+-- assets/
|   +-- images/
|   +-- fonts/
+-- src/
|   +-- app/
|   |   +-- AppProviders.tsx
|   |   +-- _layout.tsx
|   |   +-- (tabs)/
|   |   |   +-- _layout.tsx
|   |   |   +-- index.tsx
|   |   |   +-- profile.tsx
|   |   +-- detail/
|   |       +-- [mediaId].tsx
|   +-- components/
|   |   +-- feedback/
|   |   |   +-- EmptyState.tsx
|   |   |   +-- ErrorState.tsx
|   |   |   +-- SkeletonRail.tsx
|   |   +-- media/
|   |   |   +-- HeroBanner.tsx
|   |   |   +-- MediaCard.tsx
|   |   |   +-- MediaRail.tsx
|   |   |   +-- MetadataPill.tsx
|   |   +-- layout/
|   |       +-- Screen.tsx
|   |       +-- StickyHeader.tsx
|   +-- constants/
|   |   +-- routes.ts
|   |   +-- spacing.ts
|   +-- data/
|   |   +-- apiService.ts
|   |   +-- mockMedia.ts
|   +-- features/
|   |   +-- detail/
|   |   |   +-- DetailScreen.tsx
|   |   |   +-- components/
|   |   |   +-- hooks/useMediaDetail.ts
|   |   +-- home/
|   |   |   +-- HomeScreen.tsx
|   |   |   +-- components/
|   |   |   +-- hooks/useHomeFeed.ts
|   |   +-- profile/
|   |       +-- ProfileScreen.tsx
|   |       +-- components/
|   +-- theme/
|   |   +-- paperTheme.ts
|   |   +-- tokens.ts
|   +-- types/
|   |   +-- media.ts
|   +-- utils/
|       +-- formatRuntime.ts
|       +-- listPerf.ts
+-- app.json
+-- package.json
+-- tailwind.config.js
+-- tsconfig.json
```

### React Native Paper + NativeWind Strategy

React Native Paper provides stable MD3 primitives for surfaces, buttons, chips, dialogs, portals, switches, progress indicators, and accessible touch states. NativeWind/Uniwind handles layout density, spacing, color utilities, responsive composition, and rapid visual iteration. The rule is simple: Paper owns semantic Material components and interaction states; NativeWind owns layout, spacing, and local composition.

This repository uses Expo Router, so navigation is declared through files in `src/app` instead of a manual `NavigationContainer`. Expo Router is built on React Navigation and still satisfies the assessment requirement for Native Stack and Bottom Tab navigation:

- `src/app/_layout.tsx` owns the root stack and app providers.
- `src/app/(tabs)/_layout.tsx` owns the bottom tab navigator.
- `src/app/detail/[mediaId].tsx` owns dynamic detail routes.

React Native Paper setup follows the official Callstack guide: install `react-native-paper`, keep `react-native-safe-area-context`, wrap the app with `PaperProvider`, and rely on Expo's included vector icons instead of installing an extra icon package. Source: https://oss.callstack.com/react-native-paper/docs/guides/getting-started

```tsx
// src/app/AppProviders.tsx
import { ReactNode } from 'react';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { paperTheme } from '@/theme/paperTheme';

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={paperTheme}>
        {children}
      </PaperProvider>
    </SafeAreaProvider>
  );
}
```

```tsx
// src/app/_layout.tsx
import '../../global.css';

import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AppProviders } from '@/app/AppProviders';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppProviders>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="detail/[mediaId]" />
        </Stack>
      </AppProviders>
    </GestureHandlerRootView>
  );
}
```

```tsx
// src/app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
```

```tsx
// src/theme/paperTheme.ts
import { MD3DarkTheme, configureFonts } from 'react-native-paper';

export const paperTheme = {
  ...MD3DarkTheme,
  roundness: 8,
  fonts: configureFonts({ config: MD3DarkTheme.fonts }),
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#4F8CFF',
    secondary: '#12B981',
    background: '#05070D',
    surface: '#10141F',
    surfaceVariant: '#1A2030',
    onSurface: '#F8FAFC',
    outline: '#354052',
    error: '#FF5A66',
  },
};
```

### Performance Strategy

EdStream is built for dense visual feeds. Home content rails must feel smooth on low and mid-range Android devices, not only on simulators.

- Use `FlatList` for vertical feeds and horizontal rails, with explicit `keyExtractor`, `initialNumToRender`, `windowSize`, `maxToRenderPerBatch`, and `removeClippedSubviews`.
- Use `expo-image` for posters, banners, and avatars with `cachePolicy="disk"` and `contentFit="cover"` to reduce repeated network and decode work.
- Wrap repeated media cards with `React.memo`.
- Use `useCallback` for `renderItem`, navigation handlers, refresh handlers, and retry handlers.
- Use `useMemo` for derived rail groupings, metadata strings, and expensive layout data.
- Keep home rows independent so a loading, error, or refresh state in one rail does not re-render the full screen.
- Avoid inline object and array creation in hot render paths.

```tsx
// src/utils/listPerf.ts
export const HOME_RAIL_LIST_PROPS = {
  horizontal: true,
  initialNumToRender: 5,
  maxToRenderPerBatch: 6,
  windowSize: 5,
  removeClippedSubviews: true,
  showsHorizontalScrollIndicator: false,
} as const;

export const HOME_FEED_LIST_PROPS = {
  initialNumToRender: 4,
  maxToRenderPerBatch: 5,
  windowSize: 7,
  removeClippedSubviews: true,
  showsVerticalScrollIndicator: false,
} as const;
```

```tsx
// src/components/media/MediaCard.tsx
import { memo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import type { MediaItem } from '@/types/media';

type MediaCardProps = {
  item: MediaItem;
  onPress: (item: MediaItem) => void;
};

function MediaCardBase({ item, onPress }: MediaCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open ${item.title}`}
      onPress={() => onPress(item)}
      className="mr-3 w-32"
    >
      <Image
        source={{ uri: item.posterUrl }}
        placeholder={item.blurhash}
        cachePolicy="disk"
        contentFit="cover"
        transition={180}
        className="h-48 w-32 rounded-md bg-slate-800"
      />
      <View className="mt-2">
        <Text numberOfLines={1} className="text-sm font-semibold text-white">
          {item.title}
        </Text>
        <Text numberOfLines={1} className="text-xs text-slate-400">
          {item.releaseYear} - {item.rating}
        </Text>
      </View>
    </Pressable>
  );
}

export const MediaCard = memo(MediaCardBase);
```

## Data Layer Design

No screen should hardcode feed labels, movie names, descriptions, metadata, or empty-state copy. Screens consume typed data from an asynchronous service layer that behaves like a real backend.

```ts
// src/types/media.ts
export type MediaKind = 'movie' | 'series' | 'live' | 'documentary';

export type MediaItem = {
  id: string;
  title: string;
  description: string;
  kind: MediaKind;
  posterUrl: string;
  backdropUrl: string;
  logoUrl?: string;
  blurhash?: string;
  genres: string[];
  languages: string[];
  rating: 'U' | 'U/A 7+' | 'U/A 13+' | 'U/A 16+' | 'A';
  releaseYear: number;
  runtimeMinutes?: number;
  seasonCount?: number;
  isPremium: boolean;
  isTrending: boolean;
  progressPercent?: number;
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
```

```ts
// src/data/apiService.ts
import { HOME_FEED, MEDIA_BY_ID } from '@/data/mockMedia';
import type { HomeFeedResponse, MediaItem } from '@/types/media';

const NETWORK_DELAY_MS = 650;

type ApiResult<T> = Promise<T>;

function delay<T>(payload: T, timeout = NETWORK_DELAY_MS): ApiResult<T> {
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
  async getHomeFeed(): ApiResult<HomeFeedResponse> {
    return delay(HOME_FEED);
  },

  async getMediaDetail(id: string): ApiResult<MediaItem> {
    const item = MEDIA_BY_ID[id];

    if (!item) {
      return rejectAfterDelay('This title is no longer available.');
    }

    return delay(item, 500);
  },

  async searchMedia(query: string): ApiResult<MediaItem[]> {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return delay([]);
    }

    const matches = Object.values(MEDIA_BY_ID).filter((item) => {
      return item.title.toLowerCase().includes(normalizedQuery);
    });

    return delay(matches, 420);
  },
};
```

```tsx
// src/features/home/hooks/useHomeFeed.ts
import { useCallback, useEffect, useState } from 'react';
import { apiService } from '@/data/apiService';
import type { HomeFeedResponse } from '@/types/media';

type AsyncState<T> = {
  data: T | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
};

export function useHomeFeed() {
  const [state, setState] = useState<AsyncState<HomeFeedResponse>>({
    data: null,
    isLoading: true,
    isRefreshing: false,
    error: null,
  });

  const loadFeed = useCallback(async (mode: 'initial' | 'refresh' = 'initial') => {
    setState((current) => ({
      ...current,
      isLoading: mode === 'initial',
      isRefreshing: mode === 'refresh',
      error: null,
    }));

    try {
      const data = await apiService.getHomeFeed();
      setState({ data, isLoading: false, isRefreshing: false, error: null });
    } catch (error) {
      setState((current) => ({
        ...current,
        isLoading: false,
        isRefreshing: false,
        error: error instanceof Error ? error.message : 'Unable to load feed.',
      }));
    }
  }, []);

  useEffect(() => {
    void loadFeed();
  }, [loadFeed]);

  return {
    ...state,
    refresh: () => loadFeed('refresh'),
    retry: () => loadFeed('initial'),
  };
}
```

## Phase-by-Phase Execution Roadmap

### Phase 1: Foundation, Styling, Theme Engine & Routing

**Objective:** Establish the Expo SDK 57 application foundation with strict TypeScript, app providers, safe areas, NativeWind/Uniwind styling, React Native Paper theming, and production-grade navigation.

**Checklist:**

- Confirm Node.js `22.13.x` or newer and run the app on Expo SDK 57.
- Use Expo Router for Native Stack and Bottom Tabs. Keep `expo-router`, `react-native-screens`, `react-native-safe-area-context`, and `react-native-gesture-handler` installed with Expo-compatible versions:

```bash
npx expo install react-native-screens react-native-safe-area-context react-native-gesture-handler
```

- Install UI and styling dependencies. React Native Paper's official guide requires `react-native-paper` and `react-native-safe-area-context`; in Expo projects, vector icons are already included through Expo, so no extra icon package is required:

```bash
npm install react-native-paper nativewind tailwindcss
npx tailwindcss init
```

- Keep `strict: true` in `tsconfig.json` and preserve the `@/*` path alias.
- Create `AppProviders.tsx` with `SafeAreaProvider` and `PaperProvider`.
- Create `src/app/_layout.tsx` with Expo Router `Stack` routes for `(tabs)` and `detail/[mediaId]`.
- Create `src/app/(tabs)/_layout.tsx` with Expo Router `Tabs` for `Home` and `Profile`.
- Configure status bar color, background surfaces, and safe-area padding for notched devices.
- Build reusable layout primitives: `Screen`, `SurfaceBand`, and `StickyHeader`.

**Architectural Rules:**

- Do not put navigation logic inside media cards; pass typed `onPress` callbacks from screens.
- Do not hardcode route names as strings across components; use a typed route contract.
- Do not create one-off colors in screen files; add every semantic color to `theme/tokens.ts` or `paperTheme.ts`.
- Keep Paper theme and NativeWind tokens visually aligned so surfaces, text, and overlays do not drift.

```tsx
// src/app/detail/[mediaId].tsx
import { useLocalSearchParams } from 'expo-router';

export default function DetailScreen() {
  const { mediaId } = useLocalSearchParams<{ mediaId: string }>();

  return null;
}
```

### Phase 2: Data Abstraction & Media UI Layouts

**Objective:** Build the complete data-driven Hotstar-style experience: Home feed, immersive hero, horizontal carousels, categorized content rows, and rich media detail views.

**Checklist:**

- Create `MediaItem`, `MediaRail`, and `HomeFeedResponse` TypeScript contracts.
- Create `mockMedia.ts` with hero content, trending titles, recommended courses, documentaries, continue-watching items, and language/category rails.
- Build `apiService.ts` with `setTimeout` delays and typed Promise responses.
- Build `useHomeFeed` and `useMediaDetail` hooks that expose loading, refreshing, error, empty, and success states.
- Implement `HeroBanner` with a full-width backdrop, title/logo area, CTA actions, and metadata chips.
- Implement `MediaRail` as a memoized horizontal `FlatList`.
- Implement `MediaCard` using `expo-image`, fixed poster dimensions, and premium/progress indicators.
- Implement `DetailScreen` with a hero visual, primary actions, metadata row, description, cast/related rails, and a unified scroll.
- Implement `ProfileScreen` with account summary, autoplay toggle, download quality, theme preference, and assessment-friendly app info.

**Architectural Rules:**

- Screen components orchestrate data and layout only; reusable display logic belongs in feature or shared components.
- UI labels must come from mock data or constants, not anonymous strings scattered through render functions.
- Media cards must receive a full `MediaItem` and never fetch their own data.
- Detail screen must be addressable by `mediaId` only, so the app behaves like a real deep-linkable product.

```tsx
// src/components/media/MediaRail.tsx
import { memo, useCallback } from 'react';
import { FlatList, Text, View } from 'react-native';
import { MediaCard } from '@/components/media/MediaCard';
import { HOME_RAIL_LIST_PROPS } from '@/utils/listPerf';
import type { MediaItem, MediaRail as MediaRailType } from '@/types/media';

type MediaRailProps = {
  rail: MediaRailType;
  onSelectMedia: (item: MediaItem) => void;
};

function MediaRailBase({ rail, onSelectMedia }: MediaRailProps) {
  const renderItem = useCallback(
    ({ item }: { item: MediaItem }) => (
      <MediaCard item={item} onPress={onSelectMedia} />
    ),
    [onSelectMedia],
  );

  return (
    <View className="mb-7">
      <Text className="mb-3 px-4 text-lg font-bold text-white">{rail.title}</Text>
      <FlatList
        {...HOME_RAIL_LIST_PROPS}
        data={rail.items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerClassName="px-4"
      />
    </View>
  );
}

export const MediaRail = memo(MediaRailBase);
```

### Phase 3: Performance Fine-Tuning & Dynamic State Handlers

**Objective:** Make the app resilient and smooth under realistic loading, empty, retry, and refresh flows while reducing expensive re-renders in dense media feeds.

**Checklist:**

- Replace standard `Image` usage with `expo-image` for posters, backdrops, avatars, and thumbnails.
- Set `cachePolicy="disk"` for stable artwork and `transition={180}` for premium-feeling poster reveals.
- Add skeleton loaders for hero and content rails while mock API calls resolve.
- Add `ErrorState` with a retry action for failed home and detail requests.
- Add `EmptyState` for empty rails, missing recommendations, and empty search results.
- Configure `FlatList` props per list size instead of using one global default.
- Use `React.memo` for `MediaCard`, `MediaRail`, metadata pills, and settings rows.
- Use `useCallback` for `renderItem`, navigation handlers, `onRefresh`, and retry callbacks.
- Use `RefreshControl` for native Pull-to-Refresh on the Home feed.
- Add lightweight instrumentation during development with render counters or React DevTools Profiler checks.

**Architectural Rules:**

- Never block the full screen when only one rail is loading; show rail-level skeletons.
- Keep skeleton dimensions identical to loaded content dimensions to prevent layout shift.
- Do not pass anonymous closures into hundreds of repeated cards when a stable callback can be used.
- Avoid deeply nested lists; use one vertical parent list and horizontal child rails with fixed item sizes.

```tsx
// Home feed list pattern
<FlatList
  {...HOME_FEED_LIST_PROPS}
  data={feed.rails}
  keyExtractor={(rail) => rail.id}
  ListHeaderComponent={<HeroBanner item={feed.hero} onPress={handleSelectMedia} />}
  renderItem={renderRail}
  refreshControl={
    <RefreshControl
      refreshing={isRefreshing}
      onRefresh={refresh}
      tintColor="#FFFFFF"
      progressBackgroundColor="#10141F"
    />
  }
/>
```

### Phase 4: Micro-interactions, Polish & Production Submission

**Objective:** Add the final layer of delight and submission readiness: animated sticky detail headers, native refresh, visual polish, setup documentation, and media deliverables.

**Checklist:**

- Implement a fading sticky header on `DetailScreen` using `react-native-reanimated`.
- Fade the collapsed title in after the hero scroll crosses the artwork focal point.
- Add pressed states, subtle scale feedback, and Paper ripple effects for high-value actions.
- Add haptic feedback for primary CTA actions if the interaction does not distract from assessment scope.
- Support light/dark mode through the Paper theme and NativeWind color tokens.
- Ensure all touch targets are at least 44px high and all poster/title text truncates cleanly.
- Test on iOS simulator, Android emulator, and Expo Go where supported.
- Capture screenshots of Home, Detail, Profile, loading, and error states.
- Record a short walkthrough with audible explanation covering architecture, performance, and UX polish.
- Prepare an Expo Go shareable link or generated APK build for final submission.

**Architectural Rules:**

- Keep Reanimated logic isolated to animation-heavy components such as `DetailAnimatedHeader`.
- Do not mix scroll animation state with API state.
- Prefer platform-native primitives for refresh, gestures, and safe areas.
- Before submission, remove debug logs, unused mock records, unused assets, and dead experimental components.

```tsx
// src/features/detail/components/DetailAnimatedHeader.tsx
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';

type DetailAnimatedHeaderProps = {
  title: string;
  scrollY: Animated.SharedValue<number>;
};

export function DetailAnimatedHeader({ title, scrollY }: DetailAnimatedHeaderProps) {
  const headerStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, [120, 220], [0, 1], Extrapolation.CLAMP);

    return {
      opacity,
      transform: [{ translateY: interpolate(opacity, [0, 1], [-8, 0]) }],
    };
  });

  return (
    <Animated.View className="absolute left-0 right-0 top-0 z-10 bg-slate-950/95 px-4 pb-3 pt-14" style={headerStyle}>
      <Animated.Text numberOfLines={1} className="text-base font-bold text-white">
        {title}
      </Animated.Text>
    </Animated.View>
  );
}
```

## Detailed Setup & Installation Guide

### 1. Clone and Enter the Project

```bash
git clone <repository-url> EdStream
cd EdStream
```

### 2. Use the Correct Runtime

Expo SDK 57 requires Node.js `22.13.x` or newer.

```bash
node --version
npm --version
```

If using `nvm`:

```bash
nvm install 22.13.0
nvm use 22.13.0
```

### 3. Install Existing Dependencies

```bash
npm install
```

### 4. Install Assessment Architecture Dependencies

Use `npx expo install` for Expo-managed native packages so versions remain compatible with SDK 57. React Native Paper's getting-started guide also notes that Expo projects do not need a separate vector-icons install because Expo already includes the required icon support.

```bash
npx expo install expo-image expo-font expo-splash-screen expo-status-bar react-native-gesture-handler react-native-reanimated react-native-safe-area-context react-native-screens
npm install react-native-paper nativewind tailwindcss
npx tailwindcss init
```

Optional production bundle optimization from the React Native Paper guide:

```js
// babel.config.js
module.exports = function (api) {
  api.cache(true);

  return {
    presets: ['babel-preset-expo'],
    env: {
      production: {
        plugins: ['react-native-paper/babel'],
      },
    },
  };
};
```

### 5. Configure NativeWind/Uniwind Entry Points

Create or update `tailwind.config.js`:

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#4F8CFF',
          green: '#12B981',
          ink: '#05070D',
          surface: '#10141F',
        },
      },
    },
  },
  plugins: [],
};
```

Keep `src/global.css` available for NativeWind web support:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 6. Verify TypeScript Strict Mode

`tsconfig.json` should keep strict mode enabled:

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "paths": {
      "@/*": ["./src/*"],
      "@/assets/*": ["./assets/*"]
    }
  }
}
```

### 7. Start the Development Server

```bash
npm run start
```

Then choose a target:

```bash
npm run android
npm run ios
npm run web
```

You can also scan the Expo QR code with Expo Go for supported native modules. For full native parity, especially if adding custom native behavior later, create a development build.

### 8. Quality Checks Before Submission

```bash
npx expo-doctor
npm run lint
npx tsc --noEmit
```

### 9. Build or Share

For an Expo Go shareable preview:

```bash
npx expo start --tunnel
```

For Android APK submission through EAS:

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --platform android --profile preview
```

### 10. Final Deliverables Checklist

- GitHub repository with clean commits and no generated clutter.
- README with setup, architecture, performance, and roadmap documentation.
- Screenshots or screen recording of Home, Detail, Profile, loading, empty, and error states.
- Walkthrough video with audible explanation of implementation and key decisions.
- Expo Go link or APK build link.
