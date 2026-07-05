import { memo } from 'react';
import { Text, View } from 'react-native';
import { Button } from 'react-native-paper';

import { APP_STRINGS } from '@/constants/string';
import { useAppTheme } from '@/theme/AppTheme';
import { selectionHaptic } from '@/utils/haptics';

type ErrorStateProps = {
  title: string;
  message: string;
  actionLabel?: string;
  onRetry?: () => void;
};

function ErrorStateBase({
  title,
  message,
  actionLabel = APP_STRINGS.common.tryAgain,
  onRetry,
}: ErrorStateProps) {
  const { colors } = useAppTheme();

  return (
    <View className="flex-1 items-center justify-center px-6">
      <View className="h-14 w-14 items-center justify-center rounded-full bg-brand-red/15">
        <Text className="text-2xl font-black text-brand-red">!</Text>
      </View>
      <Text className="mt-5 text-center text-2xl font-black" style={{ color: colors.text }}>
        {title}
      </Text>
      <Text className="mt-2 text-center text-base leading-6" style={{ color: colors.textMuted }}>
        {message}
      </Text>
      {onRetry ? (
        <Button
          mode="contained"
          buttonColor={colors.primary}
          className="mt-6"
          onPress={() => {
            selectionHaptic();
            onRetry();
          }}>
          {actionLabel}
        </Button>
      ) : null}
    </View>
  );
}

export const ErrorState = memo(ErrorStateBase);
