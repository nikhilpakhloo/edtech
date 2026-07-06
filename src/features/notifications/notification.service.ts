import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  getStoredNotificationPreferences,
  storeNotificationPreferences,
} from "./notificationPreferences.storage";
import type {
  NotificationEligibility,
  NotificationPreferences,
  NotificationSnoozeOption,
  NotificationSnoozeUnit,
} from "./notificationPreferences.types";

export const STUDY_REMINDERS_CHANNEL_ID = "study-reminders";

export const NOTIFICATION_SNOOZE_OPTIONS: NotificationSnoozeOption[] = [
  { id: "off", label: "Off", value: 0, unit: null },
  { id: "1-minute", label: "1 min", value: 1, unit: "minutes" },
  { id: "15-minutes", label: "15 min", value: 15, unit: "minutes" },
  { id: "1-hour", label: "1 hour", value: 1, unit: "hours" },
  { id: "8-hours", label: "8 hours", value: 8, unit: "hours" },
  { id: "1-day", label: "1 day", value: 1, unit: "days" },
  { id: "7-days", label: "7 days", value: 7, unit: "days" },
];

let didConfigureHandler = false;
let didRequestPermissionOnAppEntry = false;

function debugNotification(message: string, data?: Record<string, unknown>) {
  if (__DEV__) {
    console.info(`[notifications] ${message}`, data ?? "");
  }
}

function getUpdatedPreferences(
  preferences: Partial<NotificationPreferences>,
): NotificationPreferences {
  return {
    ...DEFAULT_NOTIFICATION_PREFERENCES,
    ...preferences,
    updatedAt: new Date().toISOString(),
  };
}

function addDuration(date: Date, value: number, unit: NotificationSnoozeUnit) {
  const nextDate = new Date(date);

  if (unit === "minutes") {
    nextDate.setMinutes(nextDate.getMinutes() + value);
  }

  if (unit === "hours") {
    nextDate.setHours(nextDate.getHours() + value);
  }

  if (unit === "days") {
    nextDate.setDate(nextDate.getDate() + value);
  }

  return nextDate;
}

function getOptionDurationMs(option: NotificationSnoozeOption) {
  if (!option.unit) {
    return 0;
  }

  if (option.unit === "minutes") {
    return option.value * 60 * 1000;
  }

  if (option.unit === "hours") {
    return option.value * 60 * 60 * 1000;
  }

  return option.value * 24 * 60 * 60 * 1000;
}

function isSnoozed(preferences: NotificationPreferences) {
  if (!preferences.snoozedUntil) {
    return false;
  }

  return new Date(preferences.snoozedUntil).getTime() > Date.now();
}

export function getSnoozeLabel(preferences: NotificationPreferences) {
  if (!isSnoozed(preferences) || !preferences.snoozedUntil) {
    return "Off";
  }

  const remainingMs = new Date(preferences.snoozedUntil).getTime() - Date.now();
  const matchedOption = NOTIFICATION_SNOOZE_OPTIONS.find((option) => {
    const optionMs = getOptionDurationMs(option);

    return optionMs > 0 && Math.abs(optionMs - remainingMs) < 60 * 1000;
  });

  if (matchedOption) {
    return matchedOption.label;
  }

  const remainingMinutes = Math.max(1, Math.ceil(remainingMs / (60 * 1000)));

  if (remainingMinutes < 60) {
    return `${remainingMinutes} min`;
  }

  const remainingHours = Math.ceil(remainingMinutes / 60);

  if (remainingHours < 24) {
    return `${remainingHours} hour${remainingHours > 1 ? "s" : ""}`;
  }

  const remainingDays = Math.ceil(remainingHours / 24);

  return `${remainingDays} day${remainingDays > 1 ? "s" : ""}`;
}

export function getNextSnoozeOption(
  preferences: NotificationPreferences,
): NotificationSnoozeOption {
  if (!isSnoozed(preferences) || !preferences.snoozedUntil) {
    return NOTIFICATION_SNOOZE_OPTIONS[1];
  }

  const remainingMs = new Date(preferences.snoozedUntil).getTime() - Date.now();
  const matchedIndex = NOTIFICATION_SNOOZE_OPTIONS.findIndex((option) => {
    const optionMs = getOptionDurationMs(option);

    return optionMs > 0 && Math.abs(optionMs - remainingMs) < 60 * 1000;
  });

  if (
    matchedIndex < 0 ||
    matchedIndex === NOTIFICATION_SNOOZE_OPTIONS.length - 1
  ) {
    return NOTIFICATION_SNOOZE_OPTIONS[0];
  }

  return NOTIFICATION_SNOOZE_OPTIONS[matchedIndex + 1];
}

export async function getNotificationPreferences() {
  const preferences = await getStoredNotificationPreferences();

  if (!isSnoozed(preferences) && preferences.snoozedUntil) {
    return saveNotificationPreferences({
      ...preferences,
      snoozedUntil: null,
    });
  }

  return preferences;
}

