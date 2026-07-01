import '../../global.css';

import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AppProviders } from '@/app/AppProviders';

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    void SplashScreen.hideAsync();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppProviders>
        <Stack
          screenOptions={{
            animation: 'fade',
            contentStyle: { backgroundColor: '#05070D' },
            headerShown: false,
          }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="detail/[mediaId]" />
        </Stack>
        <StatusBar style="light" />
      </AppProviders>
    </GestureHandlerRootView>
  );
}
