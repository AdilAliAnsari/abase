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
  FileText,
  Download,
  Eye,
  Star,
  Layers,
  HardDrive,
  CheckCircle2,
  BadgeCheck,
  GraduationCap,
  Building2,
} from 'lucide-react-native';
import { colors } from '../theme/colors';
import { PDFItem } from '../data/pdfs';

interface PDFCardProps {
  pdf: PDFItem;
  layout?: 'grid' | 'list';
  onView: (pdf: PDFItem) => void;
  onDownload: (pdf: PDFItem) => void;
  onShare?: (pdf: PDFItem) => void;
}

export const PDFCard: React.FC<PDFCardProps> = ({
  pdf,
  layout = 'list',
  onView,
  onDownload,
}) => {
  const [downloading, setDownloading] = useState(false);

  const handleDownloadPress = async () => {
    setDownloading(true);
    await onDownload(pdf);
    setTimeout(() => setDownloading(false), 2500);
  };

  const isGrid = layout === 'grid';

  if (isGrid) {
    return (
      <View style={styles.gridCard}>
        {/* Cover & Badges */}
        <View style={styles.gridCoverWrap}>
          <Image
            source={{ uri: pdf.coverImage }}
            style={styles.gridCover}
            resizeMode="cover"
          />
          {/* Scheme Badge */}
          <View style={styles.schemePill}>
            <Text style={styles.schemePillText}>{pdf.scheme}</Text>
          </View>

          {/* Branch & Sem pill */}
          <View style={styles.branchPill}>
            <Text style={styles.branchPillText}>{pdf.branch} • S{pdf.semester}</Text>
          </View>

          {pdf.badge && (
            <View
              style={[
                styles.badgePill,
                pdf.badge === 'TOP RATED' && styles.badgeTopRated,
                pdf.badge === 'EXAM READY' && styles.badgeExamReady,
                pdf.badge === 'FEATURED' && styles.badgeFeatured,
                pdf.badge === 'POPULAR' && styles.badgePopular,
                pdf.badge === 'NEW' && styles.badgeNew,
              ]}
            >
              <Text style={styles.badgePillText}>{pdf.badge}</Text>
            </View>
          )}
        </View>

        {/* Content Body */}
        <View style={styles.gridBody}>
          <View style={styles.categoryRow}>
            <View style={styles.subjectCodeBox}>
              <Text style={styles.subjectCodeText}>{pdf.subjectCode}</Text>
            </View>
            <View style={styles.ratingBox}>
              <Star size={11} color="#FF9900" fill="#FF9900" />
              <Text style={styles.ratingText}>{pdf.rating.toFixed(1)}</Text>
            </View>
          </View>

          <Text style={styles.gridTitle} numberOfLines={2}>
            {pdf.title}
          </Text>

          {/* Lecturer / Seller */}
          <View style={styles.lecturerRow}>
            <GraduationCap size={12} color="#69D900" />
            <Text style={styles.gridAuthor} numberOfLines={1}>
              {pdf.lecturer?.name || pdf.author}
            </Text>
            {pdf.lecturer?.verified && (
              <BadgeCheck size={12} color="#69D900" />
            )}
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Layers size={11} color="#69D900" />
              <Text style={styles.metaText}>{pdf.pageCount} pgs</Text>
            </View>
            <View style={styles.metaItem}>
              <HardDrive size={11} color="#69D900" />
              <Text style={styles.metaText}>{pdf.fileSize}</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.gridActions}>
            <TouchableOpacity
              style={styles.viewBtn}
              onPress={() => onView(pdf)}
              activeOpacity={0.8}
            >
              <Eye size={13} color="#0B2405" />
              <Text style={styles.viewBtnText}>View Drive</Text>
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
      {/* Cover Image with Scheme & Branch tags */}
      <View style={styles.listCoverWrap}>
        <Image
          source={{ uri: pdf.coverImage }}
          style={styles.listCover}
          resizeMode="cover"
        />
        <View style={styles.schemePillList}>
          <Text style={styles.schemePillText}>{pdf.scheme}</Text>
        </View>
        <View style={styles.branchPillList}>
          <Text style={styles.branchPillText}>{pdf.branch} • Sem {pdf.semester}</Text>
        </View>
      </View>

      {/* Info Container */}
      <View style={styles.listBody}>
        {/* Top Header Row */}
        <View style={styles.listHeaderRow}>
          <View style={styles.badgeGroup}>
            <View style={styles.subjectCodeBox}>
              <Text style={styles.subjectCodeText}>{pdf.subjectCode}</Text>
            </View>
            <View style={styles.materialPillWrap}>
              <Text style={styles.materialText}>{pdf.materialType}</Text>
            </View>
          </View>
          <View style={styles.ratingBox}>
            <Star size={12} color="#FF9900" fill="#FF9900" />
            <Text style={styles.ratingText}>{pdf.rating.toFixed(1)}</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.listTitle} numberOfLines={2}>
          {pdf.title}
        </Text>

        {/* Lecturer / Faculty Seller Details */}
        <View style={styles.lecturerDetailsBox}>
          <View style={styles.lecturerNameRow}>
            <GraduationCap size={13} color="#69D900" />
            <Text style={styles.lecturerNameText}>
              By <Text style={styles.lecturerHighlight}>{pdf.lecturer?.name || pdf.author}</Text>
            </Text>
            {pdf.lecturer?.verified && (
              <View style={styles.verifiedBadge}>
                <BadgeCheck size={12} color="#0B2405" />
                <Text style={styles.verifiedBadgeText}>Faculty</Text>
              </View>
            )}
          </View>
          {pdf.lecturer?.institution && (
            <Text style={styles.institutionText} numberOfLines={1}>
              {pdf.lecturer.department} • {pdf.lecturer.institution}
            </Text>
          )}
        </View>

        {/* Description */}
        <Text style={styles.listDesc} numberOfLines={2}>
          {pdf.description}
        </Text>

        {/* Footer Meta & Actions */}
        <View style={styles.listFooter}>
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Layers size={12} color="#69D900" />
              <Text style={styles.metaText}>{pdf.pageCount} pgs</Text>
            </View>
            <View style={styles.metaItem}>
              <HardDrive size={12} color="#69D900" />
              <Text style={styles.metaText}>{pdf.fileSize}</Text>
            </View>
          </View>

          <View style={styles.actionBtnGroup}>
            <TouchableOpacity
              style={styles.viewBtnList}
              onPress={() => onView(pdf)}
              activeOpacity={0.8}
            >
              <Eye size={14} color="#0B2405" />
              <Text style={styles.viewBtnListText}>View in Drive</Text>
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
  gridCoverWrap: {
    width: '100%',
    height: 140,
    backgroundColor: '#121218',
    position: 'relative',
  },
  gridCover: {
    width: '100%',
    height: '100%',
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
  branchPill: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: 'rgba(27, 27, 41, 0.92)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  branchPillText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  badgePill: {
    position: 'absolute',
    top: 6,
    right: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeTopRated: {
    backgroundColor: '#69D900',
  },
  badgeExamReady: {
    backgroundColor: '#C45500',
  },
  badgeFeatured: {
    backgroundColor: '#007600',
  },
  badgePopular: {
    backgroundColor: '#FF5A2B',
  },
  badgeNew: {
    backgroundColor: '#0084FF',
  },
  badgePillText: {
    color: '#0B2405',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.3,
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
    letterSpacing: 0.4,
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
  viewBtn: {
    flex: 1,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#69D900',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  viewBtnText: {
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
  listCoverWrap: {
    width: 95,
    height: 142,
    borderRadius: 8,
    backgroundColor: '#121218',
    overflow: 'hidden',
    position: 'relative',
  },
  listCover: {
    width: '100%',
    height: '100%',
  },
  schemePillList: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: 'rgba(11, 36, 5, 0.92)',
    borderWidth: 1,
    borderColor: '#69D900',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  branchPillList: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: 'rgba(27, 27, 41, 0.92)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
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
  materialPillWrap: {
    backgroundColor: 'rgba(27, 27, 41, 0.85)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  materialText: {
    color: '#B8B8C2',
    fontSize: 10,
    fontWeight: '600',
  },
  listTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 19,
    marginTop: 3,
  },
  lecturerDetailsBox: {
    marginVertical: 3,
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
    marginTop: 1,
  },
  listDesc: {
    color: '#B8B8C2',
    fontSize: 11,
    lineHeight: 16,
    marginVertical: 3,
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
  viewBtnList: {
    height: 32,
    paddingHorizontal: 10,
    borderRadius: 7,
    backgroundColor: '#69D900',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  viewBtnListText: {
    color: '#0B2405',
    fontSize: 11,
    fontWeight: '800',
  },
  downloadBtnList: {
    height: 32,
    paddingHorizontal: 9,
    borderRadius: 7,
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
