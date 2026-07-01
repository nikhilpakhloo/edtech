import * as SystemUI from 'expo-system-ui';
import type { PropsWithChildren } from 'react';
import { createContext, useContext, useEffect, useMemo } from 'react';
import { useColorScheme } from 'react-native';

import { colors } from '@/theme/tokens';

type ThemeMode = 'dark' | 'light';

type AppThemeValue = {
  colors: (typeof colors)[ThemeMode];
  isDark: boolean;
  mode: ThemeMode;
};

const AppThemeContext = createContext<AppThemeValue>({
  colors: colors.dark,
  isDark: true,
  mode: 'dark',
});

export function AppThemeProvider({ children }: PropsWithChildren) {
  const colorScheme = useColorScheme();
  const mode: ThemeMode = colorScheme === 'light' ? 'light' : 'dark';
  const value = useMemo<AppThemeValue>(
    () => ({
      colors: colors[mode],
      isDark: mode === 'dark',
      mode,
    }),
    [mode],
  );

  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(value.colors.background);
  }, [value.colors.background]);

  return <AppThemeContext.Provider value={value}>{children}</AppThemeContext.Provider>;
}

export function useAppTheme() {
  return useContext(AppThemeContext);
}
