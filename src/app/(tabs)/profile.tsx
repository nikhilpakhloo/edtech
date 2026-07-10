import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ProfileSkeleton } from "@/components/common/Skeleton";
import { Screen } from "@/components/layout/Screen";
import { APP_STRINGS } from "@/constants/string";
import { apiService } from "@/data/apiService";
import { getNotificationPreferences, getSnoozeLabel } from "@/features/notifications/notification.service";
import type { NotificationPreferences } from "@/features/notifications/notificationPreferences.types";
import { ProfileAppIconSelector } from "@/features/profile/ProfileAppIconSelector";
import { ProfileHeader } from "@/features/profile/ProfileHeader";
import { ProfileSentryTests } from "@/features/profile/ProfileSentryTests";
import { ProfileSettingsList } from "@/features/profile/ProfileSettingsList";
import { useAppTheme } from "@/theme/AppTheme";
import type { ProfileResponse, ProfileSetting } from "@/types/media";
import { useResponsiveMetrics } from "@/utils/responsive";
import { getTabBarContentPadding } from "@/utils/tabBar";

const NOTIFICATION_SNOOZE_SETTING_ID = "notificationSnooze";

function withNotificationSettings(
  settings: ProfileSetting[],
  preferences: NotificationPreferences,
) {
  const snoozeSetting: ProfileSetting = {
    id: NOTIFICATION_SNOOZE_SETTING_ID,
    title: "Snooze reminders",
    description: "Pause study notifications for minutes, hours, or days",
    value: getSnoozeLabel(preferences),
  };
  const appearanceSetting =
    settings.find((setting) => setting.id === "theme") ?? null;

  return appearanceSetting ? [snoozeSetting, appearanceSetting] : [snoozeSetting];
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const metrics = useResponsiveMetrics();
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [notificationPreferences, setNotificationPreferences] =
    useState<NotificationPreferences | null>(null);
  const [settings, setSettings] = useState<ProfileSetting[]>([]);
  const dashboard = profile?.dashboard;

  useEffect(() => {
    let isMounted = true;

    Promise.all([
      apiService.getProfile(),
      getNotificationPreferences(),
    ]).then(([response, preferences]) => {
      if (isMounted) {
        setProfile(response);
        setNotificationPreferences(preferences);
        setSettings(withNotificationSettings(response.settings, preferences));
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleUpdateSettings = (
    nextSettings: ProfileSetting[],
    nextPreferences: NotificationPreferences
  ) => {
    setNotificationPreferences(nextPreferences);
    setSettings(withNotificationSettings(nextSettings, nextPreferences));
  };

  if (!profile || !notificationPreferences) {
    return (
      <Screen edges={["top", "left", "right"]}>
        <ProfileSkeleton />
      </Screen>
    );
  }

  return (
    <Screen edges={["top", "left", "right"]}>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          backgroundColor: colors.background,
          paddingBottom: getTabBarContentPadding(insets.bottom),
          paddingHorizontal: metrics.horizontalPadding,
          paddingTop: 18,
        }}
      >
        <View style={{ marginBottom: metrics.isCompact ? 18 : 20 }}>
          <Text className="text-[13px] font-black uppercase tracking-[2px] text-brand-cyan">
            {APP_STRINGS.profile.eyebrow}
          </Text>
          <Text
            className="mt-1 font-black"
            style={{
              color: colors.text,
              fontSize: metrics.isCompact ? 28 : 30,
              lineHeight: metrics.isCompact ? 34 : 36,
            }}
          >
            {dashboard?.headline ?? APP_STRINGS.profile.title}
          </Text>
          <Text
            className="mt-2 text-sm leading-5"
            style={{ color: colors.textMuted }}
          >
            {dashboard?.summary ?? APP_STRINGS.profile.subtitle}
          </Text>
        </View>

        <ProfileHeader profile={profile} />

        <View style={{ marginTop: metrics.isCompact ? 24 : 28 }}>
          <Text className="text-xl font-black" style={{ color: colors.text }}>
            {APP_STRINGS.profile.preferencesTitle}
          </Text>
          <Text className="mt-1 text-sm" style={{ color: colors.textMuted }}>
            Manage reminder snooze and appearance.
          </Text>
        </View>
        <ProfileSettingsList
          initialSettings={settings}
          initialPreferences={notificationPreferences}
          onUpdateSettings={handleUpdateSettings}
        />

        <ProfileAppIconSelector />

        <ProfileSentryTests />
      </ScrollView>
    </Screen>
  );
}
