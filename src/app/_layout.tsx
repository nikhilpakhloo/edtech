import '../../global.css';

import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppThemeProvider } from '@/theme/AppTheme';
import { paperDarkTheme, paperLightTheme } from '@/theme/paperTheme';
import { colors } from '@/theme/tokens';

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme !== 'light';
  const paperTheme = useMemo(
    () => (isDark ? paperDarkTheme : paperLightTheme),
    [isDark],
  );
  const appColors = isDark ? colors.dark : colors.light;

  useEffect(() => {
    void SplashScreen.hideAsync();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PaperProvider theme={paperTheme}>
          <AppThemeProvider>
            <Stack
              screenOptions={{
                animation: 'fade',
                contentStyle: { backgroundColor: appColors.background },
                headerShown: false,
              }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="detail/[mediaId]" />
            </Stack>
            <StatusBar style={isDark ? 'light' : 'dark'} />
          </AppThemeProvider>
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
