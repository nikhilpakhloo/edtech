import { memo } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

function SkeletonBlock({ className }: { className: string }) {
  return <View className={`bg-brand-elevated ${className}`} />;
}

function SkeletonRail() {
  return (
    <View className="mb-7">
      <View className="mb-3 px-5">
        <SkeletonBlock className="h-5 w-44 rounded" />
        <SkeletonBlock className="mt-2 h-3 w-56 rounded" />
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.rail}
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
  return (
    <ScrollView
      className="flex-1 bg-brand-ink"
      showsVerticalScrollIndicator={false}
    >
      <SkeletonBlock className="h-[40px] w-full" />
      <View className="px-5 py-6">
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
  return (
    <ScrollView
      className="flex-1 bg-brand-ink"
      showsVerticalScrollIndicator={false}
    >
      <SkeletonBlock className="h-[430px] w-full" />
      <View className="px-5 py-5">
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
  return (
    <ScrollView
      className="flex-1 bg-brand-ink"
      showsVerticalScrollIndicator={false}
    >
      <View className="px-5 pb-5 pt-14">
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

const styles = StyleSheet.create({
  rail: {
    paddingHorizontal: 20,
  },
});

export const HomeSkeleton = memo(HomeSkeletonBase);
export const DetailSkeleton = memo(DetailSkeletonBase);
export const SearchSkeleton = memo(SearchSkeletonBase);
