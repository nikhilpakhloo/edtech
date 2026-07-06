import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Avatar, Switch } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ProfileSkeleton } from "@/components/common/Skeleton";
import { Screen } from "@/components/layout/Screen";
import { APP_STRINGS } from "@/constants/string";
import { apiService } from "@/data/apiService";
import { APP_ICON_OPTIONS } from "@/features/appIcon/appIcon.config";
import {
  getSelectedAppIconId,
  isDynamicAppIconSupported,
  selectAppIcon,
} from "@/features/appIcon/appIcon.service";
import type { AppIconId } from "@/features/appIcon/appIcon.types";
import {
  clearNotificationSnooze,
  getNextSnoozeOption,
  getNotificationPreferences,
  getSnoozeLabel,
  snoozeNotifications,
} from "@/features/notifications/notification.service";
import type { NotificationPreferences } from "@/features/notifications/notificationPreferences.types";
import { useAppTheme } from "@/theme/AppTheme";
import type {
  ProfileResponse,
  ProfileSetting,
} from "@/types/media";
import { selectionHaptic } from "@/utils/haptics";
import { useResponsiveMetrics } from "@/utils/responsive";
import { getTabBarContentPadding } from "@/utils/tabBar";

const settingIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
  autoplay: "play-circle-outline",
  dataSaver: "phone-portrait-outline",
  quality: "wifi-outline",
  downloads: "cloud-download-outline",
  language: "language-outline",
  notifications: "notifications-outline",
  notificationSnooze: "time-outline",
  theme: "moon-outline",
};

