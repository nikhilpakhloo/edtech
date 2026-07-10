import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import {
  APP_ICON_OPTIONS,
  type AppIconId,
  getSelectedAppIconId,
  selectAppIcon,
} from "@/features/appIcon/appIcon.config";
import { useAppTheme } from "@/theme/AppTheme";
import { trackClarityEvent } from "@/services/observability";
import { selectionHaptic } from "@/utils/haptics";
import { useResponsiveMetrics } from "@/utils/responsive";

export function ProfileAppIconSelector() {
  const { colors } = useAppTheme();
  const metrics = useResponsiveMetrics();
  const [selectedAppIconId, setSelectedAppIconId] = useState<AppIconId>("education");
  const [appIconFeedback, setAppIconFeedback] = useState("");
  
  const quickActionWidth = (metrics.contentWidth - metrics.horizontalPadding * 2 - 12) / 2;

  useEffect(() => {
    setSelectedAppIconId(getSelectedAppIconId());
    setAppIconFeedback("Choose the launcher icon shown on your Android home screen.");
  }, []);

  const updateAppIcon = useCallback(async (iconId: AppIconId) => {
    selectionHaptic();
    trackClarityEvent("profile_app_icon_selected", { iconId });
    
    const success = selectAppIcon(iconId);
    if (success) {
      setSelectedAppIconId(iconId);
      setAppIconFeedback("Launcher icon updated.");
    } else {
      setAppIconFeedback("Failed to update launcher icon.");
    }
  }, []);

  return (
    <>
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
              accessibilityState={{ selected }}
              accessibilityLabel={`Use ${icon.label} app icon`}
              className="rounded-lg border p-3"
              style={{
                backgroundColor: colors.surface,
                borderColor: selected ? colors.primary : colors.border,
                width: metrics.isCompact ? quickActionWidth : undefined,
                flex: metrics.isCompact ? undefined : 1,
              }}
              onPress={() => updateAppIcon(icon.id)}
            >
              <View className="flex-row items-center justify-between">
                <View
                  className="h-14 w-14 items-center justify-center rounded-lg"
                  style={{ backgroundColor: "#E8F1FF" }}
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
    </>
  );
}

const styles = StyleSheet.create({
  appIconPreview: {
    height: 44,
    width: 44,
  },
});
