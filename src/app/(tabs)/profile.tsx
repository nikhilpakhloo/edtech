import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { Avatar, List, Switch } from 'react-native-paper';

import { Screen } from '@/components/layout/Screen';
import { apiService } from '@/data/apiService';
import type { ProfileResponse } from '@/types/media';

export default function ProfileScreen() {
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
      <View className="flex-1 px-5 pt-4">
        <View className="flex-row items-center rounded-lg bg-brand-surface p-4">
          <Avatar.Text
            size={56}
            label={profile.avatarInitials}
            color="#05070D"
            style={{ backgroundColor: '#F8FAFC' }}
          />
          <View className="ml-4 flex-1">
            <Text className="text-2xl font-bold text-white">{profile.displayName}</Text>
            <Text className="mt-1 text-sm font-semibold text-brand-green">{profile.planName}</Text>
          </View>
        </View>

        <View className="mt-6 overflow-hidden rounded-lg bg-brand-surface">
          {profile.settings.map((setting) => (
            <List.Item
              key={setting.id}
              title={setting.title}
              description={`${setting.description} - ${setting.value}`}
              titleStyle={{ color: '#F8FAFC' }}
              descriptionStyle={{ color: '#AAB4C5' }}
              right={() =>
                typeof setting.enabled === 'boolean' ? <Switch value={setting.enabled} /> : null
              }
            />
          ))}
        </View>
      </View>
    </Screen>
  );
}
