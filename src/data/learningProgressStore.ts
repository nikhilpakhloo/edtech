import type { MediaItem } from '@/types/media';

const LAST_PLAYED_KEY = 'edstream:lastPlayedLesson';
const COMPLETED_STUDY_PLAN_KEY = 'edstream:completedStudyPlan';

export type LastPlayedLesson = {
  mediaId: string;
  title: string;
  subtitle: string;
  progressPercent: number;
  timeRemainingMinutes: number;
  updatedAt: string;
};

let memoryLastPlayed: LastPlayedLesson | null = null;
let memoryCompletedStudyPlanIds: string[] = [];

function getLocalStorage() {
  if (typeof globalThis === 'undefined' || !('localStorage' in globalThis)) {
    return null;
  }

  return globalThis.localStorage;
}

function getTimeRemainingMinutes(item: MediaItem) {
  if (item.runtimeMinutes) {
    return Math.max(5, Math.round(item.runtimeMinutes * (1 - (item.progressPercent ?? 0.12))));
  }

  return item.episodeCount ? 22 : 15;
}

export const learningProgressStore = {
  completeStudyPlanItem(stepId: string) {
    const completedIds = this.getCompletedStudyPlanIds();

    if (completedIds.includes(stepId)) {
      return;
    }

    const nextCompletedIds = [...completedIds, stepId];
    memoryCompletedStudyPlanIds = nextCompletedIds;

    const storage = getLocalStorage();

    if (!storage) {
      return;
    }

    try {
      storage.setItem(COMPLETED_STUDY_PLAN_KEY, JSON.stringify(nextCompletedIds));
    } catch {
      // Keep the in-memory value if browser storage is unavailable.
    }
  },

  getCompletedStudyPlanIds(): string[] {
    const storage = getLocalStorage();

    if (!storage) {
      return memoryCompletedStudyPlanIds;
    }

    try {
      const rawValue = storage.getItem(COMPLETED_STUDY_PLAN_KEY);

      return rawValue ? (JSON.parse(rawValue) as string[]) : memoryCompletedStudyPlanIds;
    } catch {
      return memoryCompletedStudyPlanIds;
    }
  },

  getLastPlayed(): LastPlayedLesson | null {
    const storage = getLocalStorage();

    if (!storage) {
      return memoryLastPlayed;
    }

    try {
      const rawValue = storage.getItem(LAST_PLAYED_KEY);

      return rawValue ? (JSON.parse(rawValue) as LastPlayedLesson) : memoryLastPlayed;
    } catch {
      return memoryLastPlayed;
    }
  },

  recordLastPlayed(item: MediaItem) {
    const lastPlayed: LastPlayedLesson = {
      mediaId: item.id,
      progressPercent: item.progressPercent ?? 0.12,
      subtitle: item.eyebrow,
      timeRemainingMinutes: getTimeRemainingMinutes(item),
      title: item.title,
      updatedAt: new Date().toISOString(),
    };

    memoryLastPlayed = lastPlayed;

    const storage = getLocalStorage();

    if (!storage) {
      return;
    }

    try {
      storage.setItem(LAST_PLAYED_KEY, JSON.stringify(lastPlayed));
    } catch {
      // Keep the in-memory value if browser storage is unavailable.
    }
  },
};
