import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { HomeModeId, HomeModeOption } from "@/types/media";
import { selectionHaptic } from "@/utils/haptics";

type HomeModeButtonsProps = {
  activeMode: HomeModeId;
  modes: HomeModeOption[];
  onSelectMode: (mode: HomeModeId) => void;
};

function HomeModeButtonsBase({
  activeMode,
  modes,
  onSelectMode,
}: HomeModeButtonsProps) {
  return (
    <View className="mb-5 flex-row gap-3">
      {modes.map((option) => {
        const isActive = option.id === activeMode;

        return (
          <Pressable
            key={option.id}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            className="flex-1 overflow-hidden rounded-full"
            style={isActive ? styles.modeButtonActive : styles.modeButtonIdle}
            onPress={() => {
              selectionHaptic();
              onSelectMode(option.id);
            }}
          >
            <LinearGradient
              colors={isActive ? option.activeColors : option.idleColors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.modeBorderGradient}
            >
              <View
                className={`flex-row items-center rounded-full ${
                  isActive ? "bg-brand-ink/20" : "bg-brand-ink/80"
                }`}
                style={styles.modeButtonInner}
              >
                <View
                  className={`h-8 w-8 items-center justify-center rounded-full ${
                    isActive ? "bg-white" : "bg-white/10"
                  }`}
                >
                  <Ionicons
                    name={option.icon as keyof typeof Ionicons.glyphMap}
                    color={
                      isActive && option.id === "practice"
                        ? "#B45309"
                        : isActive
                          ? "#1F80E0"
                          : "#FFFFFF"
                    }
                    size={20}
                  />
                </View>
                <View className="ml-3 flex-1">
                  <Text className="text-sm font-black text-white">
                    {option.label}
                  </Text>
                  <Text
                    numberOfLines={1}
                    className={
                      isActive
                        ? "text-[10px] font-bold text-white"
                        : "text-[10px] text-slate-300"
                    }
                  >
                    {option.eyebrow}
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  modeButtonActive: {
    shadowColor: "#1F80E0",
    shadowOffset: { height: 6, width: 0 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
  },
  modeButtonIdle: {
    opacity: 0.92,
  },
  modeBorderGradient: {
    borderRadius: 999,
    padding: 1.4,
  },
  modeButtonInner: {
    minHeight: 54,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
});

export const HomeModeButtons = memo(HomeModeButtonsBase);
