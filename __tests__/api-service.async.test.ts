import { apiService } from '@/data/apiService';

describe('apiService', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns paginated search data with hasMore metadata', async () => {
    const request = apiService.getMediaPage({ page: 1, pageSize: 2, query: 'a' });

    jest.advanceTimersByTime(320);

    const response = await request;

    expect(response.items).toHaveLength(2);
    expect(response.page).toBe(1);
    expect(response.pageSize).toBe(2);
    expect(response.hasMore).toBe(true);
    expect(response.items[0].title.length).toBeGreaterThan(0);
  });

  it('resolves the home feed asynchronously', async () => {
    const request = apiService.getHomeFeed('learn');

    jest.advanceTimersByTime(650);

    const response = await request;

    expect(response.activeMode).toBe('learn');
    expect(response.hero.title.length).toBeGreaterThan(0);
    expect(response.rails.length).toBeGreaterThan(0);
  });

  it('keeps returning home rail pages for endless mock scrolling', async () => {
    const request = apiService.getHomeRailPage({ mode: 'learn', page: 12, pageSize: 6 });

    jest.advanceTimersByTime(420);

    const response = await request;

    expect(response.hasMore).toBe(true);
    expect(response.rails).toHaveLength(1);
    expect(response.rails[0].id).toBe('learn-more-12');
    expect(response.rails[0].items.length).toBeGreaterThan(0);
  });
});
