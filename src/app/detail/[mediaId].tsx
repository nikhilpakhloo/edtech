import { router, Stack, useLocalSearchParams, type Href } from "expo-router";
import { useCallback, useEffect } from "react";
import {
  Pressable,
  StatusBar as NativeStatusBar,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated";

import { ErrorState } from "@/components/feedback/ErrorState";
import { DetailSkeleton } from "@/components/feedback/Skeleton";
import { Screen } from "@/components/layout/Screen";
import { LearningVideoPlayer } from "@/components/media/LearningVideoPlayer";
import { MediaRail } from "@/components/media/MediaRail";
import { MetadataPill } from "@/components/media/MetadataPill";
import { APP_STRINGS } from "@/constants/string";
import { learningProgressStore } from "@/data/learningProgressStore";
import { DetailAnimatedHeader } from "@/features/detail/components/DetailAnimatedHeader";
import { useMediaDetail } from "@/features/detail/hooks/useMediaDetail";
import { useAppTheme } from "@/theme/AppTheme";
import type {
  DetailContentSection,
  DetailAction,
  DetailMetadataGroup,
  DetailMetric,
  MediaItem,
} from "@/types/media";
import { selectionHaptic } from "@/utils/haptics";
import { useResponsiveMetrics } from "@/utils/responsive";

const VIDEO_CONTROL_TOP = 8;

export default function DetailScreen() {
  const { colors, isDark } = useAppTheme();
  const metrics = useResponsiveMetrics();
  const { mediaId } = useLocalSearchParams<{ mediaId: string }>();
  const { detail, error, isLoading, item, related, retry } =
    useMediaDetail(mediaId);
  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });
  const handleBack = useCallback(() => {
    selectionHaptic();
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/");
  }, []);
  const handleHeaderAction = useCallback(() => {
    selectionHaptic();
  }, []);
  const handleSelectMedia = useCallback((selectedItem: MediaItem) => {
    router.push({
      pathname: "/detail/[mediaId]",
      params: { mediaId: selectedItem.id },
    } as unknown as Href);
  }, []);

  useEffect(() => {
    if (item) {
      learningProgressStore.recordLastPlayed(item);
    }
  }, [item]);

  if (isLoading) {
    return (
      <Screen edges={["left", "right"]}>
        <Stack.Screen options={{ headerShown: false }} />
        <DetailSkeleton />
      </Screen>
    );
  }

  if (error || !item || !detail) {
    return (
      <Screen>
        <Stack.Screen options={{ headerShown: false }} />
        <ErrorState
          title={APP_STRINGS.errors.titleUnavailable}
          message={error ?? APP_STRINGS.errors.titleNotFound}
          actionLabel={APP_STRINGS.common.retry}
          onRetry={retry}
        />
      </Screen>
    );
  }

  return (
    <Screen edges={["left", "right"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <NativeStatusBar
        backgroundColor="transparent"
        barStyle={isDark ? "light-content" : "dark-content"}
        translucent
      />
      <DetailAnimatedHeader
        title={item.title}
        scrollY={scrollY}
        onBack={handleBack}
        onAction={handleHeaderAction}
      />
      <View className="bg-black">
        <LearningVideoPlayer
          title={item.title}
          videoUrl={item.videoUrl}
          streamType={item.streamType}
          posterUrl={item.backdropUrl}
          autoPlay
          elevated
          controlsTop={VIDEO_CONTROL_TOP}
        />
      </View>

      <Animated.ScrollView
        className="flex-1"
        style={{ backgroundColor: colors.background }}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: metrics.isCompact ? 28 : 36 }}
      >
        <View
          style={{
            paddingHorizontal: metrics.horizontalPadding,
            paddingTop: metrics.isCompact ? 16 : 20,
          }}
        >
          <View className="flex-row flex-wrap">
            <MetadataPill label={item.eyebrow} />
            <MetadataPill label={item.kind.toUpperCase()} />
            <MetadataPill label={item.rating} />
            {item.episodeCount ? (
              <MetadataPill
                label={APP_STRINGS.detail.episodeLabel(item.episodeCount)}
              />
            ) : null}
          </View>

          <ActionRow actions={detail.actions} onAction={handleHeaderAction} />
          <MetricGrid metrics={detail.metrics} />
          <MetadataGroups groups={detail.metadataGroups} />
          <ContentSections sections={detail.sections} />
        </View>

        <View style={{ marginTop: metrics.isCompact ? 24 : 32 }}>
          <MediaRail
            rail={{
              id: "related",
              title: APP_STRINGS.detail.relatedTitle,
              items: related,
            }}
            onSelectMedia={handleSelectMedia}
          />
        </View>
      </Animated.ScrollView>
    </Screen>
  );
}

