import { Ionicons } from "@expo/vector-icons";
import { useCallback, useState, useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Switch } from "react-native-paper";

import {
  clearNotificationSnooze,
  getNextSnoozeOption,
  snoozeNotifications,
} from "@/features/notifications/notification.service";
import type { NotificationPreferences } from "@/features/notifications/notificationPreferences.types";
import { useAppTheme } from "@/theme/AppTheme";
import type { ProfileSetting } from "@/types/media";
import { trackClarityEvent } from "@/services/observability";
import { selectionHaptic } from "@/utils/haptics";

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

interface ProfileSettingsListProps {
  initialSettings: ProfileSetting[];
  initialPreferences: NotificationPreferences;
  onUpdateSettings: (
    settings: ProfileSetting[],
    preferences: NotificationPreferences
  ) => void;
}

export function ProfileSettingsList({
  initialSettings,
  initialPreferences,
  onUpdateSettings,
}: ProfileSettingsListProps) {
  const { colors, isDark, mode, toggleMode } = useAppTheme();
  
  const displayedSettings = useMemo(
    () =>
      initialSettings.map((setting) =>
        setting.id === "theme"
          ? {
              ...setting,
              enabled: mode === "dark",
              value: mode === "dark" ? "Dark" : "Light",
            }
          : setting,
      ),
    [mode, initialSettings],
  );

  const updateSetting = useCallback(
    async (setting: ProfileSetting) => {
      selectionHaptic();
      trackClarityEvent("profile_setting_pressed", {
        settingId: setting.id,
        settingValue: setting.value,
      });

      if (setting.id === NOTIFICATION_SNOOZE_SETTING_ID) {
        const nextOption = getNextSnoozeOption(initialPreferences);
        const nextPreferences = nextOption.unit
          ? await snoozeNotifications(nextOption.value, nextOption.unit)
          : await clearNotificationSnooze();
        
        onUpdateSettings(initialSettings, nextPreferences);
        return;
      }

      const nextSettings = initialSettings.map((currentSetting) => {
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

        const currentIndex = Math.max(0, options.indexOf(currentSetting.value));
        const nextValue = options[(currentIndex + 1) % options.length];
        return {
          ...currentSetting,
          value: nextValue,
        };
      });

      onUpdateSettings(nextSettings, initialPreferences);

      if (setting.id === "theme") {
        toggleMode();
      }
    },
    [mode, initialPreferences, initialSettings, toggleMode, onUpdateSettings],
  );

  return (
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
          {typeof setting.enabled === "boolean" || setting.id === "theme" ? (
            <Switch
              color="#1F80E0"
              value={setting.id === "theme" ? mode === "dark" : setting.enabled}
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
              <Ionicons name="chevron-forward" color={colors.textMuted} size={18} />
            </View>
          )}
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  settingValue: {
    maxWidth: 96,
  },
});
