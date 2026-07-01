import { useEvent } from 'expo';
import { useVideoPlayer, VideoView } from 'expo-video';
import { memo, useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from 'react-native-paper';

import type { StreamType } from '@/types/media';

type LearningVideoPlayerProps = {
  title: string;
  videoUrl: string;
  streamType: StreamType;
};

function LearningVideoPlayerBase({ title, videoUrl, streamType }: LearningVideoPlayerProps) {
  const player = useVideoPlayer(
    {
      uri: videoUrl,
      metadata: {
        title,
        artist: 'EdStream',
      },
      useCaching: streamType === 'mp4',
    },
    (playerInstance) => {
      playerInstance.loop = false;
    },
  );
  const { isPlaying } = useEvent(player, 'playingChange', {
    isPlaying: player.playing,
  });

  const handleTogglePlayback = useCallback(() => {
    if (isPlaying) {
      player.pause();
      return;
    }

    player.play();
  }, [isPlaying, player]);

  return (
    <View className="overflow-hidden rounded-lg border border-brand-line bg-black">
      <VideoView
        player={player}
        nativeControls
        fullscreenOptions={{ enable: true }}
        allowsPictureInPicture
        contentFit="cover"
        surfaceType="textureView"
        style={styles.video}
      />
      <View className="flex-row items-center justify-between bg-brand-surface px-4 py-3">
        <View className="flex-1 pr-3">
          <Text className="text-sm font-bold text-white">Now Playing</Text>
          <Text numberOfLines={1} className="mt-1 text-xs text-slate-400">
            {title} - {streamType.toUpperCase()}
          </Text>
        </View>
        <Button
          mode="contained"
          compact
          buttonColor="#4F8CFF"
          textColor="#FFFFFF"
          onPress={handleTogglePlayback}>
          {isPlaying ? 'Pause' : 'Play'}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  video: {
    aspectRatio: 16 / 9,
    width: '100%',
  },
});

export const LearningVideoPlayer = memo(LearningVideoPlayerBase);
