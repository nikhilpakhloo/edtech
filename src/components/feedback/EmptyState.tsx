import { memo } from 'react';
import { Text, View } from 'react-native';

import { useAppTheme } from '@/theme/AppTheme';

type EmptyStateProps = {
  title: string;
  message: string;
};

function EmptyStateBase({ title, message }: EmptyStateProps) {
  const { colors, isDark } = useAppTheme();

  return (
    <View
      className="mx-5 rounded-lg border p-5"
      style={{
        backgroundColor: colors.surface,
        borderColor: isDark ? 'rgba(255,255,255,0.1)' : colors.border,
      }}>
      <Text className="text-lg font-black" style={{ color: colors.text }}>
        {title}
      </Text>
      <Text className="mt-2 text-sm leading-6" style={{ color: colors.textMuted }}>
        {message}
      </Text>
    </View>
  );
}

export const EmptyState = memo(EmptyStateBase);
