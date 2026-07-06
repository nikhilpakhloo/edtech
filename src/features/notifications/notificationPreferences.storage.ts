import AsyncStorage from '@react-native-async-storage/async-storage';

import type { NotificationPreferences } from './notificationPreferences.types';

const NOTIFICATION_PREFERENCES_KEY = 'edstream:notificationPreferences';

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  notificationsEnabled: true,
  snoozedUntil: null,
  updatedAt: new Date(0).toISOString(),
};

export async function getStoredNotificationPreferences(): Promise<NotificationPreferences> {
  try {
    const rawValue = await AsyncStorage.getItem(NOTIFICATION_PREFERENCES_KEY);

    if (!rawValue) {
      return DEFAULT_NOTIFICATION_PREFERENCES;
    }

    return {
      ...DEFAULT_NOTIFICATION_PREFERENCES,
      ...(JSON.parse(rawValue) as Partial<NotificationPreferences>),
    };
  } catch {
    return DEFAULT_NOTIFICATION_PREFERENCES;
  }
}

export async function storeNotificationPreferences(
  preferences: NotificationPreferences,
): Promise<void> {
  await AsyncStorage.setItem(
    NOTIFICATION_PREFERENCES_KEY,
    JSON.stringify(preferences),
  );
}
