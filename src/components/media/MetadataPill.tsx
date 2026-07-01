import { memo } from 'react';
import { Text, View } from 'react-native';

import { useAppTheme } from '@/theme/AppTheme';

type MetadataPillProps = {
  label: string;
};

function MetadataPillBase({ label }: MetadataPillProps) {
  const { colors, isDark } = useAppTheme();

  return (
    <View
      className="mb-2 mr-2 rounded-full border px-3 py-1"
      style={{
        backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(31,128,224,0.08)',
        borderColor: isDark ? 'rgba(255,255,255,0.1)' : colors.border,
      }}>
      <Text className="text-xs font-bold" style={{ color: colors.text }}>
        {label}
      </Text>
    </View>
  );
}

export const MetadataPill = memo(MetadataPillBase);
