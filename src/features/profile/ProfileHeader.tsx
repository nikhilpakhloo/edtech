import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { Avatar } from "react-native-paper";

import { APP_STRINGS } from "@/constants/string";
import { useAppTheme } from "@/theme/AppTheme";
import type { ProfileResponse } from "@/types/media";
import { selectionHaptic } from "@/utils/haptics";

interface ProfileHeaderProps {
  profile: ProfileResponse;
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  const { colors, isDark } = useAppTheme();

  return (
    <View
      className="rounded-lg border p-4"
      style={{
        backgroundColor: colors.surface,
        borderColor: isDark ? "rgba(255,255,255,0.1)" : colors.border,
      }}
    >
      <View className="flex-row items-center">
        <Avatar.Text
          size={54}
          label={profile.avatarInitials}
          color="#FFFFFF"
          labelStyle={{ fontWeight: "900" }}
          style={{ backgroundColor: colors.primary }}
        />
        <View className="ml-4 flex-1">
          <Text className="text-xl font-black" style={{ color: colors.text }}>
            {profile.displayName}
          </Text>
          <View
            className="mt-2 self-start rounded-full px-3 py-1"
            style={{
              backgroundColor: isDark
                ? "rgba(255,255,255,0.08)"
                : colors.elevated,
            }}
          >
            <Text className="text-xs font-black" style={{ color: colors.primary }}>
              {profile.planName}
            </Text>
          </View>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={APP_STRINGS.accessibility.editProfile}
          className="h-10 w-10 items-center justify-center rounded-full"
          style={{ backgroundColor: colors.elevated }}
          onPress={selectionHaptic}
        >
          <Ionicons name="create-outline" color={colors.text} size={20} />
        </Pressable>
      </View>
    </View>
  );
}
