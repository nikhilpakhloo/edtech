import { Ionicons } from "@expo/vector-icons";
import { useEvent } from "expo";
import { Image } from "expo-image";
import { useVideoPlayer, VideoView } from "expo-video";
import { memo, useCallback, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { useAppTheme } from "@/theme/AppTheme";
import type { StreamType } from "@/types/media";
import { selectionHaptic } from "@/utils/haptics";

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
  const [hasFirstFrame, setHasFirstFrame] = useState(false);
  const player = useVideoPlayer(
    {
      uri: videoUrl,
      contentType: streamType === "hls" ? "hls" : "auto",
      metadata: {
        title,
        artist: "EdStream",
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

  const handleToggleMute = useCallback(() => {
    selectionHaptic();
    // expo-video exposes mute as a mutable player control.
    // eslint-disable-next-line react-hooks/immutability
    player.muted = !player.muted;
  }, [player]);

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
        onFirstFrameRender={() => setHasFirstFrame(true)}
        style={styles.video}
      />
      {posterUrl && !hasFirstFrame ? (
        <Image
          source={{ uri: posterUrl }}
          cachePolicy="disk"
          contentFit="cover"
          style={[StyleSheet.absoluteFill, styles.poster]}
        />
      ) : null}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={muted ? "Unmute video" : "Mute video"}
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
