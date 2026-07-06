# Android Config Plugins

Local Expo config plugins for Android-only native changes live here.

This project uses Expo development builds with Continuous Native Generation. Any Android native configuration that must survive `npx expo prebuild --clean --platform android` should be implemented from Expo config or a config plugin instead of relying only on manual edits inside `android/`.

## Rules

- Keep plugin code deterministic and idempotent.
- Read configuration from `app.json`, `app.config.js`, or explicit plugin options.
- Do not store secrets in plugin files.
- Use direct `android/` edits only for temporary debugging or proof-of-concept work.
- After adding a plugin, verify that a clean Android prebuild regenerates the expected native config.

## Planned Plugins

- Dynamic Android launcher icon aliases.
- Microsoft Clarity Android native setup, only if the official package does not provide a compatible config plugin.
- Any other Android native setup that is not covered by an official Expo/library plugin.