const settingValueOptions: Record<string, string[]> = {
  downloads: ["Standard", "High", "Data Saver"],
  language: ["English, Hindi", "English", "Hindi", "Tamil"],
  quality: ["Auto", "High", "Medium", "Data Saver"],
  theme: ["Dark", "System", "Light"],
};

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
  const { colors, isDark, mode, toggleMode } = useAppTheme();
  const metrics = useResponsiveMetrics();
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [notificationPreferences, setNotificationPreferences] =
    useState<NotificationPreferences | null>(null);
  const [selectedAppIconId, setSelectedAppIconId] =
    useState<AppIconId>("default");
  const [appIconSupported, setAppIconSupported] = useState(false);
  const [appIconFeedback, setAppIconFeedback] = useState("");
  const [settings, setSettings] = useState<ProfileSetting[]>([]);
  const dashboard = profile?.dashboard;
  const quickActionWidth =
    (metrics.contentWidth - metrics.horizontalPadding * 2 - 12) / 2;
  const displayedSettings = useMemo(
    () =>
      settings.map((setting) =>
        setting.id === "theme"
          ? {
              ...setting,
              enabled: mode === "dark",
              value: mode === "dark" ? "Dark" : "Light",
            }
          : setting,
      ),
    [mode, settings],
  );

  const updateSetting = useCallback(
    async (setting: ProfileSetting) => {
      selectionHaptic();

      if (setting.id === NOTIFICATION_SNOOZE_SETTING_ID) {
        const preferences =
          notificationPreferences ?? (await getNotificationPreferences());
        const nextOption = getNextSnoozeOption(preferences);
        const nextPreferences = nextOption.unit
          ? await snoozeNotifications(nextOption.value, nextOption.unit)
          : await clearNotificationSnooze();

        setNotificationPreferences(nextPreferences);
        setSettings((currentSettings) =>
          withNotificationSettings(currentSettings, nextPreferences),
        );

        return;
      }

      setSettings((currentSettings) =>
        currentSettings.map((currentSetting) => {
          if (currentSetting.id !== setting.id) {
            return currentSetting;
          }

          if (currentSetting.id === "theme") {
            const nextMode = mode === "dark" ? "Light" : "Dark";

            return {
              ...currentSetting,
              enabled: mode !== "dark",
              value: nextMode,
            };
          }

          if (typeof currentSetting.enabled === "boolean") {
            return {
              ...currentSetting,
              enabled: !currentSetting.enabled,
              value: !currentSetting.enabled ? "On" : "Off",
            };
          }

          const options = settingValueOptions[currentSetting.id];

          if (!options?.length) {
            return currentSetting;
          }

          const currentIndex = Math.max(
            0,
            options.indexOf(currentSetting.value),
          );
          const nextValue = options[(currentIndex + 1) % options.length];

          return {
            ...currentSetting,
            value: nextValue,
          };
        }),
      );
      if (setting.id === "theme") {
        toggleMode();
      }
    },
    [mode, notificationPreferences, toggleMode],
  );

  const updateAppIcon = useCallback(async (iconId: AppIconId) => {
    selectionHaptic();

    const result = await selectAppIcon(iconId);
    setSelectedAppIconId(result.selectedIconId);
    setAppIconFeedback(
      result.status === "supported"
        ? "Launcher icon updated."
        : "Icon switching needs an Android development build.",
    );
  }, []);

  useEffect(() => {
    let isMounted = true;

    Promise.all([
      apiService.getProfile(),
      getNotificationPreferences(),
      getSelectedAppIconId(),
      isDynamicAppIconSupported(),
    ]).then(([response, preferences, iconId, iconSupported]) => {
      if (isMounted) {
        setProfile(response);
        setNotificationPreferences(preferences);
        setSelectedAppIconId(iconId);
        setAppIconSupported(iconSupported);
        setAppIconFeedback(
          iconSupported
            ? "Choose the launcher icon shown on your Android home screen."
            : "Icon switching needs an Android development build.",
        );
        setSettings(withNotificationSettings(response.settings, preferences));
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  if (!profile) {
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

        <View
          className="rounded-lg border p-4"
          style={{
            backgroundColor: colors.surface,
            borderColor: isDark ? "rgba(255,255,255,0.1)" : colors.border,
          }}
        >
          <View className="flex-row items-center">
            <Avatar.Text
              size={54}
              label={profile.avatarInitials}
              color="#FFFFFF"
              labelStyle={{ fontWeight: "900" }}
              style={{ backgroundColor: colors.primary }}
            />
            <View className="ml-4 flex-1">
              <Text
                className="text-xl font-black"
                style={{ color: colors.text }}
              >
                {profile.displayName}
              </Text>
              <View
                className="mt-2 self-start rounded-full px-3 py-1"
                style={{
                  backgroundColor: isDark
                    ? "rgba(255,255,255,0.08)"
                    : colors.elevated,
                }}
              >
                <Text
                  className="text-xs font-black"
                  style={{ color: colors.primary }}
                >
                  {profile.planName}
                </Text>
              </View>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={APP_STRINGS.accessibility.editProfile}
              className="h-10 w-10 items-center justify-center rounded-full"
              style={{ backgroundColor: colors.elevated }}
              onPress={selectionHaptic}
            >
              <Ionicons name="create-outline" color={colors.text} size={20} />
            </Pressable>
          </View>

          <View className="mt-5 flex-row flex-wrap" style={{ gap: 10 }}>
            {(dashboard?.stats ?? []).map((stat, index) => (
              <View
                key={stat.id}
                className="rounded-lg border px-3 py-3"
                style={{
                  backgroundColor: colors.elevated,
                  borderColor: isDark
                    ? "rgba(255,255,255,0.08)"
                    : colors.border,
                  width: metrics.isCompact ? quickActionWidth : undefined,
                  flex: metrics.isCompact ? undefined : 1,
                }}
              >
                <Text
                  numberOfLines={1}
                  className="text-[11px] font-bold uppercase tracking-[1px]"
                  style={{ color: colors.textMuted }}
                >
                  {stat.label}
                </Text>
                <View className="mt-1 flex-row items-end">
                  <Text
                    className="text-xl font-black"
                    style={{ color: colors.text }}
                  >
                    {stat.value}
                  </Text>
                  <Text
                    className="mb-0.5 ml-1 text-xs font-bold"
                    style={{ color: colors.primary }}
                  >
                    {stat.suffix}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={{ marginTop: metrics.isCompact ? 24 : 28 }}>
          <Text className="text-xl font-black" style={{ color: colors.text }}>
            {APP_STRINGS.profile.preferencesTitle}
          </Text>
          <Text className="mt-1 text-sm" style={{ color: colors.textMuted }}>
            Manage reminder snooze and appearance.
          </Text>
        </View>

        <View
          className="mt-4 overflow-hidden rounded-lg border"
          style={{
            backgroundColor: colors.surface,
            borderColor: isDark ? "rgba(255,255,255,0.1)" : colors.border,
          }}
        >
          {displayedSettings.map((setting, index) => (
            <Pressable
              key={setting.id}
              accessibilityRole="button"
              accessibilityLabel={setting.title}
              className="flex-row items-center border-b px-4 py-4"
              style={{
                borderBottomColor:
                  index === displayedSettings.length - 1
                    ? "transparent"
                    : isDark
                      ? "rgba(255,255,255,0.1)"
                      : colors.border,
              }}
              onPress={() => updateSetting(setting)}
            >
              <View className="h-11 w-11 items-center justify-center rounded-full bg-brand-blue/15">
                <Ionicons
                  name={settingIcons[setting.id] ?? "settings-outline"}
                  color="#4F8CFF"
                  size={22}
                />
              </View>
              <View className="ml-3 flex-1">
                <View className="flex-row items-center">
                  <Text
                    className="flex-1 text-base font-bold"
                    style={{ color: colors.text }}
                  >
                    {setting.title}
                  </Text>
                </View>
                <Text
                  className="mt-1 text-sm leading-5"
                  style={{ color: colors.textMuted }}
                >
                  {setting.description}
                </Text>
              </View>
              {typeof setting.enabled === "boolean" ||
              setting.id === "theme" ? (
                <Switch
                  color="#1F80E0"
                  value={
                    setting.id === "theme" ? mode === "dark" : setting.enabled
                  }
                  onValueChange={() => updateSetting(setting)}
                />
              ) : (
                <View className="ml-3 flex-row items-center">
                  <Text
                    numberOfLines={1}
                    className="text-right text-sm font-black text-brand-cyan"
                    style={styles.settingValue}
                  >
                    {setting.value}
                  </Text>
                  <Ionicons
                    name="chevron-forward"
                    color={colors.textMuted}
                    size={18}
                  />
                </View>
              )}
            </Pressable>
          ))}
        </View>

        <View style={{ marginTop: metrics.isCompact ? 24 : 28 }}>
          <Text className="text-xl font-black" style={{ color: colors.text }}>
            App icon
          </Text>
          <Text className="mt-1 text-sm" style={{ color: colors.textMuted }}>
            {appIconFeedback}
          </Text>
        </View>

        <View className="mt-4 flex-row flex-wrap" style={{ gap: 10 }}>
          {APP_ICON_OPTIONS.map((icon) => {
            const selected = icon.id === selectedAppIconId;

            return (
              <Pressable
                key={icon.id}
                accessibilityRole="button"
                accessibilityState={{
                  disabled: !appIconSupported,
                  selected,
                }}
                accessibilityLabel={`Use ${icon.label} app icon`}
                className="rounded-lg border p-3"
                disabled={!appIconSupported}
                style={{
                  backgroundColor: colors.surface,
                  borderColor: selected ? colors.primary : colors.border,
                  opacity: appIconSupported ? 1 : 0.58,
                  width: metrics.isCompact ? quickActionWidth : undefined,
                  flex: metrics.isCompact ? undefined : 1,
                }}
                onPress={() => updateAppIcon(icon.id)}
              >
                <View className="flex-row items-center justify-between">
                  <View
                    className="h-14 w-14 items-center justify-center rounded-lg"
                    style={{ backgroundColor: icon.previewBackgroundColor }}
                  >
                    <Image
                      source={icon.previewAsset}
                      resizeMode="contain"
                      style={styles.appIconPreview}
                    />
                  </View>
                  {selected ? (
                    <View
                      className="h-7 w-7 items-center justify-center rounded-full"
                      style={{ backgroundColor: colors.primary }}
                    >
                      <Ionicons name="checkmark" color="#FFFFFF" size={17} />
                    </View>
                  ) : null}
                </View>
                <Text
                  numberOfLines={1}
                  className="mt-3 text-sm font-black"
                  style={{ color: colors.text }}
                >
                  {icon.label}
                </Text>
                <Text
                  numberOfLines={2}
                  className="mt-1 text-xs leading-4"
                  style={{ color: colors.textMuted }}
                >
                  {icon.description}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View
          className="mt-6 rounded-lg border p-4"
          style={{
            backgroundColor: colors.elevated,
            borderColor: isDark ? "rgba(255,255,255,0.1)" : colors.border,
          }}
        >
          <View className="flex-row items-center">
            <View className="h-11 w-11 items-center justify-center rounded-full bg-brand-gold/15">
              <Ionicons name="flame-outline" color="#F5C542" size={23} />
            </View>
            <View className="ml-3 flex-1">
              <Text
                className="text-base font-black"
                style={{ color: colors.text }}
              >
                {APP_STRINGS.profile.streakTitle}
              </Text>
              <Text
                className="mt-1 text-sm leading-5"
                style={{ color: colors.textMuted }}
              >
                {dashboard?.streakMessage ?? APP_STRINGS.profile.streakMessage}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  quickAction: {
    borderRadius: 8,
    padding: 12,
  },
  settingValue: {
    maxWidth: 96,
  },
  appIconPreview: {
    height: 44,
    width: 44,
  },
});
