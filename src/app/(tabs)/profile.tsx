import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
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
import {
  addMonitoringBreadcrumb,
  captureDemoMessage,
  captureFatalNativeCrash,
  captureHandledException,
  identifyDemoLearner,
  startFreshClaritySession,
  setFeatureTags,
  setLearningContext,
  Sentry,
  trackClarityEvent,
} from "@/services/observability";
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
  const [sentryFeedback, setSentryFeedback] = useState("");
  const [isSendingNativeCrash, setIsSendingNativeCrash] = useState(false);
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
      trackClarityEvent("profile_setting_pressed", {
        settingId: setting.id,
        settingValue: setting.value,
      });

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
    trackClarityEvent("profile_app_icon_selected", {
      iconId,
    });

    const result = await selectAppIcon(iconId);
    setSelectedAppIconId(result.selectedIconId);
    setAppIconFeedback(
      result.status === "supported"
        ? "Launcher icon updated."
        : "Icon switching needs an Android development build.",
    );
  }, []);

  const sendSentryLogsTest = useCallback(() => {
    selectionHaptic();

    trackClarityEvent("profile_send_telemetry_pressed", {
      testPanel: "profile",
      testType: "identity-tags-context",
    });
    identifyDemoLearner();
    setFeatureTags({
      feature: "profile",
      lesson_mode: "practice",
      plan: "premium-demo",
    });
    setLearningContext({
      activeScreen: "profile",
      currentLessonId: "lesson-react-native-observability",
      progressPercent: 0.68,
      streakDays: 7,
    });
    addMonitoringBreadcrumb("Profile Sentry verification started", {
      source: "dev-dashboard",
      testType: "message-logs-context",
    });
    captureDemoMessage("EdStream observability smoke test");
    Sentry.logger.trace("EdStream trace log", { source: "profile" });
    Sentry.logger.debug("EdStream debug log", { source: "profile" });
    Sentry.logger.info("EdStream info log", { source: "profile" });
    Sentry.logger.warn("EdStream warning log", { source: "profile" });
    Sentry.logger.error("EdStream error log", { source: "profile" });
    Sentry.logger.fatal("EdStream fatal log", { source: "profile" });
    console.info("EdStream console info log for Sentry");
    console.warn("EdStream console warning log for Sentry");
    setSentryFeedback("Sent user, tags, context, breadcrumbs, logs, and message.");
  }, []);

  const sendSentryReplayErrorTest = useCallback(() => {
    selectionHaptic();

    trackClarityEvent("profile_replay_error_pressed", {
      expectedReplay: true,
      testPanel: "profile",
    });
    addMonitoringBreadcrumb("Learner tapped replay error verification", {
      expectedAttachments: ["session replay", "screenshot", "view hierarchy"],
    });
    setFeatureTags({
      experiment: "assignment-observability-demo",
      feature: "profile",
      replay_test: true,
    });
    setLearningContext({
      activeScreen: "profile",
      failingAction: "resume-course",
      mediaId: "rn-observability-101",
    });
    captureHandledException(
      new Error("EdStream handled exception with replay context"),
      {
        feature: "profile",
        flow: "resume-course",
        metadata: {
          expectedAttachments: ["session replay", "screenshot", "view hierarchy"],
          mediaId: "rn-observability-101",
          retryable: true,
        },
      },
    );
    setSentryFeedback("Sent handled exception with tags, context, and replay hints.");
  }, []);

  const runAllSafeSentryTests = useCallback(() => {
    trackClarityEvent("profile_run_all_safe_tests_pressed", {
      safeTestCount: 2,
      testPanel: "profile",
    });
    sendSentryLogsTest();
    sendSentryReplayErrorTest();
    setSentryFeedback("Sent all safe Sentry tests.");
  }, [sendSentryLogsTest, sendSentryReplayErrorTest]);

  const startNewClaritySessionTest = useCallback(() => {
    selectionHaptic();
    startFreshClaritySession("profile-test-panel");
    setSentryFeedback("Requested a fresh Clarity session with demo tags.");
  }, []);

  const triggerNativeSentryCrash = useCallback(() => {
    selectionHaptic();
    trackClarityEvent("profile_native_crash_pressed", {
      crashType: "native",
      intentional: true,
      testPanel: "profile",
    });
    addMonitoringBreadcrumb("Native crash test armed", {
      screen: "profile",
      warning: "intentional-development-crash",
    });
    setFeatureTags({
      crash_type: "native",
      feature: "profile",
      intentional: true,
    });
    setIsSendingNativeCrash(true);
    setSentryFeedback("Sending native crash...");
    setTimeout(() => {
      captureFatalNativeCrash();
    }, 350);
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

        {true ? (
          <View style={{ marginTop: metrics.isCompact ? 24 : 28 }}>
            <Text className="text-xl font-black" style={{ color: colors.text }}>
              Sentry tests
            </Text>
            <Text className="mt-1 text-sm" style={{ color: colors.textMuted }}>
              {sentryFeedback || "Development-only dashboard verification."}
            </Text>

            <View className="mt-4 overflow-hidden rounded-lg border"
              style={{
                backgroundColor: colors.surface,
                borderColor: isDark ? "rgba(255,255,255,0.1)" : colors.border,
              }}
            >
              {[
                {
                  description: "User, tags, context, breadcrumbs, message, and logs.",
                  icon: "receipt-outline",
                  label: "Send telemetry",
                  onPress: sendSentryLogsTest,
                },
                {
                  description: "Handled exception with replay, tags, and learning context.",
                  icon: "videocam-outline",
                  label: "Send replay error",
                  onPress: sendSentryReplayErrorTest,
                },
                {
                  description: "Runs logs and replay error together.",
                  icon: "play-circle-outline",
                  label: "Run safe tests",
                  onPress: runAllSafeSentryTests,
                },
                {
                  description: "Starts a new Clarity session and applies demo identifiers.",
                  icon: "scan-circle-outline",
                  label: "Refresh Clarity",
                  onPress: startNewClaritySessionTest,
                },
                {
                  description: "Intentional native crash. Event appears after restart.",
                  icon: "warning-outline",
                  label: "Crash native app",
                  onPress: triggerNativeSentryCrash,
                },
              ].map((test, index, tests) => (
                <Pressable
                  key={test.label}
                  accessibilityRole="button"
                  accessibilityLabel={test.label}
                  className="flex-row items-center border-b px-4 py-4"
                  style={{
                    borderBottomColor:
                      index === tests.length - 1
                        ? "transparent"
                        : isDark
                          ? "rgba(255,255,255,0.1)"
                          : colors.border,
                  }}
                  onPress={test.onPress}
                >
                  <View className="h-11 w-11 items-center justify-center rounded-full bg-brand-cyan/15">
                    {test.label === "Crash native app" &&
                    isSendingNativeCrash ? (
                      <ActivityIndicator color="#00A6D6" size="small" />
                    ) : (
                      <Ionicons
                        name={test.icon as keyof typeof Ionicons.glyphMap}
                        color="#00A6D6"
                        size={22}
                      />
                    )}
                  </View>
                  <View className="ml-3 flex-1">
                    <Text
                      className="text-base font-bold"
                      style={{ color: colors.text }}
                    >
                      {test.label}
                    </Text>
                    <Text
                      className="mt-1 text-sm leading-5"
                      style={{ color: colors.textMuted }}
                    >
                      {test.description}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}

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