function ActionRow({
  actions,
  onAction,
}: {
  actions: DetailAction[];
  onAction: () => void;
}) {
  const { colors, isDark } = useAppTheme();
  const metrics = useResponsiveMetrics();

  return (
    <View
      className="flex-row flex-wrap"
      style={{ gap: 10, marginTop: metrics.isCompact ? 14 : 16 }}
    >
      {actions.map((action) => {
        const isPrimary = action.kind === "primary";

        return (
          <Pressable
            key={action.id}
            accessibilityRole="button"
            accessibilityLabel={action.label}
            className="flex-row items-center justify-center rounded-full"
            style={{
              backgroundColor: isPrimary ? "#FFFFFF" : colors.surface,
              borderColor: isDark ? "rgba(255,255,255,0.12)" : colors.border,
              borderWidth: isPrimary ? 0 : 1,
              minHeight: 42,
              paddingHorizontal: isPrimary ? 18 : 14,
            }}
            onPress={onAction}
          >
            <Ionicons
              name={action.icon as keyof typeof Ionicons.glyphMap}
              color={isPrimary ? "#030712" : colors.text}
              size={18}
            />
            <Text
              className="ml-2 text-sm font-black"
              style={{ color: isPrimary ? "#030712" : colors.text }}
            >
              {action.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function MetricGrid({ metrics }: { metrics: DetailMetric[] }) {
  const { colors, isDark } = useAppTheme();
  const responsive = useResponsiveMetrics();

  return (
    <View
      className="flex-row rounded-lg border"
      style={{
        backgroundColor: colors.surface,
        borderColor: isDark ? "rgba(255,255,255,0.1)" : colors.border,
        marginTop: responsive.isCompact ? 14 : 16,
      }}
    >
      {metrics.map((metric, index) => (
        <View
          key={metric.id}
          className="flex-1 px-3 py-3"
          style={{
            borderLeftColor: isDark ? "rgba(255,255,255,0.08)" : colors.border,
            borderLeftWidth: index ? 1 : 0,
          }}
        >
          <Text
            numberOfLines={1}
            className="text-[10px] font-black uppercase tracking-[1px]"
            style={{ color: colors.textMuted }}
          >
            {metric.label}
          </Text>
          <Text
            numberOfLines={1}
            className="mt-1 text-sm font-black"
            style={{ color: colors.text }}
          >
            {metric.value}
          </Text>
        </View>
      ))}
    </View>
  );
}

function MetadataGroups({ groups }: { groups: DetailMetadataGroup[] }) {
  const { colors, isDark } = useAppTheme();
  const metrics = useResponsiveMetrics();

  return (
    <View
      className="rounded-lg border p-4"
      style={{
        backgroundColor: colors.surface,
        borderColor: isDark ? "rgba(255,255,255,0.1)" : colors.border,
        marginTop: metrics.isCompact ? 10 : 12,
      }}
    >
      <View>
        {groups.map((group, index) => (
          <View
            key={group.id}
            style={{
              alignItems: "flex-start",
              flexDirection: "row",
              marginTop: index ? 14 : 0,
            }}
          >
            <Text
              className="text-xs font-black uppercase tracking-[1px]"
              style={{
                color: colors.textMuted,
                lineHeight: 24,
                marginRight: metrics.isCompact ? 10 : 12,
                width: metrics.isCompact ? 78 : 96,
              }}
            >
              {group.title}
            </Text>
            <View
              className="flex-1 flex-row flex-wrap"
              style={{ alignItems: "center" }}
            >
              {group.values.map((value) => (
                <MetadataPill key={`${group.id}-${value}`} label={value} />
              ))}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

function ContentSections({ sections }: { sections: DetailContentSection[] }) {
  const { colors, isDark } = useAppTheme();
  const metrics = useResponsiveMetrics();

  return (
    <View style={{ marginTop: metrics.isCompact ? 14 : 16 }}>
      {sections.map((section, index) => (
        <View
          key={section.id}
          className="rounded-lg border p-4"
          style={{
            backgroundColor: colors.elevated,
            borderColor: isDark ? "rgba(255,255,255,0.1)" : colors.border,
            marginTop: index ? (metrics.isCompact ? 10 : 12) : 0,
          }}
        >
          <Text className="text-lg font-black" style={{ color: colors.text }}>
            {section.title}
          </Text>
          {section.body ? (
            <Text
              className="mt-3 text-base"
              style={{
                color: colors.textMuted,
                lineHeight: metrics.isCompact ? 24 : 26,
              }}
            >
              {section.body}
            </Text>
          ) : null}
          {section.bullets?.length ? (
            <View className="mt-3">
              {section.bullets.map((bullet) => (
                <View key={bullet} className="mb-2 flex-row">
                  <View className="mr-3 mt-2 h-1.5 w-1.5 rounded-full bg-brand-cyan" />
                  <Text
                    className="flex-1 text-sm leading-6"
                    style={{ color: colors.textMuted }}
                  >
                    {bullet}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>
      ))}
    </View>
  );
}
