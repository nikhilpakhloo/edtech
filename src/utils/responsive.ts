import { Platform, useWindowDimensions } from 'react-native';

const COMPACT_WIDTH = 380;
const LARGE_PHONE_WIDTH = 430;
const CONTENT_MAX_WIDTH = 720;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function useResponsiveMetrics() {
  const { width } = useWindowDimensions();
  const isCompact = width < COMPACT_WIDTH;
  const isLargePhone = width >= LARGE_PHONE_WIDTH;
  const horizontalPadding = isCompact ? 16 : 20;
  const contentWidth = Math.min(width, CONTENT_MAX_WIDTH);
  const carouselCardWidth = clamp(width * (isCompact ? 0.82 : 0.76), 264, isLargePhone ? 340 : 330);
  const carouselCardHeight = isCompact ? 318 : 360;

  return {
    contentMaxWidth: CONTENT_MAX_WIDTH,
    contentWidth,
    headerTopPadding: Platform.OS === 'ios' ? 52 : 46,
    heroImageHeight: isCompact ? 220 : 260,
    horizontalPadding,
    isCompact,
    isLargePhone,
    carouselCardHeight,
    carouselCardWidth,
    quickActionMinHeight: isCompact ? 112 : 122,
    sectionGap: isCompact ? 20 : 24,
  };
}
