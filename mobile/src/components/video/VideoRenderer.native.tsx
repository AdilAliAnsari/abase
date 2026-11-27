import React, { useImperativeHandle, forwardRef, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { useEventListener } from 'expo';
import { useVideoPlayer, VideoView } from 'expo-video';
import { PlayerHandle, VideoRendererProps } from './types';

export const VideoRenderer = forwardRef<PlayerHandle, VideoRendererProps>((props, ref) => {
  const player = useVideoPlayer(props.source, (p) => {
    p.loop = false;
    p.timeUpdateEventInterval = 0.25;
    p.play();
  });

  useEventListener(player, 'playingChange', ({ isPlaying }) => {
    props.onPlayingChange(isPlaying);
  });

  useEventListener(player, 'timeUpdate', ({ currentTime }) => {
    props.onTimeUpdate(currentTime);
  });

  useEventListener(player, 'statusChange', ({ status }) => {
    if (status === 'readyToPlay') {
      props.onBufferingChange(false);
      if (player.duration > 0) {
        props.onDurationChange(player.duration);
      }
    } else if (status === 'loading') {
      props.onBufferingChange(true);
    } else if (status === 'error') {
      props.onBufferingChange(false);
    }
  });

  useEventListener(player, 'playToEnd', () => {
    props.onEnded();
  });

  useEffect(() => {
    if (player && props.source) {
      player.play();
    }
  }, [props.source, player]);

  useImperativeHandle(ref, () => ({
    togglePlay: () => {
      if (player.playing) {
        player.pause();
      } else {
        player.play();
      }
    },
    seekBy: (seconds: number) => {
      player.seekBy(seconds);
    },
    seekTo: (seconds: number) => {
      player.currentTime = seconds;
    },
    setSpeed: (speed: number) => {
      player.playbackRate = speed;
    },
    setMuted: (muted: boolean) => {
      player.muted = muted;
    },
  }));

  return (
    <VideoView
      player={player}
      style={StyleSheet.absoluteFill}
      contentFit={props.aspectRatio}
      nativeControls={props.nativeControls ?? false}
      pointerEvents={props.nativeControls ? 'auto' : 'none'}
    />
  );
});

VideoRenderer.displayName = 'NativeVideoRenderer';