export async function saveNotificationPreferences(
  preferences: NotificationPreferences,
) {
  const nextPreferences = getUpdatedPreferences(preferences);
  await storeNotificationPreferences(nextPreferences);

  return nextPreferences;
}

export async function setNotificationsEnabled(enabled: boolean) {
  const preferences = await getNotificationPreferences();

  return saveNotificationPreferences({
    ...preferences,
    notificationsEnabled: enabled,
  });
}

export async function snoozeNotifications(
  value: number,
  unit: NotificationSnoozeUnit,
) {
  const preferences = await getNotificationPreferences();
  const snoozedUntil = addDuration(new Date(), value, unit).toISOString();

  return saveNotificationPreferences({
    ...preferences,
    snoozedUntil,
  });
}

export async function clearNotificationSnooze() {
  const preferences = await getNotificationPreferences();

  return saveNotificationPreferences({
    ...preferences,
    snoozedUntil: null,
  });
}

export function configureNotificationHandler() {
  if (didConfigureHandler) {
    return;
  }

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  didConfigureHandler = true;
}

export async function ensureAndroidNotificationChannel() {
  if (Platform.OS !== "android") {
    return;
  }

  await Notifications.setNotificationChannelAsync(STUDY_REMINDERS_CHANNEL_ID, {
    description: "Study reminders, bookmark milestones, and learning nudges.",
    importance: Notifications.AndroidImportance.HIGH,
    lightColor: "#1F80E0",
    name: "Study reminders",
    vibrationPattern: [0, 200, 200, 200],
  });
}

export async function initializeNotificationInfrastructure() {
  configureNotificationHandler();
  await ensureAndroidNotificationChannel();
  debugNotification("initialized", { channelId: STUDY_REMINDERS_CHANNEL_ID });
}

export async function requestNotificationPermission() {
  await ensureAndroidNotificationChannel();

  const existingPermission = await Notifications.getPermissionsAsync();
  debugNotification("permission existing", {
    canAskAgain: existingPermission.canAskAgain,
    granted: existingPermission.granted,
    status: existingPermission.status,
  });

  if (existingPermission.granted) {
    return existingPermission;
  }

  const requestedPermission = await Notifications.requestPermissionsAsync();
  debugNotification("permission requested", {
    canAskAgain: requestedPermission.canAskAgain,
    granted: requestedPermission.granted,
    status: requestedPermission.status,
  });

  return requestedPermission;
}

export async function requestNotificationPermissionOnAppEntry() {
  if (didRequestPermissionOnAppEntry) {
    return Notifications.getPermissionsAsync();
  }

  didRequestPermissionOnAppEntry = true;

  const preferences = await getNotificationPreferences();

  if (!preferences.notificationsEnabled) {
    return Notifications.getPermissionsAsync();
  }

  await ensureAndroidNotificationChannel();

  const existingPermission = await Notifications.getPermissionsAsync();

  if (existingPermission.granted || !existingPermission.canAskAgain) {
    return existingPermission;
  }

  return Notifications.requestPermissionsAsync();
}

export async function getNotificationEligibility(): Promise<NotificationEligibility> {
  const preferences = await getNotificationPreferences();

  if (!preferences.notificationsEnabled) {
    debugNotification("blocked by disabled preference");
    return { allowed: false, reason: "disabled" };
  }

  if (isSnoozed(preferences)) {
    debugNotification("blocked by snooze", {
      snoozedUntil: preferences.snoozedUntil,
    });
    return {
      allowed: false,
      reason: "snoozed",
      snoozedUntil: preferences.snoozedUntil ?? undefined,
    };
  }

  const permission = await requestNotificationPermission();

  if (!permission.granted) {
    debugNotification("blocked by permission", {
      canAskAgain: permission.canAskAgain,
      status: permission.status,
    });
    return { allowed: false, reason: "permission-denied" };
  }

  debugNotification("eligible");
  return { allowed: true };
}

export async function scheduleLocalNotification({
  body,
  data,
  seconds = null,
  title,
}: {
  body: string;
  data?: Record<string, unknown>;
  seconds?: number | null;
  title: string;
}) {
  const eligibility = await getNotificationEligibility();

  if (!eligibility.allowed) {
    debugNotification("schedule skipped", {
      reason: eligibility.reason,
      snoozedUntil: eligibility.snoozedUntil,
      title,
    });
    return null;
  }

  const trigger =
    seconds === null
      ? null
      : {
          channelId: STUDY_REMINDERS_CHANNEL_ID,
          seconds,
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        };

  debugNotification("scheduling", { title, trigger });

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      body,
      data,
      title,
    },
    trigger,
  });

  debugNotification("scheduled", { notificationId, title });

  return notificationId;
}
