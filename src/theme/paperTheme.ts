import {
  MD3DarkTheme,
  MD3LightTheme,
  configureFonts,
} from 'react-native-paper';

import { colors } from '@/theme/tokens';

export const paperDarkTheme = {
  ...MD3DarkTheme,
  roundness: 8,
  fonts: configureFonts({ config: MD3DarkTheme.fonts }),
  colors: {
    ...MD3DarkTheme.colors,
    primary: colors.dark.primary,
    secondary: colors.dark.secondary,
    background: colors.dark.background,
    surface: colors.dark.surface,
    surfaceVariant: colors.dark.surfaceVariant,
    outline: colors.dark.border,
    error: colors.dark.danger,
    onSurface: colors.dark.text,
    onBackground: colors.dark.text,
  },
};

export const paperLightTheme = {
  ...MD3LightTheme,
  roundness: 8,
  fonts: configureFonts({ config: MD3LightTheme.fonts }),
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.light.primary,
    secondary: colors.light.secondary,
    background: colors.light.background,
    surface: colors.light.surface,
    surfaceVariant: colors.light.surfaceVariant,
    outline: colors.light.border,
    error: colors.light.danger,
    onSurface: colors.light.text,
    onBackground: colors.light.text,
  },
};
