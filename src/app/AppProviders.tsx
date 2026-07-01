import type { PropsWithChildren } from 'react';
import { useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { paperDarkTheme, paperLightTheme } from '@/theme/paperTheme';

export function AppProviders({ children }: PropsWithChildren) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme !== 'light';

  const paperTheme = useMemo(
    () => (isDark ? paperDarkTheme : paperLightTheme),
    [isDark],
  );

  return (
    <SafeAreaProvider>
      <PaperProvider theme={paperTheme}>{children}</PaperProvider>
    </SafeAreaProvider>
  );
}
