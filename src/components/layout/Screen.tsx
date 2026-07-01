import type { PropsWithChildren } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type ScreenProps = PropsWithChildren<{
  edges?: ('top' | 'right' | 'bottom' | 'left')[];
}>;

export function Screen({ children, edges = ['top', 'left', 'right'] }: ScreenProps) {
  return (
    <SafeAreaView edges={edges} className="flex-1 bg-brand-ink">
      <View className="flex-1">{children}</View>
    </SafeAreaView>
  );
}
