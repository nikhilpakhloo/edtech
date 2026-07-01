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
