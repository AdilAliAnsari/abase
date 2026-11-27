export interface PlayerHandle {
  togglePlay: () => void;
  seekBy: (seconds: number) => void;
  seekTo: (seconds: number) => void;
  setSpeed: (speed: number) => void;
  setMuted: (muted: boolean) => void;
}

export interface VideoRendererProps {
  source: string;
  aspectRatio: 'contain' | 'cover' | 'fill';
  nativeControls?: boolean;
  onTimeUpdate: (currentTime: number) => void;
  onDurationChange: (duration: number) => void;
  onPlayingChange: (isPlaying: boolean) => void;
  onBufferingChange: (isBuffering: boolean) => void;
  onEnded: () => void;
}
