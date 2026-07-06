export type NotificationSnoozeUnit = 'minutes' | 'hours' | 'days';

export type NotificationPreferences = {
  notificationsEnabled: boolean;
  snoozedUntil: string | null;
  updatedAt: string;
};

export type NotificationSnoozeOption = {
  id: string;
  label: string;
  value: number;
  unit: NotificationSnoozeUnit | null;
};

export type NotificationEligibility =
  | {
      allowed: true;
    }
  | {
      allowed: false;
      reason: 'disabled' | 'snoozed' | 'permission-denied';
      snoozedUntil?: string;
    };
