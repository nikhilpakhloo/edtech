import type { PropsWithChildren } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '@/theme/AppTheme';

type ScreenProps = PropsWithChildren<{
  edges?: ('top' | 'right' | 'bottom' | 'left')[];
}>;

export function Screen({ children, edges = ['top', 'left', 'right'] }: ScreenProps) {
  const { colors } = useAppTheme();

  return (
    <SafeAreaView edges={edges} className="flex-1" style={{ backgroundColor: colors.background }}>
      <View className="flex-1">{children}</View>
    </SafeAreaView>
  );
}
