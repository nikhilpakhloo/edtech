import { Ionicons } from "@expo/vector-icons";
import { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { Sentry } from "@/services/observability";
import { useAppTheme } from "@/theme/AppTheme";
import { selectionHaptic } from "@/utils/haptics";
import { useResponsiveMetrics } from "@/utils/responsive";

export function ProfileSentryTests() {
  const { colors, isDark } = useAppTheme();
  const metrics = useResponsiveMetrics();
  const [sentryFeedback, setSentryFeedback] = useState("");
  const [isSendingNativeCrash, setIsSendingNativeCrash] = useState(false);

  const sendSentryLogsTest = useCallback(() => {
    selectionHaptic();
    Sentry.captureMessage("Manual log test sent from Profile");
    setSentryFeedback("Message sent to Sentry.");
  }, []);

  const triggerNativeSentryCrash = useCallback(() => {
    selectionHaptic();
    setIsSendingNativeCrash(true);
    setSentryFeedback("Sending native crash...");
    setTimeout(() => {
      Sentry.nativeCrash();
    }, 350);
  }, []);

  return (
    <View style={{ marginTop: metrics.isCompact ? 24 : 28 }}>
      <Text className="text-xl font-black" style={{ color: colors.text }}>
        Sentry tests
      </Text>
      <Text className="mt-1 text-sm" style={{ color: colors.textMuted }}>
        {sentryFeedback || "Development-only dashboard verification."}
      </Text>

      <View
        className="mt-4 overflow-hidden rounded-lg border"
        style={{
          backgroundColor: colors.surface,
          borderColor: isDark ? "rgba(255,255,255,0.1)" : colors.border,
        }}
      >
        {[
          {
            description: "Sends a manual message to Sentry.",
            icon: "receipt-outline",
            label: "Send telemetry",
            onPress: sendSentryLogsTest,
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
              {test.label === "Crash native app" && isSendingNativeCrash ? (
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
              <Text className="text-base font-bold" style={{ color: colors.text }}>
                {test.label}
              </Text>
              <Text className="mt-1 text-sm leading-5" style={{ color: colors.textMuted }}>
                {test.description}
              </Text>
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
