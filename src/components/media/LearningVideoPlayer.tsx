import { Ionicons } from "@expo/vector-icons";
import { useEvent } from "expo";
import { useIsFocused } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import { memo, useCallback, useEffect, useState } from "react";
import { AppState, Pressable, StyleSheet, View } from "react-native";

import { OptimizedImage } from "@/components/media/OptimizedImage";
import { APP_STRINGS } from "@/constants/string";
import { useAppTheme } from "@/theme/AppTheme";
import type { StreamType } from "@/types/media";
import { toggleHaptic } from "@/utils/haptics";

type LearningVideoPlayerProps = {
  title: string;
  videoUrl: string;
  streamType: StreamType;
  posterUrl?: string;
  autoPlay?: boolean;
  elevated?: boolean;
  controlsTop?: number;
};

function LearningVideoPlayerBase({
  title,
  videoUrl,
  streamType,
  posterUrl,
  autoPlay = false,
  elevated = false,
  controlsTop = 16,
}: LearningVideoPlayerProps) {
  const { colors, isDark } = useAppTheme();
  const isFocused = useIsFocused();
  const [hasFirstFrame, setHasFirstFrame] = useState(false);
  const player = useVideoPlayer(
    {
      uri: videoUrl,
      contentType: streamType === "hls" ? "hls" : "auto",
      metadata: {
        title,
        artist: APP_STRINGS.brand.artist,
        artwork: posterUrl,
      },
      useCaching: streamType === "mp4",
    },
    (playerInstance) => {
      playerInstance.loop = false;
      playerInstance.muted = autoPlay;
      playerInstance.timeUpdateEventInterval = 1;

      if (autoPlay) {
        playerInstance.play();
      }
    },
  );
  const { muted } = useEvent(player, "mutedChange", {
    muted: player.muted,
  });

  useEffect(() => {
    if (isFocused && autoPlay) {
      player.play();
      return;
    }

    player.pause();
  }, [autoPlay, isFocused, player]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state !== "active") {
        player.pause();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [player]);

  const handleToggleMute = useCallback(() => {
    toggleHaptic(!muted);
    // expo-video exposes mute as a mutable player control.
    // eslint-disable-next-line react-hooks/immutability
    player.muted = !player.muted;
  }, [muted, player, streamType, title]);

  return (
    <View
      className={
        elevated
          ? "overflow-hidden rounded-b-lg border-b bg-black"
          : "overflow-hidden rounded-lg border bg-black"
      }
      style={{
        borderColor: isDark ? "rgba(255,255,255,0.1)" : colors.border,
      }}
    >
      <VideoView
        player={player}
        nativeControls
        fullscreenOptions={{ enable: true, orientation: "landscape" }}
        allowsPictureInPicture
        playsInline
        contentFit="cover"
        surfaceType="textureView"
        onFirstFrameRender={() => {
          setHasFirstFrame(true);
        }}
        style={styles.video}
      />
      {posterUrl && !hasFirstFrame ? (
        <OptimizedImage
          contentFit="cover"
          priority="high"
          recyclingKey={`video-poster-${posterUrl}`}
          sourceUri={posterUrl}
          style={[StyleSheet.absoluteFill, styles.poster]}
          targetWidth={720}
        />
      ) : null}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          muted ? APP_STRINGS.accessibility.unmuteVideo : APP_STRINGS.accessibility.muteVideo
        }
        className="absolute right-4 h-11 w-11 items-center justify-center rounded-full bg-black/65"
        style={{ top: controlsTop }}
        onPress={handleToggleMute}
      >
        <Ionicons
          name={muted ? "volume-mute" : "volume-high"}
          color="#FFFFFF"
          size={20}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  video: {
    height: 280,
    width: "100%",
  },
  poster: {
    opacity: 0.92,
  },
});

export const LearningVideoPlayer = memo(LearningVideoPlayerBase);
