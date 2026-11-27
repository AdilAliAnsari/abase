import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import { PlayerHandle, VideoRendererProps } from './types';

export const VideoRenderer = forwardRef<PlayerHandle, VideoRendererProps>((props, ref) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useImperativeHandle(ref, () => ({
    togglePlay: () => {
      if (videoRef.current) {
        if (videoRef.current.paused) {
          videoRef.current.play().catch(() => {});
        } else {
          videoRef.current.pause();
        }
      }
    },
    seekBy: (seconds: number) => {
      if (videoRef.current) {
        const dur = videoRef.current.duration || 10000;
        const nextTime = Math.max(0, Math.min(dur, videoRef.current.currentTime + seconds));
        videoRef.current.currentTime = nextTime;
      }
    },
    seekTo: (seconds: number) => {
      if (videoRef.current) {
        videoRef.current.currentTime = seconds;
      }
    },
    setSpeed: (speed: number) => {
      if (videoRef.current) {
        videoRef.current.playbackRate = speed;
      }
    },
    setMuted: (muted: boolean) => {
      if (videoRef.current) {
        videoRef.current.muted = muted;
      }
    },
  }));

  return (
    <video
      ref={videoRef}
      src={props.source}
      style={{
        width: '100%',
        height: '100%',
        objectFit: props.aspectRatio === 'contain' ? 'contain' : props.aspectRatio === 'cover' ? 'cover' : 'fill',
        backgroundColor: '#000000',
        pointerEvents: props.nativeControls ? 'auto' : 'none',
      }}
      autoPlay
      playsInline
      onTimeUpdate={(e) => props.onTimeUpdate(e.currentTarget.currentTime)}
      onLoadedMetadata={(e) => {
        props.onDurationChange(e.currentTarget.duration);
        props.onBufferingChange(false);
      }}
      onWaiting={() => props.onBufferingChange(true)}
      onPlaying={() => {
        props.onBufferingChange(false);
        props.onPlayingChange(true);
      }}
      onPause={() => props.onPlayingChange(false)}
      onEnded={() => {
        props.onPlayingChange(false);
        props.onEnded();
      }}
    />
  );
});

VideoRenderer.displayName = 'WebVideoRenderer';
