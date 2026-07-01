import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Avatar, Switch } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Screen } from '@/components/layout/Screen';
import { apiService } from '@/data/apiService';
import type { ProfileResponse } from '@/types/media';
import { getTabBarContentPadding } from '@/utils/tabBar';

const learnerStats = [
  { label: 'Streak', value: '8', suffix: 'days' },
  { label: 'Saved', value: '4', suffix: 'offline' },
  { label: 'Progress', value: '68', suffix: '%' },
];

const quickActions: {
  id: string;
  label: string;
  caption: string;
  icon: keyof typeof Ionicons.glyphMap;
  colors: [string, string];
}[] = [
  {
    id: 'downloads',
    label: 'Downloads',
    caption: 'Ready offline',
    icon: 'download-outline',
    colors: ['#1F80E0', '#00C2FF'],
  },
  {
    id: 'watchlist',
    label: 'Watchlist',
    caption: 'Saved lessons',
    icon: 'bookmark-outline',
    colors: ['#F5C542', '#F97316'],
  },
  {
    id: 'certificates',
    label: 'Certificates',
    caption: 'Achievements',
    icon: 'ribbon-outline',
    colors: ['#22C55E', '#14B8A6'],
  },
];

const settingIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
  autoplay: 'play-circle-outline',
  quality: 'wifi-outline',
  downloads: 'cloud-download-outline',
  language: 'language-outline',
};

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
        className="flex-1 bg-brand-ink"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: getTabBarContentPadding(insets.bottom),
          paddingHorizontal: 20,
          paddingTop: 18,
        }}>
        <View className="mb-5">
          <Text className="text-[13px] font-black uppercase tracking-[2px] text-brand-cyan">
            Your learning hub
          </Text>
          <Text className="mt-1 text-3xl font-black text-white">My Space</Text>
          <Text className="mt-2 text-sm leading-5 text-slate-400">
            Track progress, manage downloads, and tune your EdStream experience.
          </Text>
        </View>

        <LinearGradient
          colors={['#15284F', '#0B1222', '#111827']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}>
          <View className="absolute right-[-30px] top-[-34px] h-36 w-36 rounded-full bg-brand-blue/30" />
          <View className="absolute bottom-[-48px] left-[-42px] h-40 w-40 rounded-full bg-brand-cyan/10" />
          <View className="flex-row items-center">
            <Avatar.Text
              size={62}
              label={profile.avatarInitials}
              color="#05070D"
              labelStyle={{ fontWeight: '900' }}
              style={styles.avatar}
            />
            <View className="ml-4 flex-1">
              <Text className="text-2xl font-black text-white">{profile.displayName}</Text>
              <View className="mt-2 self-start rounded-full bg-white/10 px-3 py-1">
                <Text className="text-xs font-black text-brand-gold">{profile.planName}</Text>
              </View>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Edit profile"
              className="h-10 w-10 items-center justify-center rounded-full bg-white/10">
              <Ionicons name="create-outline" color="#FFFFFF" size={20} />
            </Pressable>
          </View>

          <View className="mt-5 flex-row rounded-lg border border-white/10 bg-black/20">
            {learnerStats.map((stat, index) => (
              <View
                key={stat.label}
                className={`flex-1 px-3 py-3 ${index > 0 ? 'border-l border-white/10' : ''}`}>
                <Text className="text-[11px] font-bold uppercase tracking-[1px] text-slate-400">
                  {stat.label}
                </Text>
                <View className="mt-1 flex-row items-end">
                  <Text className="text-2xl font-black text-white">{stat.value}</Text>
                  <Text className="mb-1 ml-1 text-xs font-bold text-brand-cyan">{stat.suffix}</Text>
                </View>
              </View>
            ))}
          </View>
        </LinearGradient>

        <View className="mt-6 flex-row gap-3">
          {quickActions.map((action) => (
            <Pressable
              key={action.id}
              accessibilityRole="button"
              accessibilityLabel={action.label}
              className="flex-1 overflow-hidden rounded-lg">
              <LinearGradient colors={action.colors} style={styles.quickAction}>
                <View className="h-10 w-10 items-center justify-center rounded-full bg-white/20">
                  <Ionicons name={action.icon} color="#FFFFFF" size={22} />
                </View>
                <Text numberOfLines={1} className="mt-3 text-sm font-black text-white">
                  {action.label}
                </Text>
                <Text numberOfLines={1} className="mt-1 text-[11px] font-semibold text-white/80">
                  {action.caption}
                </Text>
              </LinearGradient>
            </Pressable>
          ))}
        </View>

        <View className="mt-7">
          <Text className="text-xl font-black text-white">Preferences</Text>
          <Text className="mt-1 text-sm text-slate-400">
            Personalize playback, language, and downloads.
          </Text>
        </View>

        <View className="mt-4 overflow-hidden rounded-lg border border-white/10 bg-brand-surface">
          {profile.settings.map((setting) => (
            <View
              key={setting.id}
              className="flex-row items-center border-b border-white/10 px-4 py-4 last:border-b-0">
              <View className="h-11 w-11 items-center justify-center rounded-full bg-brand-blue/15">
                <Ionicons
                  name={settingIcons[setting.id] ?? 'settings-outline'}
                  color="#4F8CFF"
                  size={22}
                />
              </View>
              <View className="ml-3 flex-1">
                <View className="flex-row items-center">
                  <Text className="flex-1 text-base font-bold text-white">{setting.title}</Text>
                  {typeof setting.enabled !== 'boolean' ? (
                    <Text className="ml-2 text-sm font-black text-brand-cyan">{setting.value}</Text>
                  ) : null}
                </View>
                <Text className="mt-1 text-sm leading-5 text-slate-400">{setting.description}</Text>
              </View>
              {typeof setting.enabled === 'boolean' ? (
                <Switch color="#1F80E0" value={setting.enabled} />
              ) : null}
            </View>
          ))}
        </View>

        <View className="mt-6 rounded-lg border border-white/10 bg-brand-elevated p-4">
          <View className="flex-row items-center">
            <View className="h-11 w-11 items-center justify-center rounded-full bg-brand-gold/15">
              <Ionicons name="flame-outline" color="#F5C542" size={23} />
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-base font-black text-white">Keep your streak alive</Text>
              <Text className="mt-1 text-sm leading-5 text-slate-400">
                Finish one lesson today to unlock your next weekly milestone.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: '#F5C542',
    borderColor: 'rgba(255,255,255,0.28)',
    borderWidth: 2,
  },
  heroCard: {
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
    padding: 16,
  },
  quickAction: {
    borderRadius: 8,
    minHeight: 122,
    padding: 12,
  },
});
