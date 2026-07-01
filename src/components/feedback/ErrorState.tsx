import { memo } from 'react';
import { Text, View } from 'react-native';
import { Button } from 'react-native-paper';

type ErrorStateProps = {
  title: string;
  message: string;
  actionLabel?: string;
  onRetry?: () => void;
};

function ErrorStateBase({
  title,
  message,
  actionLabel = 'Try Again',
  onRetry,
}: ErrorStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-6">
      <View className="h-14 w-14 items-center justify-center rounded-full bg-brand-red/15">
        <Text className="text-2xl font-black text-brand-red">!</Text>
      </View>
      <Text className="mt-5 text-center text-2xl font-black text-white">{title}</Text>
      <Text className="mt-2 text-center text-base leading-6 text-slate-400">{message}</Text>
      {onRetry ? (
        <Button mode="contained" buttonColor="#4F8CFF" className="mt-6" onPress={onRetry}>
          {actionLabel}
        </Button>
      ) : null}
    </View>
  );
}

export const ErrorState = memo(ErrorStateBase);
