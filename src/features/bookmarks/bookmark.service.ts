import AsyncStorage from '@react-native-async-storage/async-storage';

import { scheduleLocalNotification } from '@/features/notifications/notification.service';

const BOOKMARKED_COURSE_IDS_KEY = 'edstream:bookmarkedCourseIds';
const BOOKMARK_MILESTONES_NOTIFIED_KEY = 'edstream:bookmarkMilestonesNotified';
const BOOKMARK_MILESTONE_INTERVAL = 5;

let cachedBookmarkedCourseIds: string[] = [];
let didHydrateBookmarks = false;
const bookmarkListeners = new Set<() => void>();

function debugBookmark(message: string, data?: Record<string, unknown>) {
  if (__DEV__) {
    console.info(`[bookmarks] ${message}`, data ?? '');
  }
}

function uniqueCourseIds(courseIds: string[]) {
  return Array.from(new Set(courseIds.filter(Boolean)));
}

function notifyBookmarkListeners() {
  bookmarkListeners.forEach((listener) => listener());
}

function setCachedBookmarkedCourseIds(courseIds: string[]) {
  cachedBookmarkedCourseIds = uniqueCourseIds(courseIds);
  notifyBookmarkListeners();
}

async function hydrateBookmarkedCourseIds() {
  if (didHydrateBookmarks) {
    return cachedBookmarkedCourseIds;
  }

  didHydrateBookmarks = true;
  const courseIds = await getBookmarkedCourseIds();
  setCachedBookmarkedCourseIds(courseIds);

  return courseIds;
}

export function subscribeToBookmarks(listener: () => void) {
  bookmarkListeners.add(listener);
  void hydrateBookmarkedCourseIds();

  return () => {
    bookmarkListeners.delete(listener);
  };
}

export function getBookmarkSnapshot(courseId: string) {
  return cachedBookmarkedCourseIds.includes(courseId);
}

export async function getBookmarkedCourseIds(): Promise<string[]> {
  try {
    const rawValue = await AsyncStorage.getItem(BOOKMARKED_COURSE_IDS_KEY);

    return rawValue ? uniqueCourseIds(JSON.parse(rawValue) as string[]) : [];
  } catch {
    return [];
  }
}

export async function setBookmarkedCourseIds(courseIds: string[]) {
  const nextCourseIds = uniqueCourseIds(courseIds);

  await AsyncStorage.setItem(
    BOOKMARKED_COURSE_IDS_KEY,
    JSON.stringify(nextCourseIds),
  );
  setCachedBookmarkedCourseIds(nextCourseIds);

  return nextCourseIds;
}

async function getNotifiedMilestones(): Promise<number[]> {
  try {
    const rawValue = await AsyncStorage.getItem(BOOKMARK_MILESTONES_NOTIFIED_KEY);

    return rawValue ? (JSON.parse(rawValue) as number[]) : [];
  } catch {
    return [];
  }
}

async function addNotifiedMilestone(milestone: number) {
  const milestones = await getNotifiedMilestones();

  if (milestones.includes(milestone)) {
    return milestones;
  }

  const nextMilestones = [...milestones, milestone];
  await AsyncStorage.setItem(
    BOOKMARK_MILESTONES_NOTIFIED_KEY,
    JSON.stringify(nextMilestones),
  );

  return nextMilestones;
}

async function pruneNotifiedMilestones(currentBookmarkCount: number) {
  const milestones = await getNotifiedMilestones();
  const nextMilestones = milestones.filter(
    (milestone) => milestone <= currentBookmarkCount,
  );

  if (nextMilestones.length === milestones.length) {
    return milestones;
  }

  await AsyncStorage.setItem(
    BOOKMARK_MILESTONES_NOTIFIED_KEY,
    JSON.stringify(nextMilestones),
  );

  return nextMilestones;
}

function getReachedMilestone(previousCount: number, currentCount: number) {
  if (currentCount < BOOKMARK_MILESTONE_INTERVAL) {
    return null;
  }

  const previousMilestone = Math.floor(previousCount / BOOKMARK_MILESTONE_INTERVAL);
  const currentMilestone = Math.floor(currentCount / BOOKMARK_MILESTONE_INTERVAL);

  if (currentMilestone <= previousMilestone) {
    return null;
  }

  return currentMilestone * BOOKMARK_MILESTONE_INTERVAL;
}

async function notifyBookmarkMilestoneIfNeeded(
  previousCount: number,
  courseIds: string[],
) {
  const milestone = courseIds.length;
  const reachedMilestone = getReachedMilestone(previousCount, milestone);
  debugBookmark('count changed', {
    currentCount: milestone,
    previousCount,
    reachedMilestone,
  });

  if (!reachedMilestone) {
    debugBookmark('no milestone reached', {
      currentCount: milestone,
      previousCount,
    });
    return;
  }

  const milestones = await getNotifiedMilestones();
  debugBookmark('stored milestones', { milestones });

  if (milestones.includes(reachedMilestone) && previousCount >= reachedMilestone) {
    debugBookmark('milestone already handled', {
      previousCount,
      reachedMilestone,
    });
    return;
  }

  debugBookmark('requesting milestone notification', { reachedMilestone });
  const notificationId = await scheduleLocalNotification({
    body: `${reachedMilestone} courses are saved in your learning list.`,
    data: { url: '/search', milestone: reachedMilestone },
    title: `${reachedMilestone} courses saved`,
  });

  if (notificationId) {
    await addNotifiedMilestone(reachedMilestone);
    debugBookmark('milestone notification scheduled', {
      notificationId,
      reachedMilestone,
    });
  } else {
    debugBookmark('milestone notification not scheduled', { reachedMilestone });
  }
}

export async function toggleCourseBookmark(courseId: string) {
  const currentCourseIds = await getBookmarkedCourseIds();
  const previousCount = currentCourseIds.length;
  const isBookmarked = currentCourseIds.includes(courseId);
  const nextCourseIds = isBookmarked
    ? currentCourseIds.filter((id) => id !== courseId)
    : [...currentCourseIds, courseId];
  debugBookmark('toggle', {
    courseId,
    isRemoving: isBookmarked,
    nextCount: uniqueCourseIds(nextCourseIds).length,
    previousCount,
  });

  const bookmarkedCourseIds = await setBookmarkedCourseIds(nextCourseIds);

  if (!isBookmarked) {
    await notifyBookmarkMilestoneIfNeeded(previousCount, bookmarkedCourseIds);
  } else {
    await pruneNotifiedMilestones(bookmarkedCourseIds.length);
  }

  return {
    bookmarkedCourseIds,
    isBookmarked: !isBookmarked,
  };
}
