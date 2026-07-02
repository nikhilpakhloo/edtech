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

export const HomeSkeleton = memo(HomeSkeletonBase);
export const DetailSkeleton = memo(DetailSkeletonBase);
export const SearchSkeleton = memo(SearchSkeletonBase);
