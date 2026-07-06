import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react';

import {
  getBookmarkSnapshot,
  getBookmarkedCourseIds,
  subscribeToBookmarks,
  toggleCourseBookmark,
} from './bookmark.service';

export function useBookmarkStatus(courseId: string) {
  const isBookmarked = useSyncExternalStore(
    subscribeToBookmarks,
    () => getBookmarkSnapshot(courseId),
    () => false,
  );
  const toggleBookmark = useCallback(
    () => toggleCourseBookmark(courseId),
    [courseId],
  );

  return {
    isBookmarked,
    toggleBookmark,
  };
}

export function useBookmarks() {
  const [bookmarkedCourseIds, setBookmarkedCourseIds] = useState<string[]>([]);
  const bookmarkedCourseIdSet = useMemo(
    () => new Set(bookmarkedCourseIds),
    [bookmarkedCourseIds],
  );

  useEffect(() => {
    let isMounted = true;

    getBookmarkedCourseIds().then((courseIds) => {
      if (isMounted) {
        setBookmarkedCourseIds(courseIds);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const toggleBookmark = useCallback(async (courseId: string) => {
    const result = await toggleCourseBookmark(courseId);
    setBookmarkedCourseIds(result.bookmarkedCourseIds);

    return result;
  }, []);

  return {
    bookmarkedCourseIds,
    bookmarkedCourseIdSet,
    toggleBookmark,
  };
}
