import { Ionicons } from "@expo/vector-icons";
import { memo, useCallback, useMemo, useRef, type ComponentProps } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ProgressBar } from "react-native-paper";
import Carousel, {
  type CarouselRenderItem,
  type ICarouselInstance,
} from "react-native-reanimated-carousel";

import { OptimizedImage } from "@/components/media/OptimizedImage";
import { APP_STRINGS } from "@/constants/string";
import { learningProgressStore } from "@/data/learningProgressStore";
import { trackClarityEvent } from "@/services/observability";
import { useAppTheme } from "@/theme/AppTheme";
import type {
  HomeModeId,
  MediaItem,
  NextBestAction,
  StudyPlanItem,
} from "@/types/media";
import { impactHaptic } from "@/utils/haptics";
import { useResponsiveMetrics } from "@/utils/responsive";

type HomeTopExperienceProps = {
  activeMode: HomeModeId;
  hero: MediaItem;
  carouselItems: MediaItem[];
  mediaItems: MediaItem[];
  nextBestAction?: NextBestAction;
  onSelectMedia: (item: MediaItem) => void;
  studyPlan?: StudyPlanItem[];
};

function HomeTopExperienceBase({
  activeMode,
  hero,
  carouselItems,
  mediaItems,
  nextBestAction,
  onSelectMedia,
  studyPlan,
}: HomeTopExperienceProps) {
  const carouselRef = useRef<ICarouselInstance>(null);
  const { colors, isDark } = useAppTheme();
  const metrics = useResponsiveMetrics();
  const carouselHeight = metrics.carouselCardHeight + 28;
  const nextBestActionItem = useMemo(
    () =>
      [hero, ...carouselItems].find(
        (item) => item.id === nextBestAction?.mediaId,
      ) ?? hero,
    [carouselItems, hero, nextBestAction?.mediaId],
  );
  const mediaItemsById = useMemo(
    () =>
      mediaItems.reduce<Record<string, MediaItem>>((acc, item) => {
        acc[item.id] = item;
        return acc;
      }, {}),
    [mediaItems],
  );
  const configurePanGesture = useCallback(
    (
      gesture: Parameters<
        NonNullable<ComponentProps<typeof Carousel>["onConfigurePanGesture"]>
      >[0],
    ) => {
      gesture.activeOffsetX([-12, 12]).failOffsetY([-8, 8]);
    },
    [],
  );

  const renderCarouselItem = useCallback<CarouselRenderItem<MediaItem>>(
    ({ item, index }) => (
      <View
        style={{
          alignItems: "center",
          height: metrics.carouselCardHeight,
          width: metrics.contentWidth,
        }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={APP_STRINGS.accessibility.openTitle(item.title)}
          style={{
            height: metrics.carouselCardHeight,
            width: metrics.carouselCardWidth,
          }}
          onPress={() => {
            impactHaptic();
            trackClarityEvent("home_carousel_card_pressed", {
              mediaId: item.id,
              rank: index + 1,
              title: item.title,
            });
            onSelectMedia(item);
          }}
        >
          <View
            className="overflow-hidden rounded-lg border"
            style={{
              backgroundColor: colors.surface,
              borderColor: isDark ? "rgba(255,255,255,0.1)" : colors.border,
            }}
          >
            <OptimizedImage
              contentFit="cover"
              priority="normal"
              recyclingKey={`carousel-${item.id}`}
              sourceUri={item.backdropUrl}
              transition={180}
              style={{
                height: metrics.carouselCardHeight,
                width: metrics.carouselCardWidth,
              }}
              targetWidth={metrics.carouselCardWidth}
            />
            <View className="absolute inset-0 bg-black/25" />
            <View className="absolute bottom-0 left-0 right-0 bg-brand-ink/80 px-4 py-3">
              <Text className="text-[11px] font-black uppercase tracking-[1.5px] text-brand-cyan">
                {APP_STRINGS.home.forYouRank(index + 1)}
              </Text>
              <Text
                numberOfLines={1}
                className="mt-1 text-lg font-black text-white"
              >
                {item.title}
              </Text>
            </View>
          </View>
        </Pressable>
      </View>
    ),
    [
      colors.border,
      colors.surface,
      isDark,
      metrics.carouselCardHeight,
      metrics.carouselCardWidth,
      metrics.contentWidth,
      onSelectMedia,
    ],
  );

  const handleSelectStudyPlanStep = useCallback(
    (step: StudyPlanItem) => {
      if (step.status !== "next" && step.status !== "done") {
        return;
      }

      const item = mediaItemsById[step.mediaId] ?? nextBestActionItem;

      impactHaptic();
      trackClarityEvent("study_plan_step_pressed", {
        durationMinutes: step.durationMinutes,
        mediaId: step.mediaId,
        stepId: step.id,
        status: step.status,
        title: step.title,
      });
      learningProgressStore.completeStudyPlanItem(step.id);
      onSelectMedia(item);
    },
    [mediaItemsById, nextBestActionItem, onSelectMedia],
  );

  return (
    <View className="pb-2">
      <HeroCard hero={hero} activeMode={activeMode} onSelectMedia={onSelectMedia} />

      {nextBestAction ? (
        <ResumeCard
          item={nextBestActionItem}
          nextBestAction={nextBestAction}
          onSelectMedia={onSelectMedia}
        />
      ) : null}

      {studyPlan?.length ? (
        <StudyPlanCard
          studyPlan={studyPlan}
          onSelectStep={handleSelectStudyPlanStep}
        />
      ) : null}

      <View style={{ marginTop: metrics.sectionGap }}>
        <View
          style={{
            marginBottom: 12,
            paddingHorizontal: metrics.horizontalPadding,
          }}
        >
          <Text className="text-xl font-black" style={{ color: colors.text }}>
            {APP_STRINGS.home.forYou}
          </Text>
          <Text className="mt-1 text-sm" style={{ color: colors.textMuted }}>
            {APP_STRINGS.home.swipeThroughCurated(
              activeMode === "learn"
                ? APP_STRINGS.home.modes.learn.swipeSuffix
                : APP_STRINGS.home.modes.practice.swipeSuffix,
            )}
          </Text>
        </View>
        <View style={[styles.snapCarouselFrame, { height: carouselHeight }]}>
          <Carousel
            ref={carouselRef}
            data={carouselItems}
            loop
            pagingEnabled
            snapEnabled
            autoPlay={false}
            autoPlayInterval={2200}
            scrollAnimationDuration={420}
            renderItem={renderCarouselItem}
            onConfigurePanGesture={configurePanGesture}
            style={styles.snapCarousel}
            width={metrics.contentWidth}
            height={carouselHeight}
            windowSize={5}
          />
        </View>
      </View>
    </View>
  );
}

function HeroCard({
  activeMode,
  hero,
  onSelectMedia,
}: {
  activeMode: HomeModeId;
  hero: MediaItem;
  onSelectMedia: (item: MediaItem) => void;
}) {
  const { colors, isDark } = useAppTheme();
  const metrics = useResponsiveMetrics();

  return (
    <View style={{ paddingHorizontal: metrics.horizontalPadding }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={APP_STRINGS.accessibility.openTitle(hero.title)}
        className="overflow-hidden rounded-lg border"
        style={{
          backgroundColor: colors.surface,
          borderColor: isDark ? "rgba(255,255,255,0.1)" : colors.border,
        }}
        onPress={() => {
          impactHaptic();
          trackClarityEvent("home_hero_pressed", {
            mediaId: hero.id,
            mode: activeMode,
            title: hero.title,
          });
          onSelectMedia(hero);
        }}
      >
        <OptimizedImage
          contentFit="cover"
          priority="high"
          recyclingKey={`home-hero-${hero.id}`}
          sourceUri={hero.backdropUrl}
          transition={200}
          style={{ height: metrics.heroImageHeight, width: "100%" }}
          targetWidth={metrics.contentWidth}
        />
        <View className="absolute inset-0 bg-black/25" />
        <View
          className="absolute bottom-0 left-0 right-0 bg-brand-ink/85"
          style={{
            paddingHorizontal: metrics.isCompact ? 12 : 16,
            paddingVertical: metrics.isCompact ? 12 : 16,
          }}
        >
          <Text className="text-[11px] font-black uppercase tracking-[1.8px] text-brand-gold">
            {activeMode === "learn"
              ? APP_STRINGS.home.modes.learn.featured
              : APP_STRINGS.home.modes.practice.featured}
          </Text>
          <Text
            numberOfLines={2}
            className="mt-1 font-black text-white"
            style={{
              fontSize: metrics.isCompact ? 20 : 24,
              lineHeight: metrics.isCompact ? 25 : 30,
            }}
          >
            {hero.title}
          </Text>
          <Text
            numberOfLines={2}
            className="mt-2 text-sm text-slate-300"
            style={{ lineHeight: 20 }}
          >
            {hero.description}
          </Text>
        </View>
      </Pressable>
    </View>
  );
}

function ResumeCard({
  item,
  nextBestAction,
  onSelectMedia,
}: {
  item: MediaItem;
  nextBestAction: NextBestAction;
  onSelectMedia: (item: MediaItem) => void;
}) {
  const { colors, isDark } = useAppTheme();
  const metrics = useResponsiveMetrics();

  return (
    <View
      className="rounded-lg border"
      style={{
        backgroundColor: colors.elevated,
        borderColor: isDark ? "rgba(255,255,255,0.1)" : colors.border,
        marginHorizontal: metrics.horizontalPadding,
        marginTop: metrics.sectionGap,
        padding: metrics.isCompact ? 12 : 14,
      }}
    >
      <View className="flex-row items-center">
        <View className="h-11 w-11 items-center justify-center rounded-full bg-brand-blue/15">
          <Ionicons name="navigate" color="#4F8CFF" size={21} />
        </View>
        <View className="ml-3 flex-1">
          <Text className="text-base font-black" style={{ color: colors.text }}>
            {nextBestAction.title}
          </Text>
          <Text className="mt-1 text-sm" style={{ color: colors.textMuted }}>
            {nextBestAction.subtitle}
          </Text>
          {nextBestAction.lastPlayedLesson ? (
            <Text
              numberOfLines={1}
              className="mt-1 text-xs font-bold"
              style={{ color: colors.textMuted }}
            >
              {nextBestAction.lastPlayedLesson}
            </Text>
          ) : null}
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={APP_STRINGS.accessibility.openTitle(nextBestAction.title)}
          className="min-h-10 justify-center rounded-full bg-white px-4"
          onPress={() => {
            impactHaptic();
            trackClarityEvent("resume_learning_pressed", {
              mediaId: item.id,
              progressPercent: nextBestAction.progressPercent,
              title: item.title,
            });
            onSelectMedia(item);
          }}
        >
          <Text className="text-xs font-black uppercase text-brand-ink">
            {nextBestAction.ctaLabel}
          </Text>
        </Pressable>
      </View>
      <View className="mt-4 flex-row items-center">
        <ProgressBar
          progress={nextBestAction.progressPercent}
          color="#1F80E0"
          style={styles.nextActionProgress}
        />
        <Text className="ml-3 text-xs font-black text-brand-cyan">
          {APP_STRINGS.format.minutes(nextBestAction.timeRemainingMinutes)}
        </Text>
      </View>
    </View>
  );
}

function StudyPlanCard({
  onSelectStep,
  studyPlan,
}: {
  onSelectStep: (step: StudyPlanItem) => void;
  studyPlan: StudyPlanItem[];
}) {
  const { colors, isDark } = useAppTheme();
  const metrics = useResponsiveMetrics();

  return (
    <View
      style={{
        marginTop: metrics.sectionGap,
        paddingHorizontal: metrics.horizontalPadding,
      }}
    >
      <Text className="text-xl font-black" style={{ color: colors.text }}>
        {APP_STRINGS.home.studyPlanTitle}
      </Text>
      <View
        className="mt-3 rounded-lg border"
        style={{
          backgroundColor: colors.surface,
          borderColor: isDark ? "rgba(255,255,255,0.1)" : colors.border,
        }}
      >
        {studyPlan.map((step, index) => (
          <Pressable
            key={step.id}
            accessibilityRole="button"
            accessibilityState={{
              disabled: step.status !== "next" && step.status !== "done",
            }}
            accessibilityLabel={step.title}
            className="flex-row items-center px-4 py-3"
            style={{
              borderTopColor: isDark ? "rgba(255,255,255,0.08)" : colors.border,
              borderTopWidth: index ? StyleSheet.hairlineWidth : 0,
              opacity: step.status === "next" || step.status === "done" ? 1 : 0.55,
            }}
            onPress={() => onSelectStep(step)}
          >
            <View
              className="h-9 w-9 items-center justify-center rounded-full"
              style={{
                backgroundColor:
                  step.status === "done"
                    ? "#22C55E"
                    : step.status === "next"
                      ? "#1F80E0"
                      : "rgba(148,163,184,0.16)",
              }}
            >
              <Ionicons
                name={
                  step.status === "done"
                    ? "checkmark"
                    : step.status === "next"
                      ? "play"
                      : "lock-closed-outline"
                }
                color={
                  step.status === "next" || step.status === "done"
                    ? "#FFFFFF"
                    : colors.textMuted
                }
                size={16}
              />
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-[11px] font-black uppercase tracking-[1.2px] text-brand-gold">
                {step.label}
              </Text>
              <Text
                numberOfLines={1}
                className="mt-1 text-sm font-bold"
                style={{ color: colors.text }}
              >
                {step.title}
              </Text>
            </View>
            <Text className="text-xs font-black" style={{ color: colors.textMuted }}>
              {APP_STRINGS.format.minutes(step.durationMinutes)}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  snapCarousel: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },
  snapCarouselFrame: {
    alignItems: "center",
    overflow: "visible",
    width: "100%",
  },
  nextActionProgress: {
    borderRadius: 999,
    flex: 1,
    height: 5,
  },
});

export const HomeTopExperience = memo(HomeTopExperienceBase);
