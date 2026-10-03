import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import {
  Play,
  Download,
  Star,
  Clock,
  Eye,
  CheckCircle2,
  BadgeCheck,
  GraduationCap,
  HardDrive,
  Tv,
} from 'lucide-react-native';
import { colors } from '../theme/colors';
import { VideoItem } from '../data/videos';

interface VideoCardProps {
  video: VideoItem;
  layout?: 'grid' | 'list';
  onPlay: (video: VideoItem) => void;
  onDownload: (video: VideoItem) => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({
  video,
  layout = 'list',
  onPlay,
  onDownload,
}) => {
  const [downloading, setDownloading] = useState(false);

  const handleDownloadPress = async () => {
    setDownloading(true);
    await onDownload(video);
    setTimeout(() => setDownloading(false), 2500);
  };

  const isGrid = layout === 'grid';

  if (isGrid) {
    return (
      <View style={styles.gridCard}>
        {/* Thumbnail & Badges */}
        <TouchableOpacity
          style={styles.gridThumbnailWrap}
          activeOpacity={0.85}
          onPress={() => onPlay(video)}
        >
          <Image
            source={{ uri: video.thumbnail }}
            style={styles.gridThumbnail}
            resizeMode="cover"
          />

          {/* Duration Badge */}
          <View style={styles.durationPill}>
            <Clock size={10} color="#FFFFFF" />
            <Text style={styles.durationPillText}>{video.duration}</Text>
          </View>

          {/* Scheme Pill */}
          <View style={styles.schemePill}>
            <Text style={styles.schemePillText}>{video.scheme}</Text>
          </View>

          {/* Big Play Overlay */}
          <View style={styles.playOverlay}>
            <View style={styles.playIconCircle}>
              <Play size={18} color="#0B2405" style={{ marginLeft: 2 }} />
            </View>
          </View>

          {/* Quality Tag */}
          <View style={styles.qualityPill}>
            <Text style={styles.qualityPillText}>{video.quality.split(' ')[0]}</Text>
          </View>
        </TouchableOpacity>

        {/* Card Body */}
        <View style={styles.gridBody}>
          <View style={styles.categoryRow}>
            <View style={styles.subjectCodeBox}>
              <Text style={styles.subjectCodeText}>{video.subjectCode}</Text>
            </View>
            <View style={styles.ratingBox}>
              <Star size={11} color="#FF9900" fill="#FF9900" />
              <Text style={styles.ratingText}>{video.rating.toFixed(1)}</Text>
            </View>
          </View>

          <Text style={styles.gridTitle} numberOfLines={2}>
            {video.title}
          </Text>

          {/* Lecturer / Faculty */}
          <View style={styles.lecturerRow}>
            <GraduationCap size={12} color="#69D900" />
            <Text style={styles.gridAuthor} numberOfLines={1}>
              {video.instructor.name}
            </Text>
            {video.instructor.verified && (
              <BadgeCheck size={12} color="#69D900" />
            )}
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Eye size={11} color="#69D900" />
              <Text style={styles.metaText}>{(video.viewsCount / 1000).toFixed(1)}k views</Text>
            </View>
            <View style={styles.metaItem}>
              <HardDrive size={11} color="#69D900" />
              <Text style={styles.metaText}>{video.fileSize}</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.gridActions}>
            <TouchableOpacity
              style={styles.playBtn}
              onPress={() => onPlay(video)}
              activeOpacity={0.8}
            >
              <Play size={13} color="#0B2405" />
              <Text style={styles.playBtnText}>Play Video</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.downloadBtn, downloading && styles.downloadBtnActive]}
              onPress={handleDownloadPress}
              activeOpacity={0.8}
            >
              {downloading ? (
                <CheckCircle2 size={15} color="#FFFFFF" />
              ) : (
                <Download size={15} color="#69D900" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // Horizontal List Layout
  return (
    <View style={styles.listCard}>
      {/* Thumbnail with Play Icon & Badges */}
      <TouchableOpacity
        style={styles.listThumbnailWrap}
        activeOpacity={0.85}
        onPress={() => onPlay(video)}
      >
        <Image
          source={{ uri: video.thumbnail }}
          style={styles.listThumbnail}
          resizeMode="cover"
        />
        <View style={styles.durationPillList}>
          <Clock size={10} color="#FFFFFF" />
          <Text style={styles.durationPillText}>{video.duration}</Text>
        </View>
        <View style={styles.schemePillList}>
          <Text style={styles.schemePillText}>{video.branch} • S{video.semester}</Text>
        </View>
        <View style={styles.playOverlaySmall}>
          <View style={styles.playIconCircleSmall}>
            <Play size={14} color="#0B2405" style={{ marginLeft: 2 }} />
          </View>
        </View>
      </TouchableOpacity>

      {/* Info Body */}
      <View style={styles.listBody}>
        {/* Header Row */}
        <View style={styles.listHeaderRow}>
          <View style={styles.badgeGroup}>
            <View style={styles.subjectCodeBox}>
              <Text style={styles.subjectCodeText}>{video.subjectCode}</Text>
            </View>
            <View style={styles.schemeTag}>
              <Text style={styles.schemeTagText}>{video.scheme}</Text>
            </View>
          </View>
          <View style={styles.ratingBox}>
            <Star size={12} color="#FF9900" fill="#FF9900" />
            <Text style={styles.ratingText}>{video.rating.toFixed(1)}</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.listTitle} numberOfLines={2}>
          {video.title}
        </Text>

        {/* Lecturer details */}
        <View style={styles.lecturerDetailsBox}>
          <View style={styles.lecturerNameRow}>
            <GraduationCap size={13} color="#69D900" />
            <Text style={styles.lecturerNameText}>
              By <Text style={styles.lecturerHighlight}>{video.instructor.name}</Text>
            </Text>
            {video.instructor.verified && (
              <View style={styles.verifiedBadge}>
                <BadgeCheck size={12} color="#0B2405" />
                <Text style={styles.verifiedBadgeText}>Faculty</Text>
              </View>
            )}
          </View>
          <Text style={styles.institutionText} numberOfLines={1}>
            {video.instructor.department} • {video.instructor.institution}
          </Text>
        </View>

        {/* Footer Meta & Actions */}
        <View style={styles.listFooter}>
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Eye size={12} color="#69D900" />
              <Text style={styles.metaText}>{(video.viewsCount / 1000).toFixed(1)}k views</Text>
            </View>
            <View style={styles.metaItem}>
              <HardDrive size={12} color="#69D900" />
              <Text style={styles.metaText}>{video.fileSize}</Text>
            </View>
          </View>

          <View style={styles.actionBtnGroup}>
            <TouchableOpacity
              style={styles.playBtnList}
              onPress={() => onPlay(video)}
              activeOpacity={0.8}
            >
              <Play size={13} color="#0B2405" />
              <Text style={styles.playBtnListText}>Watch Video</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.downloadBtnList, downloading && styles.downloadBtnActive]}
              onPress={handleDownloadPress}
              activeOpacity={0.8}
            >
              {downloading ? (
                <>
                  <CheckCircle2 size={13} color="#FFFFFF" />
                  <Text style={[styles.downloadBtnListText, { color: '#FFFFFF' }]}>
                    Saved
                  </Text>
                </>
              ) : (
                <>
                  <Download size={13} color="#69D900" />
                  <Text style={styles.downloadBtnListText}>Download</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Grid Styles
  gridCard: {
    width: '48%',
    backgroundColor: 'rgba(18, 22, 16, 0.75)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(105, 217, 0, 0.18)',
    overflow: 'hidden',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  gridThumbnailWrap: {
    width: '100%',
    height: 125,
    backgroundColor: '#121218',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridThumbnail: {
    width: '100%',
    height: '100%',
  },
  durationPill: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationPillText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  schemePill: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: 'rgba(11, 36, 5, 0.92)',
    borderWidth: 1,
    borderColor: '#69D900',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  schemePillText: {
    color: '#69D900',
    fontSize: 9,
    fontWeight: '800',
  },
  qualityPill: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#007600',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 3,
  },
  qualityPillText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '900',
  },
  playOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#69D900',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#69D900',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 6,
  },
  gridBody: {
    padding: 10,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  subjectCodeBox: {
    backgroundColor: 'rgba(105, 217, 0, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(105, 217, 0, 0.25)',
  },
  subjectCodeText: {
    color: '#69D900',
    fontSize: 9,
    fontWeight: '800',
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  gridTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
    marginBottom: 4,
  },
  lecturerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  gridAuthor: {
    color: '#B8B8C2',
    fontSize: 11,
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    color: '#8D8D94',
    fontSize: 11,
  },
  gridActions: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 2,
  },
  playBtn: {
    flex: 1,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#69D900',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  playBtnText: {
    color: '#0B2405',
    fontSize: 11,
    fontWeight: '800',
  },
  downloadBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: 'rgba(27, 27, 41, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(105, 217, 0, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadBtnActive: {
    backgroundColor: '#067D62',
    borderColor: '#056B54',
  },

