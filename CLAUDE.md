@AGENTS.md

# EdStream Implementation Tasks

## Required Project Rule

Before writing implementation code, read the exact Expo SDK 57 docs:

- https://docs.expo.dev/versions/v57.0.0/
- https://docs.expo.dev/versions/v57.0.0/sdk/notifications/

## 2. Add Sentry With Demo Crash Reflected In Dashboard

### What It Is

Sentry is an error monitoring and performance observability tool. In this Android app it should capture JavaScript errors, Android native crashes where supported, breadcrumbs, releases, and readable stack traces through uploaded source maps/debug symbols.

### Scalable Implementation Plan

1. Install Sentry:
   - `npx @sentry/wizard@latest -i reactNative`, or manually install `@sentry/react-native`.
2. Add Sentry Expo config plugin in `app.json`.
3. Update `metro.config.js` using Sentry's Expo Metro helper.
4. Initialize Sentry as early as possible in the app root, most likely `src/app/_layout.tsx` if present.
5. Store values safely:
   - DSN can be public runtime config.
   - auth token must be CI/local secret only and must not be committed.
6. Add environment-aware sampling:
   - development/staging: high sample rates for verification.
   - production: lower tracing/replay rates.
7. Add a temporary demo crash/debug button behind a development-only flag.
8. Verify the event appears in the Sentry dashboard.
9. Remove or hide the demo crash from production UI.

### Acceptance Criteria

- Sentry is initialized once at app startup.
- A demo error appears in the Sentry dashboard.
- Source maps/debug symbols are configured for production builds.
- Secrets are not committed.
- Production sampling is controlled by config.
- Any native Sentry setup is handled by Sentry's Expo/config-plugin workflow, not by manual generated-file edits only.

## 5. Microsoft Clarity Integration

### What It Is

Microsoft Clarity is analytics/session insight tooling. It helps understand user behavior with session recordings, heatmaps, rage taps/clicks, navigation paths, and product usage signals.

### Important Product Notes

Confirm the current official Microsoft Clarity React Native/Expo Android support before implementation. If using Clarity's web script, it only applies to the web build. For Android native, use the official mobile/React Native SDK if it supports the current Expo SDK 57 workflow, or add Android native configuration through a config plugin/development build.

If Clarity requires native setup that is not covered by its package, write a local Expo config plugin instead of manually editing generated native files.

### Scalable Implementation Plan

1. Create an analytics abstraction:
   - `src/services/analytics/analytics.types.ts`
   - `src/services/analytics/analytics.service.ts`
   - `src/services/analytics/providers/clarity.provider.ts`
2. Do not call Clarity directly from screens.
3. Track stable product events:
   - app opened
   - course viewed
   - course bookmarked
   - lesson started
   - lesson completed
   - notification snoozed
4. Add privacy controls:
   - analytics enabled flag
   - user consent where legally required
   - no passwords, tokens, payment data, or sensitive learning notes
5. Use environment config:
   - dev project ID
   - staging project ID
   - production project ID
6. Verify dashboard sessions/events after a real development or release build.

### Acceptance Criteria

- Clarity initializes only after consent/config is available.
- Events are routed through a provider abstraction.
- Sensitive data is masked or never sent.
- Android native and web support are documented separately.
- Dashboard shows a test session/event.
- Required native configuration survives `npx expo prebuild --clean`.

## Phased Delivery Plan

### Phase 3: Sentry Error Monitoring

Goal: add Android-ready crash/error monitoring and verify a demo event in the dashboard.

Tasks:

1. Install Sentry using the React Native/Expo workflow.
2. Add Sentry Expo config plugin in `app.json`.
3. Update `metro.config.js` with Sentry's Expo Metro helper.
4. Initialize Sentry once at app startup.
5. Configure environment-aware sampling.
6. Keep the DSN in public runtime config and auth token in local/CI secrets only.
7. Add a development-only demo crash/error trigger.
8. Build/run Android development build and verify the error appears in Sentry.

Exit criteria:

- Sentry captures a demo JavaScript error in the dashboard.
- Android native crash/debug symbol setup is documented or configured.
- Source map upload path is ready for production builds.
- Demo crash UI is development-only.
- Native setup is config-plugin based, not manual generated-file edits only.

### Phase 4: Microsoft Clarity Analytics

Goal: add Android session/product analytics behind a scalable provider abstraction.

Tasks:

1. Confirm current official Microsoft Clarity Android React Native/Expo support.
2. Install the supported Clarity package or document the required native/config plugin path.
3. Create analytics abstraction:
   - `src/services/analytics/analytics.types.ts`
   - `src/services/analytics/analytics.service.ts`
   - `src/services/analytics/providers/clarity.provider.ts`
4. Initialize Clarity only when config and consent are available.
5. Track stable product events:
   - app opened
   - course viewed
   - course bookmarked
   - lesson started
   - lesson completed
   - notification snoozed
6. Mask or avoid sensitive data.
7. Verify an Android development/release build appears in the Clarity dashboard.

Exit criteria:

- Clarity initializes through an analytics provider, not directly from screens.
- Dashboard shows a test Android session/event.
- Sensitive data is not sent.
- Required Android native configuration survives clean prebuild.

## Cross-Cutting Architecture

### Feature Modules

Keep UI, domain logic, storage, and native/vendor calls separated:

- UI screens/components collect user intent.
- Feature services own business rules.
- Storage modules persist preferences and milestone state.
- Provider modules call native SDKs or third-party SDKs.

### Config And Secrets

- Public runtime IDs can live in Expo config.
- Secret tokens must live in local environment variables or CI secrets.
- Never commit Sentry auth tokens, Clarity secrets, or vendor credentials.

### Testing Strategy

- Unit test pure logic:
  - bookmark milestone detection
  - snooze date calculation
  - notification eligibility checks
- Integration/manual test device behavior:
  - local notification display
  - notification tap deep link
  - Sentry dashboard event
  - Clarity dashboard session
  - dynamic app icon selection

### Build Notes

These tasks need Android development/release builds for full validation:

- Push notifications on Android.
- Sentry Android native crash/debug symbol validation.
- Microsoft Clarity Android native SDK validation.
- Dynamic Android app icon native behavior.

Expo Go is not enough for the full set of tasks.

Before marking native work complete, run or review a clean prebuild path and confirm the required native config is reproduced from config/plugins rather than being hand-maintained only in generated folders.
