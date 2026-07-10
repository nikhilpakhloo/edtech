import Constants from "expo-constants";
import * as Clarity from "@microsoft/react-native-clarity";
import * as Sentry from "@sentry/react-native";

const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN;
const APP_ENV =
  process.env.EXPO_PUBLIC_APP_ENV ?? (__DEV__ ? "development" : "production");
const IS_PRODUCTION = APP_ENV === "production";
const CLARITY_PROJECT_ID = process.env.EXPO_PUBLIC_MICROSOFT_CLARITY_PROJECT_ID;
const SENTRY_ENABLED = process.env.EXPO_PUBLIC_ENABLE_SENTRY !== "false";
const CLARITY_ENABLED = process.env.EXPO_PUBLIC_ENABLE_CLARITY !== "false";

let isMonitoringInitialized = false;

function getAppVersion() {
  return Constants.expoConfig?.version ?? "1.0.0";
}

function getBuildNumber() {
  return (
    Constants.expoConfig?.ios?.buildNumber ??
    Constants.expoConfig?.android?.versionCode?.toString() ??
    "local"
  );
}

export function initializeObservability() {
  if (isMonitoringInitialized) {
    return;
  }

  if (CLARITY_ENABLED && CLARITY_PROJECT_ID) {
    Clarity.initialize(CLARITY_PROJECT_ID, {
      logLevel: __DEV__ ? Clarity.LogLevel.Verbose : Clarity.LogLevel.None,
    });
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    enabled: SENTRY_ENABLED && Boolean(SENTRY_DSN),
    enableLogs: true,
    environment: APP_ENV,
    integrations: [
      Sentry.mobileReplayIntegration(),
      Sentry.feedbackIntegration(),
    ],
    release: `${Constants.expoConfig?.slug ?? "edstream"}@${getAppVersion()}+${getBuildNumber()}`,
    replaysOnErrorSampleRate: 1,
    replaysSessionSampleRate: IS_PRODUCTION ? 0.1 : 1,
    sendDefaultPii: true,
    tracesSampleRate: IS_PRODUCTION ? 0.2 : 1,
  });

  isMonitoringInitialized = true;
}

export function trackScreenView(screenName: string, metadata: Record<string, unknown> = {}) {
  Sentry.addBreadcrumb({
    category: "navigation",
    data: metadata,
    level: "info",
    message: `Viewed ${screenName}`,
  });
  if (CLARITY_ENABLED && CLARITY_PROJECT_ID) {
    void Clarity.setCurrentScreenName(screenName).catch(() => undefined);
  }
}

export { Sentry, Clarity };
