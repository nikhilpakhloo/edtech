import { memo } from 'react';
import { Text, View } from 'react-native';

type EmptyStateProps = {
  title: string;
  message: string;
};

function EmptyStateBase({ title, message }: EmptyStateProps) {
  return (
    <View className="mx-5 rounded-lg border border-brand-line bg-brand-surface p-5">
      <Text className="text-lg font-black text-white">{title}</Text>
      <Text className="mt-2 text-sm leading-6 text-slate-400">{message}</Text>
    </View>
  );
}

export const EmptyState = memo(EmptyStateBase);
