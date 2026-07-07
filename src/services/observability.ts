import Constants from "expo-constants";
import * as Device from "expo-device";
import { Platform } from "react-native";

import * as Clarity from "@microsoft/react-native-clarity";
import * as Sentry from "@sentry/react-native";

const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN;
const APP_ENV =
  process.env.EXPO_PUBLIC_APP_ENV ?? (__DEV__ ? "development" : "production");
const IS_PRODUCTION = APP_ENV === "production";
const CLARITY_PROJECT_ID = process.env.EXPO_PUBLIC_MICROSOFT_CLARITY_PROJECT_ID;
const SENTRY_ENABLED = process.env.EXPO_PUBLIC_ENABLE_SENTRY !== "false";
const CLARITY_ENABLED = process.env.EXPO_PUBLIC_ENABLE_CLARITY !== "false";

const dummyLearner = {
  email: "nikhiltesting@example.test",
  id: "demo-learner-1042",
  ip_address: "{{auto}}",
  username: "Nikhil Testing",
};

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

  Sentry.setUser(dummyLearner);
  Sentry.setTags({
    app: "edstream",
    assignment: "sentry-clarity-integration",
    build_type: __DEV__ ? "development-client" : "release-build",
    environment: APP_ENV,
    monitoring_clarity_enabled: CLARITY_ENABLED && Boolean(CLARITY_PROJECT_ID),
    monitoring_sentry_enabled: SENTRY_ENABLED && Boolean(SENTRY_DSN),
    platform: Platform.OS,
  });
  Sentry.setContext("app_runtime", {
    appOwnership: Constants.appOwnership,
    appVersion: getAppVersion(),
    buildNumber: getBuildNumber(),
    expoSdkVersion: Constants.expoConfig?.sdkVersion,
    executionEnvironment: Constants.executionEnvironment,
  });
  Sentry.setContext("device", {
    brand: Device.brand,
    deviceName: Device.deviceName,
    deviceType: Device.deviceType,
    isDevice: Device.isDevice,
    manufacturer: Device.manufacturer,
    modelName: Device.modelName,
    osName: Device.osName,
    osVersion: Device.osVersion,
  });
  Sentry.addBreadcrumb({
    category: "app.lifecycle",
    level: "info",
    message: "Observability initialized",
  });

  isMonitoringInitialized = true;
}

export function addMonitoringBreadcrumb(
  message: string,
  data?: Record<string, unknown>,
) {
  Sentry.addBreadcrumb({
    category: "edstream.user_action",
    data,
    level: "info",
    message,
  });
}

export function setLearningContext(context: Record<string, unknown>) {
  Sentry.setContext("learning_session", {
    cohort: "assignment-demo",
    contentSource: "mock-api",
    ...context,
  });
}

export function setFeatureTags(
  tags: Record<string, string | number | boolean>,
) {
  Sentry.setTags(tags);
}

export function identifyDemoLearner() {
  Sentry.setUser(dummyLearner);
  Sentry.setContext("learner_profile", {
    activePlan: "Premium Demo",
    completedLessons: 42,
    preferredLanguage: "English",
    streakDays: 7,
  });
}

export function captureHandledException(
  error: Error,
  context: {
    feature: string;
    flow: string;
    metadata?: Record<string, unknown>;
  },
) {
  Sentry.withScope((scope) => {
    scope.setTag("feature", context.feature);
    scope.setTag("flow", context.flow);
    scope.setLevel("error");
    scope.setContext("handled_exception", {
      expected: true,
      ...context.metadata,
    });
    Sentry.captureException(error);
  });
}

export function captureDemoMessage(message: string) {
  Sentry.captureMessage(message, {
    level: "info",
    tags: {
      feature: "profile",
      source: "manual-verification",
    },
  });
}

export function captureFatalNativeCrash() {
  Sentry.addBreadcrumb({
    category: "edstream.crash_test",
    level: "fatal",
    message: "User triggered native crash test",
  });
  Sentry.nativeCrash();
}

export { Sentry };
