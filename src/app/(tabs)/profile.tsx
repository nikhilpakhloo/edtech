import { Text, View } from 'react-native';
import { List, Switch } from 'react-native-paper';

import { Screen } from '@/components/layout/Screen';

export default function ProfileScreen() {
  return (
    <Screen edges={['top', 'left', 'right']}>
      <View className="flex-1 px-5 pt-4">
        <Text className="text-3xl font-bold text-white">Profile</Text>
        <Text className="mt-2 text-base text-slate-300">
          Settings shell for playback, preferences, and theme controls.
        </Text>

        <View className="mt-6 overflow-hidden rounded-lg bg-brand-surface">
          <List.Item
            title="Autoplay previews"
            description="Prepared for Phase 4 polish"
            titleStyle={{ color: '#F8FAFC' }}
            descriptionStyle={{ color: '#AAB4C5' }}
            right={() => <Switch value />}
          />
          <List.Item
            title="Streaming quality"
            description="High"
            titleStyle={{ color: '#F8FAFC' }}
            descriptionStyle={{ color: '#AAB4C5' }}
          />
        </View>
      </View>
    </Screen>
  );
}
