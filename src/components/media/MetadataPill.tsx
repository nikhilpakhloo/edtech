import { memo } from 'react';
import { Text, View } from 'react-native';

type MetadataPillProps = {
  label: string;
};

function MetadataPillBase({ label }: MetadataPillProps) {
  return (
    <View className="mr-2 rounded-full border border-brand-line bg-brand-elevated px-3 py-1">
      <Text className="text-xs font-semibold text-slate-200">{label}</Text>
    </View>
  );
}

export const MetadataPill = memo(MetadataPillBase);
