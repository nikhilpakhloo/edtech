import { memo } from 'react';
import { Text, View } from 'react-native';

type MetadataPillProps = {
  label: string;
};

function MetadataPillBase({ label }: MetadataPillProps) {
  return (
    <View className="mb-2 mr-2 rounded-full border border-white/10 bg-white/10 px-3 py-1">
      <Text className="text-xs font-bold text-slate-100">{label}</Text>
    </View>
  );
}

export const MetadataPill = memo(MetadataPillBase);
