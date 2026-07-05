import { memo } from "react";
import { ScrollView, View } from "react-native";

import { useAppTheme } from "@/theme/AppTheme";
import { useResponsiveMetrics } from "@/utils/responsive";

function SkeletonBlock({ className }: { className: string }) {
  const { colors } = useAppTheme();

  return <View className={className} style={{ backgroundColor: colors.elevated }} />;
}

function SkeletonRail() {
  const metrics = useResponsiveMetrics();

  return (
    <View style={{ marginBottom: metrics.isCompact ? 24 : 28 }}>
      <View style={{ marginBottom: 12, paddingHorizontal: metrics.horizontalPadding }}>
        <SkeletonBlock className="h-5 w-44 rounded" />
        <SkeletonBlock className="mt-2 h-3 w-56 rounded" />
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: metrics.horizontalPadding }}
      >
        {Array.from({ length: 5 }).map((_, index) => (
          <View key={index} className="mr-3 w-32">
            <SkeletonBlock className="h-[188px] w-32 rounded-md" />
            <SkeletonBlock className="mt-3 h-4 w-28 rounded" />
            <SkeletonBlock className="mt-2 h-3 w-20 rounded" />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

function HomeSkeletonBase() {
  const { colors } = useAppTheme();
  const metrics = useResponsiveMetrics();

  return (
    <ScrollView
      className="flex-1"
      style={{ backgroundColor: colors.background }}
      showsVerticalScrollIndicator={false}
    >
      <SkeletonBlock className="h-[40px] w-full" />
      <View
        style={{
          paddingHorizontal: metrics.horizontalPadding,
          paddingVertical: metrics.isCompact ? 20 : 24,
        }}>
        <SkeletonBlock className="h-4 w-28 rounded" />
        <SkeletonBlock className="mt-3 h-10 w-64 rounded" />
        <SkeletonBlock className="mt-4 h-4 w-full rounded" />
        <SkeletonBlock className="mt-2 h-4 w-10/12 rounded" />
      </View>
      <SkeletonRail />
      <SkeletonRail />
      <SkeletonRail />
    </ScrollView>
  );
}

function DetailSkeletonBase() {
  const { colors } = useAppTheme();
  const metrics = useResponsiveMetrics();

  return (
    <ScrollView
      className="flex-1"
      style={{ backgroundColor: colors.background }}
      showsVerticalScrollIndicator={false}
    >
      <SkeletonBlock className="h-[430px] w-full" />
      <View
        style={{
          paddingHorizontal: metrics.horizontalPadding,
          paddingVertical: metrics.isCompact ? 16 : 20,
        }}>
        <SkeletonBlock className="h-10 w-44 rounded" />
        <SkeletonBlock className="mt-5 aspect-video w-full rounded-lg" />
        <SkeletonBlock className="mt-5 h-4 w-full rounded" />
        <SkeletonBlock className="mt-2 h-4 w-11/12 rounded" />
        <SkeletonBlock className="mt-2 h-4 w-8/12 rounded" />
      </View>
      <SkeletonRail />
    </ScrollView>
  );
}

function SearchSkeletonBase() {
  const { colors } = useAppTheme();
  const metrics = useResponsiveMetrics();

  return (
    <ScrollView
      className="flex-1"
      style={{ backgroundColor: colors.background }}
      showsVerticalScrollIndicator={false}
    >
      <View
        style={{
          paddingBottom: metrics.isCompact ? 16 : 20,
          paddingHorizontal: metrics.horizontalPadding,
          paddingTop: metrics.headerTopPadding,
        }}>
        <SkeletonBlock className="h-9 w-32 rounded" />
        <SkeletonBlock className="mt-3 h-4 w-72 rounded" />
        <SkeletonBlock className="mt-5 h-12 w-full rounded-lg" />
        <SkeletonBlock className="mt-4 h-3 w-24 rounded" />
      </View>
      <SkeletonRail />
      <SkeletonRail />
      <SkeletonRail />
    </ScrollView>
  );
}

function ProfileSkeletonBase() {
  const { colors } = useAppTheme();
  const metrics = useResponsiveMetrics();

  return (
    <ScrollView
      className="flex-1"
      style={{ backgroundColor: colors.background }}
      showsVerticalScrollIndicator={false}
    >
      <View
        style={{
          paddingHorizontal: metrics.horizontalPadding,
          paddingTop: 18,
        }}
      >
        <SkeletonBlock className="h-4 w-40 rounded" />
        <SkeletonBlock className="mt-3 h-9 w-52 rounded" />
        <SkeletonBlock className="mt-3 h-4 w-full rounded" />
        <SkeletonBlock className="mt-2 h-4 w-10/12 rounded" />

        <View className="mt-5 rounded-lg p-4" style={{ backgroundColor: colors.surface }}>
          <View className="flex-row items-center">
            <SkeletonBlock className="h-[54px] w-[54px] rounded-full" />
            <View className="ml-4 flex-1">
              <SkeletonBlock className="h-6 w-36 rounded" />
              <SkeletonBlock className="mt-3 h-5 w-28 rounded-full" />
            </View>
            <SkeletonBlock className="h-10 w-10 rounded-full" />
          </View>
          <View className="mt-5 flex-row flex-wrap" style={{ gap: 10 }}>
            {Array.from({ length: 4 }).map((_, index) => (
              <View
                key={index}
                className="rounded-lg p-3"
                style={{
                  backgroundColor: colors.elevated,
                  flex: metrics.isCompact ? undefined : 1,
                  width: metrics.isCompact
                    ? (metrics.contentWidth - metrics.horizontalPadding * 2 - 12) / 2
                    : undefined,
                }}
              >
                <SkeletonBlock className="h-3 w-20 rounded" />
                <SkeletonBlock className="mt-3 h-6 w-16 rounded" />
              </View>
            ))}
          </View>
        </View>

        <SkeletonBlock className="mt-7 h-6 w-36 rounded" />
        <SkeletonBlock className="mt-2 h-4 w-64 rounded" />
        <View className="mt-4 rounded-lg p-4" style={{ backgroundColor: colors.surface }}>
          {Array.from({ length: 5 }).map((_, index) => (
            <View key={index} className={`flex-row items-center ${index ? "mt-5" : ""}`}>
              <SkeletonBlock className="h-11 w-11 rounded-full" />
              <View className="ml-3 flex-1">
                <SkeletonBlock className="h-5 w-36 rounded" />
                <SkeletonBlock className="mt-2 h-4 w-52 rounded" />
              </View>
              <SkeletonBlock className="h-7 w-12 rounded-full" />
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

export const HomeSkeleton = memo(HomeSkeletonBase);
export const DetailSkeleton = memo(DetailSkeletonBase);
export const ProfileSkeleton = memo(ProfileSkeletonBase);
export const SearchSkeleton = memo(SearchSkeletonBase);
