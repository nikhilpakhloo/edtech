import { APP_STRINGS } from "@/constants/string";
import { apiService } from "@/data/apiService";

describe("apiService", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("returns a paginated search result for matching media", async () => {
    const responsePromise = apiService.getMediaPage({
      page: 1,
      pageSize: 2,
      query: "physics",
    });

    jest.advanceTimersByTime(320);

    const response = await responsePromise;

    expect(response.page).toBe(1);
    expect(response.pageSize).toBe(2);
    expect(response.total).toBeGreaterThan(0);
    expect(response.items.length).toBeLessThanOrEqual(2);
    expect(
      response.items.some((item) =>
        [...item.genres, item.title, item.description].join(" ").toLowerCase().includes("physics"),
      ),
    ).toBe(true);
  });

  it("rejects when media detail is requested for an unknown id", async () => {
    const responsePromise = apiService.getMediaDetailView("unknown-title");

    jest.advanceTimersByTime(650);

    await expect(responsePromise).rejects.toThrow(APP_STRINGS.errors.titleNoLongerAvailable);
  });
});
