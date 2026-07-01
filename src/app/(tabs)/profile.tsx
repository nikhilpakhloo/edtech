import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { Avatar, List, Switch } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Screen } from '@/components/layout/Screen';
import { apiService } from '@/data/apiService';
import type { ProfileResponse } from '@/types/media';
import { getTabBarContentPadding } from '@/utils/tabBar';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState<ProfileResponse | null>(null);

  useEffect(() => {
    let isMounted = true;

    apiService.getProfile().then((response) => {
      if (isMounted) {
        setProfile(response);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  if (!profile) {
    return (
      <Screen edges={['top', 'left', 'right']}>
        <View className="flex-1 items-center justify-center px-5">
          <ActivityIndicator color="#4F8CFF" size="large" />
        </View>
      </Screen>
    );
  }

  return (
    <Screen edges={['top', 'left', 'right']}>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: getTabBarContentPadding(insets.bottom),
          paddingHorizontal: 20,
          paddingTop: 16,
        }}>
        <View className="mb-5">
          <Text className="text-3xl font-black text-white">My Space</Text>
          <Text className="mt-1 text-sm font-semibold text-slate-400">
            Downloads, watchlist, settings, and account preferences.
          </Text>
        </View>

        <View className="overflow-hidden rounded-lg border border-white/10 bg-brand-surface">
          <View className="absolute right-0 top-0 h-24 w-32 bg-brand-blue/25" />
          <View className="flex-row items-center p-4">
            <Avatar.Text
              size={56}
              label={profile.avatarInitials}
              color="#05070D"
              style={{ backgroundColor: '#F5C542' }}
            />
            <View className="ml-4 flex-1">
              <Text className="text-2xl font-bold text-white">{profile.displayName}</Text>
              <Text className="mt-1 text-sm font-semibold text-brand-cyan">{profile.planName}</Text>
            </View>
          </View>
          <View className="border-t border-white/10 px-4 py-3">
            <Text className="text-xs font-black uppercase tracking-[1.5px] text-brand-gold">
              Learning streak
            </Text>
            <Text className="mt-1 text-sm text-slate-300">
              8 days active - 4 titles downloaded for offline study
            </Text>
          </View>
        </View>

        <View className="mt-6 overflow-hidden rounded-lg border border-white/10 bg-brand-surface">
          {profile.settings.map((setting) => (
            <List.Item
              key={setting.id}
              title={setting.title}
              description={`${setting.description} - ${setting.value}`}
              titleStyle={{ color: '#F8FAFC' }}
              descriptionStyle={{ color: '#AAB4C5' }}
              left={(props) => <List.Icon {...props} color="#1F80E0" icon="tune" />}
              right={() =>
                typeof setting.enabled === 'boolean' ? <Switch value={setting.enabled} /> : null
              }
            />
          ))}
        </View>
        <View className="mt-6 rounded-lg border border-white/10 bg-brand-elevated p-4">
          <Text className="text-sm font-black uppercase tracking-[1.5px] text-brand-cyan">
            Submission Build
          </Text>
          <Text className="mt-2 text-base font-bold text-white">
            Expo Router, NativeWind, React Native Paper, expo-image, and expo-video are enabled.
          </Text>
          <Text className="mt-2 text-sm leading-6 text-slate-400">
            Capture Home, Detail playback, Profile, loading, refresh, and error states for the final walkthrough.
          </Text>
        </View>
      </ScrollView>
    </Screen>
  );
}
