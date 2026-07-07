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
let activeClaritySessionId: string | null = null;

function isClarityReady() {
  return CLARITY_ENABLED && Boolean(CLARITY_PROJECT_ID);
}

function toClarityValue(value: unknown) {
  if (Array.isArray(value)) {
    return value.map(String).filter(Boolean).slice(0, 10);
  }

  if (value === null || typeof value === "undefined") {
    return undefined;
  }

  return String(value).trim().slice(0, 255);
}

function setClarityTag(key: string, value: unknown) {
  if (!isClarityReady()) {
    return;
  }

  const clarityValue = toClarityValue(value);

  if (!clarityValue) {
    return;
  }

  if (Array.isArray(clarityValue)) {
    if (clarityValue.length) {
      void Clarity.setCustomTags(key, clarityValue).catch(() => undefined);
    }

    return;
  }

  void Clarity.setCustomTag(key, clarityValue).catch(() => undefined);
}

function setClarityTags(tags: Record<string, unknown>) {
  Object.entries(tags).forEach(([key, value]) => {
    setClarityTag(key, value);
  });
}

async function syncClaritySession(sessionId: string) {
  try {
    activeClaritySessionId = sessionId;
    await Promise.all([
      Clarity.setCustomUserId(dummyLearner.id),
      Clarity.setCustomSessionId(`edstream-${APP_ENV}-${sessionId}`),
      Clarity.consent(true, true),
    ]);
    setClarityTags({
      app: "edstream",
      environment: APP_ENV,
      learner_id: dummyLearner.id,
      plan: "premium-demo",
    });
    void Clarity.sendCustomEvent("clarity_session_started").catch(
      () => undefined,
    );

    const sessionUrl = await Clarity.getCurrentSessionUrl();
    Sentry.setContext("clarity", {
      sessionId,
      sessionUrl,
    });
    Sentry.setTag("clarity_session_id", sessionId);
  } catch (error) {
    Sentry.captureException(error, {
      tags: {
        feature: "clarity",
        flow: "session-sync",
      },
    });
  }
}

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

  if (isClarityReady()) {
    Clarity.initialize(CLARITY_PROJECT_ID!, {
      logLevel: __DEV__ ? Clarity.LogLevel.Verbose : Clarity.LogLevel.None,
    });
    Clarity.setOnSessionStartedCallback((sessionId) => {
      void syncClaritySession(String(sessionId));
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

export function trackScreenView(
  screenName: string,
  metadata: Record<string, unknown> = {},
) {
  Sentry.addBreadcrumb({
    category: "navigation",
    data: metadata,
    level: "info",
    message: `Viewed ${screenName}`,
  });
  Sentry.setContext("current_screen", {
    name: screenName,
    ...metadata,
  });

  if (!isClarityReady()) {
    return;
  }

  void Clarity.setCurrentScreenName(screenName).catch(() => undefined);
  setClarityTags({
    screen: screenName,
    ...metadata,
  });
  void Clarity.sendCustomEvent(`screen_view:${screenName}`).catch(
    () => undefined,
  );
}

export function trackClarityEvent(
  eventName: string,
  tags: Record<string, unknown> = {},
) {
  setClarityTags(tags);

  if (isClarityReady()) {
    void Clarity.sendCustomEvent(eventName).catch(() => undefined);
  }

  Sentry.addBreadcrumb({
    category: "clarity.custom_event",
    data: {
      activeClaritySessionId,
      ...tags,
    },
    level: "info",
    message: eventName,
  });
}

export function startFreshClaritySession(reason: string) {
  if (!isClarityReady()) {
    return;
  }

  Clarity.startNewSession((sessionId) => {
    void syncClaritySession(String(sessionId));
    void Clarity.sendCustomEvent("manual_session_refresh").catch(
      () => undefined,
    );
    setClarityTags({ session_refresh_reason: reason });
  });
}

export function addMonitoringBreadcrumb(
  message: string,
  data?: Record<string, unknown>,
) {
  trackClarityEvent("monitoring_breadcrumb", {
    breadcrumb_message: message,
    ...data,
  });
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
  setClarityTags({
    cohort: "assignment-demo",
    content_source: "mock-api",
    ...context,
  });
}

export function setFeatureTags(
  tags: Record<string, string | number | boolean>,
) {
  Sentry.setTags(tags);
  setClarityTags(tags);
}

export function identifyDemoLearner() {
  Sentry.setUser(dummyLearner);
  Sentry.setContext("learner_profile", {
    activePlan: "Premium Demo",
    completedLessons: 42,
    preferredLanguage: "English",
    streakDays: 7,
  });
  if (isClarityReady()) {
    void Clarity.setCustomUserId(dummyLearner.id).catch(() => undefined);
  }
  setClarityTags({
    learner_id: dummyLearner.id,
    learner_plan: "premium-demo",
    preferred_language: "English",
    streak_days: 7,
  });
  trackClarityEvent("learner_identified");
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
    trackClarityEvent("handled_exception", {
      feature: context.feature,
      flow: context.flow,
      ...context.metadata,
    });
    Sentry.captureException(error);
  });
}

export function captureDemoMessage(message: string) {
  trackClarityEvent("demo_message_captured", {
    message,
  });
  Sentry.captureMessage(message, {
    level: "info",
    tags: {
      feature: "profile",
      source: "manual-verification",
    },
  });
}

export function captureFatalNativeCrash() {
  trackClarityEvent("native_crash_requested", {
    crash_type: "native",
    intentional: true,
  });
  Sentry.addBreadcrumb({
    category: "edstream.crash_test",
    level: "fatal",
    message: "User triggered native crash test",
  });
  Sentry.nativeCrash();
}

export { Sentry };