  // List Styles
  listCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(18, 22, 16, 0.75)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(105, 217, 0, 0.18)',
    overflow: 'hidden',
    marginBottom: 12,
    padding: 10,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  listThumbnailWrap: {
    width: 120,
    height: 120,
    borderRadius: 8,
    backgroundColor: '#121218',
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listThumbnail: {
    width: '100%',
    height: '100%',
  },
  durationPillList: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  schemePillList: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: 'rgba(11, 36, 5, 0.92)',
    borderWidth: 1,
    borderColor: '#69D900',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  playOverlaySmall: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIconCircleSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#69D900',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#69D900',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  listBody: {
    flex: 1,
    justifyContent: 'space-between',
  },
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  schemeTag: {
    backgroundColor: 'rgba(27, 27, 41, 0.85)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  schemeTagText: {
    color: '#B8B8C2',
    fontSize: 10,
    fontWeight: '600',
  },
  listTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
    marginTop: 2,
  },
  lecturerDetailsBox: {
    marginVertical: 2,
  },
  lecturerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  lecturerNameText: {
    color: '#8D8D94',
    fontSize: 11,
  },
  lecturerHighlight: {
    color: '#69D900',
    fontWeight: '700',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#69D900',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    marginLeft: 4,
  },
  verifiedBadgeText: {
    color: '#0B2405',
    fontSize: 9,
    fontWeight: '800',
  },
  institutionText: {
    color: '#8D8D94',
    fontSize: 10,
  },
  listFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  actionBtnGroup: {
    flexDirection: 'row',
    gap: 6,
  },
  playBtnList: {
    height: 30,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: '#69D900',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  playBtnListText: {
    color: '#0B2405',
    fontSize: 11,
    fontWeight: '800',
  },
  downloadBtnList: {
    height: 30,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: 'rgba(27, 27, 41, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(105, 217, 0, 0.25)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  downloadBtnListText: {
    color: '#69D900',
    fontSize: 11,
    fontWeight: '700',
  },
});
