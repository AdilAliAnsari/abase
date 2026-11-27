import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Dimensions,
  Animated,
} from 'react-native';
import {
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Download,
  CheckCircle2,
  Lock,
  Unlock,
  GraduationCap,
  SlidersHorizontal,
} from 'lucide-react-native';
import { VideoItem } from '../data/videos';
import { downloadPdfFile } from '../utils/pdfViewerUtils';
import { getApiBaseUrl } from '../services/api';
import { VideoRenderer, PlayerHandle } from './video/VideoRenderer';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface MXPlayerModalProps {
  visible: boolean;
  video: VideoItem | null;
  onClose: () => void;
  onNextVideo?: () => void;
  onPrevVideo?: () => void;
  onDownloadFeedback?: (title: string) => void;
}

export const MXPlayerModal: React.FC<MXPlayerModalProps> = ({
  visible,
  video,
  onClose,
  onNextVideo,
  onPrevVideo,
  onDownloadFeedback,
}) => {
  // Video playback state
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(video?.durationSeconds || 1800);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [quality, setQuality] = useState<string>('1080p FHD');
  const [aspectRatio, setAspectRatio] = useState<'contain' | 'cover' | 'fill'>('contain');
  const [useNativeControls, setUseNativeControls] = useState<boolean>(false);

  // MX Player features: Controls visibility, screen lock, double tap feedback
  const [showControls, setShowControls] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [doubleTapSide, setDoubleTapSide] = useState<'left' | 'right' | null>(null);

  // Speed and Quality menus
  const [isSpeedMenuOpen, setIsSpeedMenuOpen] = useState(false);
  const [isQualityMenuOpen, setIsQualityMenuOpen] = useState(false);

  // Download state
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const controlsTimeoutRef = useRef<any>(null);
  const lastTapRef = useRef<number>(0);
  const playerRef = useRef<PlayerHandle | null>(null);

  // Animated values
  const controlsOpacity = useRef(new Animated.Value(1)).current;
  const rippleScale = useRef(new Animated.Value(0)).current;

  // Reset controls timer
  const resetControlsTimer = () => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    setShowControls(true);
    Animated.timing(controlsOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();

    if (!isLocked) {
      controlsTimeoutRef.current = setTimeout(() => {
        if (isPlaying) {
          Animated.timing(controlsOpacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }).start(() => setShowControls(false));
        }
      }, 4000);
    }
  };

  useEffect(() => {
    if (visible) {
      setIsPlaying(true);
      setCurrentTime(0);
      setIsLocked(false);
      resetControlsTimer();
    } else {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    }
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [visible, video]);

  const togglePlay = () => {
    if (playerRef.current) {
      playerRef.current.togglePlay();
    }
    setIsPlaying(!isPlaying);
    resetControlsTimer();
  };

  const seekBy = (seconds: number) => {
    if (playerRef.current) {
      playerRef.current.seekBy(seconds);
    }
    setCurrentTime((prev) => Math.max(0, Math.min(duration, prev + seconds)));
    resetControlsTimer();
  };

  const handleDoubleTap = (side: 'left' | 'right') => {
    setDoubleTapSide(side);
    rippleScale.setValue(0.5);
    Animated.spring(rippleScale, {
      toValue: 1.2,
      friction: 6,
      useNativeDriver: true,
    }).start();

    if (side === 'left') {
      seekBy(-10);
    } else {
      seekBy(10);
    }

    setTimeout(() => {
      setDoubleTapSide(null);
    }, 650);
  };

  const handleScreenTouch = (e: any) => {
    if (isLocked) {
      setShowControls(!showControls);
      return;
    }

    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300;
    const touchX = e.nativeEvent?.locationX || SCREEN_WIDTH / 2;

    if (now - lastTapRef.current < DOUBLE_PRESS_DELAY) {
      // Double Tap detected
      if (touchX < SCREEN_WIDTH * 0.4) {
        handleDoubleTap('left');
      } else if (touchX > SCREEN_WIDTH * 0.6) {
        handleDoubleTap('right');
      } else {
        togglePlay();
      }
    } else {
      // Single Tap: Toggle controls
      if (showControls) {
        setShowControls(false);
      } else {
        resetControlsTimer();
      }
    }
    lastTapRef.current = now;
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (playerRef.current) {
      playerRef.current.setSpeed(speed);
    }
    setIsSpeedMenuOpen(false);
    resetControlsTimer();
  };

  const handleMuteToggle = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    if (playerRef.current) {
      playerRef.current.setMuted(nextMute);
    }
  };

  const handleDownload = async () => {
    if (!video) return;
    setDownloadSuccess(true);
    if (onDownloadFeedback) {
      onDownloadFeedback(video.title);
    }
    await downloadPdfFile(video.videoUrl, video.title);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  const formatTime = (secs: number) => {
    const s = Math.floor(secs || 0);
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    const displayM = m % 60;
    const displayS = s % 60;
    if (h > 0) {
      return `${h}:${displayM < 10 ? '0' : ''}${displayM}:${displayS < 10 ? '0' : ''}${displayS}`;
    }
    return `${displayM}:${displayS < 10 ? '0' : ''}${displayS}`;
  };

  if (!video) return null;

  const resolveUrl = (rawUrl: string) => {
    if (!rawUrl) return '';
    if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) return rawUrl;
    if (Platform.OS === 'web') return rawUrl;
    return `${getApiBaseUrl()}${rawUrl.startsWith('/') ? '' : '/'}${rawUrl}`;
  };

  const resolvedVideoUrl = resolveUrl(video.videoUrl);
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Main Video View Container */}
        <TouchableOpacity
          style={styles.videoTouchArea}
          activeOpacity={1}
          onPress={handleScreenTouch}
        >
          {visible && resolvedVideoUrl ? (
            <VideoRenderer
              ref={playerRef}
              source={resolvedVideoUrl}
              aspectRatio={aspectRatio}
              nativeControls={useNativeControls}
              onTimeUpdate={(t) => setCurrentTime(t)}
              onDurationChange={(d) => {
                if (d > 0) setDuration(d);
              }}
              onPlayingChange={(playing) => setIsPlaying(playing)}
              onBufferingChange={(buffering) => setIsBuffering(buffering)}
              onEnded={() => {
                setIsPlaying(false);
                setShowControls(true);
              }}
            />
          ) : null}

          {/* Double Tap Ripple Feedback */}
          {doubleTapSide && (
            <Animated.View
              style={[
                styles.doubleTapRipple,
                doubleTapSide === 'left' ? styles.rippleLeft : styles.rippleRight,
                { transform: [{ scale: rippleScale }] },
              ]}
            >
              {doubleTapSide === 'left' ? (
                <>
                  <RotateCcw size={32} color="#FFFFFF" />
                  <Text style={styles.rippleText}>-10s</Text>
                </>
              ) : (
                <>
                  <RotateCw size={32} color="#FFFFFF" />
                  <Text style={styles.rippleText}>+10s</Text>
                </>
              )}
            </Animated.View>
          )}

          {/* Buffering Indicator */}
          {isBuffering && (
            <View style={styles.bufferingOverlay}>
              <ActivityIndicator size="large" color="#FFFFFF" />
              <Text style={styles.bufferingText}>Loading lecture...</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* MX Player Screen Lock Floating Toggle */}
        {showControls && !useNativeControls && (
          <TouchableOpacity
            style={[styles.lockBtn, isLocked && styles.lockBtnActive]}
            onPress={() => {
              setIsLocked(!isLocked);
              resetControlsTimer();
            }}
            activeOpacity={0.7}
          >
            {isLocked ? (
              <Lock size={18} color="#FF4545" />
            ) : (
              <Unlock size={18} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        )}

        {/* MX Player Full Controls Overlay */}
        {showControls && !isLocked && !useNativeControls && (
          <Animated.View
            pointerEvents="box-none"
            style={[styles.controlsOverlay, { opacity: controlsOpacity }]}
          >
            {/* Top MX Player Bar */}
            <View style={styles.topBar}>
              <TouchableOpacity
                style={styles.topIconBtn}
                onPress={onClose}
                activeOpacity={0.7}
              >
                <ArrowLeft size={22} color="#FFFFFF" />
              </TouchableOpacity>

              <View style={styles.videoTitleWrap}>
                <View style={styles.titleBadgeRow}>
                  <View style={styles.subjectBadge}>
                    <Text style={styles.subjectBadgeText}>{video.subjectCode}</Text>
                  </View>
                  <Text style={styles.topBarTitle} numberOfLines={1}>
                    {video.title}
                  </Text>
                </View>
                <View style={styles.facultySubRow}>
                  <GraduationCap size={12} color="#FFFFFF" />
                  <Text style={styles.facultySubText}>
                    {video.instructor.name} • {video.scheme}
                  </Text>
                </View>
              </View>

              {/* Right Top Actions */}
              <View style={styles.topActions}>
                {/* HUD / Native Player Toggle */}
                {Platform.OS !== 'web' && (
                  <TouchableOpacity
                    style={styles.pillActionBtn}
                    onPress={() => setUseNativeControls(true)}
                    activeOpacity={0.7}
                  >
                    <SlidersHorizontal size={12} color="#FFFFFF" style={{ marginRight: 4 }} />
                    <Text style={styles.pillActionText}>Native</Text>
                  </TouchableOpacity>
                )}

                {/* Speed Button */}
                <TouchableOpacity
                  style={styles.pillActionBtn}
                  onPress={() => setIsSpeedMenuOpen(!isSpeedMenuOpen)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.pillActionText}>{playbackSpeed}x</Text>
                </TouchableOpacity>

                {/* Quality Button */}
                <TouchableOpacity
                  style={styles.pillActionBtn}
                  onPress={() => setIsQualityMenuOpen(!isQualityMenuOpen)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.pillActionText}>{quality.split(' ')[0]}</Text>
                </TouchableOpacity>

                {/* Download Button */}
                <TouchableOpacity
                  style={[styles.topIconBtn, downloadSuccess && styles.downloadSuccessBtn]}
                  onPress={handleDownload}
                  activeOpacity={0.7}
                >
                  {downloadSuccess ? (
                    <CheckCircle2 size={18} color="#FFFFFF" />
                  ) : (
                    <Download size={18} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Speed Selection Dropdown */}
            {isSpeedMenuOpen && (
              <View style={styles.dropdownCard}>
                <Text style={styles.dropdownTitle}>Playback Speed</Text>
                {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map((s) => (
                  <TouchableOpacity
                    key={s}
                    style={[styles.dropdownOption, playbackSpeed === s && styles.dropdownOptionSelected]}
                    onPress={() => handleSpeedChange(s)}
                  >
                    <Text style={[styles.dropdownOptionText, playbackSpeed === s && styles.dropdownOptionTextActive]}>
                      {s === 1.0 ? 'Normal (1.0x)' : `${s}x`}
                    </Text>
                    {playbackSpeed === s && <Text style={styles.dropdownTick}>✓</Text>}
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Quality Selection Dropdown */}
            {isQualityMenuOpen && (
              <View style={[styles.dropdownCard, { right: 50 }]}>
                <Text style={styles.dropdownTitle}>Video Quality</Text>
                {['4K UHD', '1080p FHD', '720p HD', '480p SD', 'Auto'].map((q) => (
                  <TouchableOpacity
                    key={q}
                    style={[styles.dropdownOption, quality === q && styles.dropdownOptionSelected]}
                    onPress={() => {
                      setQuality(q);
                      setIsQualityMenuOpen(false);
                      resetControlsTimer();
                    }}
                  >
                    <Text style={[styles.dropdownOptionText, quality === q && styles.dropdownOptionTextActive]}>
                      {q}
                    </Text>
                    {quality === q && <Text style={styles.dropdownTick}>✓</Text>}
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Center Controls: Prev, -10s, Play/Pause, +10s, Next */}
            <View style={styles.centerControls}>
              {onPrevVideo && (
                <TouchableOpacity style={styles.skipBtn} onPress={onPrevVideo} activeOpacity={0.7}>
                  <SkipBack size={24} color="#FFFFFF" />
                </TouchableOpacity>
              )}

              <TouchableOpacity style={styles.seekBtn} onPress={() => seekBy(-10)} activeOpacity={0.7}>
                <RotateCcw size={28} color="#FFFFFF" />
                <Text style={styles.seekBtnText}>10</Text>
              </TouchableOpacity>

              {/* Big MX Player Play/Pause Button */}
              <TouchableOpacity
                style={styles.mainPlayBtn}
                onPress={togglePlay}
                activeOpacity={0.8}
              >
                {isPlaying ? (
                  <Pause size={36} color="#000000" />
                ) : (
                  <Play size={36} color="#000000" style={{ marginLeft: 4 }} />
                )}
              </TouchableOpacity>

              <TouchableOpacity style={styles.seekBtn} onPress={() => seekBy(10)} activeOpacity={0.7}>
                <RotateCw size={28} color="#FFFFFF" />
                <Text style={styles.seekBtnText}>10</Text>
              </TouchableOpacity>

              {onNextVideo && (
                <TouchableOpacity style={styles.skipBtn} onPress={onNextVideo} activeOpacity={0.7}>
                  <SkipForward size={24} color="#FFFFFF" />
                </TouchableOpacity>
              )}
            </View>

            {/* Bottom Scrubber & Controls Bar */}
            <View style={styles.bottomBar}>
              {/* Progress Slider Bar */}
              <View style={styles.scrubberContainer}>
                <Text style={styles.timeText}>{formatTime(currentTime)}</Text>

                <TouchableOpacity
                  style={styles.trackContainer}
                  activeOpacity={1}
                  onPress={(e) => {
                    const { locationX } = e.nativeEvent;
                    const trackWidth = SCREEN_WIDTH - 140;
                    const percent = Math.max(0, Math.min(1, locationX / trackWidth));
                    const newTime = percent * duration;
                    if (playerRef.current) {
                      playerRef.current.seekTo(newTime);
                    }
                    setCurrentTime(newTime);
                    resetControlsTimer();
                  }}
                >
                  <View style={styles.trackBackground}>
                    <View style={[styles.trackFill, { width: `${progressPercent}%` }]} />
                    <View style={[styles.trackThumb, { left: `${progressPercent}%` }]} />
                  </View>
                </TouchableOpacity>

                <Text style={styles.timeText}>{formatTime(duration)}</Text>
              </View>

              {/* Secondary Controls: Mute, Aspect Ratio, Close */}
              <View style={styles.bottomButtonsRow}>
                <View style={styles.bottomLeftControls}>
                  <TouchableOpacity
                    style={styles.bottomIconBtn}
                    onPress={handleMuteToggle}
                  >
                    {isMuted ? (
                      <VolumeX size={18} color="#FF4545" />
                    ) : (
                      <Volume2 size={18} color="#FFFFFF" />
                    )}
                  </TouchableOpacity>

                  <Text style={styles.qualityFooterText}>
                    {video.branch} • {video.scheme} • {video.fileSize}
                  </Text>
                </View>

                <View style={styles.bottomRightControls}>
                  {/* Aspect Ratio Mode */}
                  <TouchableOpacity
                    style={styles.aspectBtn}
                    onPress={() => {
                      const modes: ('contain' | 'cover' | 'fill')[] = ['contain', 'cover', 'fill'];
                      const nextIndex = (modes.indexOf(aspectRatio) + 1) % modes.length;
                      setAspectRatio(modes[nextIndex]);
                    }}
                  >
                    <Text style={styles.aspectBtnText}>
                      {aspectRatio === 'contain' ? 'FIT' : aspectRatio === 'cover' ? 'FILL' : 'STRETCH'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Animated.View>
        )}

        {/* Floating Switch Back button when using Native Controls on mobile */}
        {useNativeControls && (
          <TouchableOpacity
            style={styles.floatingCloseNativeBtn}
            onPress={() => setUseNativeControls(false)}
            activeOpacity={0.8}
          >
            <ArrowLeft size={16} color="#FFFFFF" />
            <Text style={styles.floatingCloseNativeText}>MX Player HUD</Text>
          </TouchableOpacity>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    position: 'relative',
  },
  videoTouchArea: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bufferingOverlay: {
    position: 'absolute',
    alignItems: 'center',
    gap: 8,
  },
  bufferingText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  doubleTapRipple: {
    position: 'absolute',
    top: '40%',
    padding: 20,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    zIndex: 30,
  },
  rippleLeft: {
    left: '15%',
  },
  rippleRight: {
    right: '15%',
  },
  rippleText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    marginTop: 4,
  },
  lockBtn: {
    position: 'absolute',
    left: 20,
    top: Platform.OS === 'ios' ? 54 : 20,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(18, 18, 24, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    zIndex: 50,
  },
  lockBtnActive: {
    borderColor: '#FF4545',
    backgroundColor: 'rgba(255, 69, 69, 0.2)',
  },
  controlsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'space-between',
    zIndex: 40,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
    paddingBottom: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    gap: 12,
  },
  topIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(27, 27, 41, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  videoTitleWrap: {
    flex: 1,
  },
  titleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  subjectBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  subjectBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
  topBarTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
  facultySubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  facultySubText: {
    color: '#8D8D94',
    fontSize: 11,
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pillActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(27, 27, 41, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  pillActionText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  downloadSuccessBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: '#FFFFFF',
  },
  dropdownCard: {
    position: 'absolute',
    top: 70,
    right: 16,
    backgroundColor: '#121218',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    padding: 12,
    zIndex: 60,
    width: 170,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  dropdownTitle: {
    color: '#8D8D94',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  dropdownOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  dropdownOptionSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 6,
    paddingHorizontal: 6,
  },
  dropdownOptionText: {
    color: '#B8B8C2',
    fontSize: 12,
  },
  dropdownOptionTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  dropdownTick: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  centerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  mainPlayBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  seekBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  seekBtnText: {
    position: 'absolute',
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    top: 10,
  },
  skipBtn: {
    padding: 10,
  },
  bottomBar: {
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 36 : 16,
    paddingTop: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
  },
  scrubberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  timeText: {
    color: '#B8B8C2',
    fontSize: 11,
    fontWeight: '600',
    minWidth: 42,
    textAlign: 'center',
  },
  trackContainer: {
    flex: 1,
    height: 30,
    justifyContent: 'center',
  },
  trackBackground: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    position: 'relative',
  },
  trackFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  trackThumb: {
    position: 'absolute',
    top: -5,
    marginLeft: -7,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  bottomButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bottomLeftControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bottomIconBtn: {
    padding: 8,
  },
  qualityFooterText: {
    color: '#8D8D94',
    fontSize: 11,
  },
  bottomRightControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  aspectBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  aspectBtnText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  floatingCloseNativeBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    zIndex: 99,
  },
  floatingCloseNativeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
