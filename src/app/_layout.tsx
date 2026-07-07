import "../../global.css";

import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useColorScheme } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AnimatedSplash } from "@/components/common/AnimatedSplash";
import {
  initializeNotificationInfrastructure,
  requestNotificationPermissionOnAppEntry,
} from "@/features/notifications/notification.service";
import { AppThemeProvider } from "@/theme/AppTheme";
import { paperDarkTheme, paperLightTheme } from "@/theme/paperTheme";
import { colors } from "@/theme/tokens";

import * as Clarity from "@microsoft/react-native-clarity";
import * as Sentry from "@sentry/react-native";
void SplashScreen.preventAutoHideAsync();

const clarityProjectId = process.env.EXPO_PUBLIC_MICROSOFT_CLARITY_PROJECT_ID;
console.log("Clarity project ID:", clarityProjectId);

if (clarityProjectId) {
  Clarity.initialize(clarityProjectId, {
    logLevel: Clarity.LogLevel.Verbose, // Note: Use "LogLevel.Verbose" while testing to debug initialization issues.
  });
}
Sentry.init({
  dsn: "https://903a02116411d20a13926a63da0715ed@o4510888998993920.ingest.de.sentry.io/4511689267740752",

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,

  // Enable Logs
  enableLogs: true,

  // Configure Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [
    Sentry.mobileReplayIntegration(),
    Sentry.feedbackIntegration(),
  ],

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});
function RootLayout() {
  const [showSplash, setShowSplash] = useState(true);
  const [themeOverride, setThemeOverride] = useState<"dark" | "light" | null>(
    null,
  );
  const colorScheme = useColorScheme();
  const themeMode =
    themeOverride ?? (colorScheme === "light" ? "light" : "dark");
  const isDark = themeMode === "dark";
  const paperTheme = useMemo(
    () => (isDark ? paperDarkTheme : paperLightTheme),
    [isDark],
  );
  const appColors = isDark ? colors.dark : colors.light;

  useEffect(() => {
    void SplashScreen.hideAsync();
    void (async () => {
      await initializeNotificationInfrastructure();
      await requestNotificationPermissionOnAppEntry();
    })();
  }, []);

  const handleSplashFinish = useCallback(() => {
    setShowSplash(false);
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PaperProvider theme={paperTheme}>
          <AppThemeProvider mode={themeMode} setMode={setThemeOverride}>
            <Stack
              screenOptions={{
                animation: "fade",
                contentStyle: { backgroundColor: appColors.background },
                headerShown: false,
              }}
            >
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="detail/[mediaId]" />
            </Stack>
            <StatusBar style={isDark ? "light" : "dark"} />
            {showSplash ? (
              <AnimatedSplash onFinish={handleSplashFinish} />
            ) : null}
          </AppThemeProvider>
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
export default Sentry.wrap(RootLayout);
