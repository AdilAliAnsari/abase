import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Share,
  Dimensions,
  ScrollView,
} from 'react-native';
import {
  X,
  ExternalLink,
  Download,
  Share2,
  FileText,
  Eye,
  CheckCircle2,
  Sparkles,
  Layers,
  HardDrive,
  Calendar,
  Star,
  BookOpen,
} from 'lucide-react-native';
import { colors } from '../theme/colors';
import { PDFItem } from '../data/pdfs';
import {
  getDriveViewerEmbedUrl,
  openInDriveViewer,
  downloadPdfFile,
  sharePdf,
  isGoogleDriveUrl,
} from '../utils/pdfViewerUtils';

interface PDFViewerModalProps {
  visible: boolean;
  pdf: PDFItem | null;
  onClose: () => void;
  onDownloadFeedback?: (title: string) => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const PDFViewerModal: React.FC<PDFViewerModalProps> = ({
  visible,
  pdf,
  onClose,
  onDownloadFeedback,
}) => {
  const [iframeLoading, setIframeLoading] = useState(true);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!pdf) return null;

  const embedUrl = getDriveViewerEmbedUrl(pdf.pdfUrl);

  const handleOpenDrive = async () => {
    await openInDriveViewer(pdf.pdfUrl, pdf.title);
  };

  const handleDownload = async () => {
    setDownloadSuccess(true);
    if (onDownloadFeedback) {
      onDownloadFeedback(pdf.title);
    }
    await downloadPdfFile(pdf.pdfUrl, pdf.title);
    setTimeout(() => {
      setDownloadSuccess(false);
    }, 3000);
  };

  const handleShare = async () => {
    await sharePdf(pdf.pdfUrl, pdf.title);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Top Header Toolbar */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onClose}
            activeOpacity={0.7}
            accessibilityLabel="Close viewer"
          >
            <X size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {pdf.title}
            </Text>
            <View style={styles.headerSubRow}>
              <View style={styles.driveBadge}>
                <Text style={styles.driveBadgeText}>Google Drive Viewer</Text>
              </View>
              <Text style={styles.headerSubtitle} numberOfLines={1}>
                {pdf.author} • {pdf.fileSize}
              </Text>
            </View>
          </View>

          {/* Action Icons */}
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={handleShare}
              activeOpacity={0.7}
              accessibilityLabel="Share"
            >
              <Share2 size={17} color="#B8B8C2" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.iconBtn, styles.driveLaunchBtn]}
              onPress={handleOpenDrive}
              activeOpacity={0.7}
              accessibilityLabel="Open in Phone Drive Viewer"
            >
              <ExternalLink size={16} color="#0B2405" />
              <Text style={styles.driveLaunchBtnText}>Drive</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.iconBtn, styles.downloadBtn, downloadSuccess && styles.downloadBtnSuccess]}
              onPress={handleDownload}
              activeOpacity={0.7}
              accessibilityLabel="Download PDF"
            >
              {downloadSuccess ? (
                <CheckCircle2 size={17} color="#FFFFFF" />
              ) : (
                <Download size={17} color="#0B2405" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Main Content Area */}
        <View style={styles.viewerBody}>
          {Platform.OS === 'web' ? (
            <View style={styles.webViewerContainer}>
              {iframeLoading && (
                <View style={styles.loadingOverlay}>
                  <ActivityIndicator size="large" color="#69D900" />
                  <Text style={styles.loadingText}>Connecting to Google Drive Viewer...</Text>
                  <Text style={styles.loadingSubtext}>Rendering document in high-fidelity mode</Text>
                </View>
              )}
              {/* Google Drive / Docs Embedded Viewer */}
              <iframe
                src={embedUrl}
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  backgroundColor: '#1B1B29',
                }}
                title={pdf.title}
                onLoad={() => setIframeLoading(false)}
                allow="fullscreen"
              />
            </View>
          ) : (
            /* Mobile Native In-App Experience */
            <ScrollView
              style={styles.mobileScroll}
              contentContainerStyle={styles.mobileContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Document Overview Banner */}
              <View style={styles.previewCard}>
                <View style={styles.docIconWrap}>
                  <FileText size={48} color="#69D900" />
                  <View style={styles.pdfFormatBadge}>
                    <Text style={styles.pdfFormatBadgeText}>PDF</Text>
                  </View>
                </View>

                <Text style={styles.previewTitle}>{pdf.title}</Text>
                <Text style={styles.previewAuthor}>By {pdf.author}</Text>

                <View style={styles.pillRow}>
                  <View style={styles.pill}>
                    <Layers size={13} color="#69D900" />
                    <Text style={styles.pillText}>{pdf.pageCount} Pages</Text>
                  </View>
                  <View style={styles.pill}>
                    <HardDrive size={13} color="#69D900" />
                    <Text style={styles.pillText}>{pdf.fileSize}</Text>
                  </View>
                  <View style={styles.pill}>
                    <Star size={13} color="#FF9900" fill="#FF9900" />
                    <Text style={styles.pillText}>{pdf.rating.toFixed(1)}</Text>
                  </View>
                  <View style={styles.pill}>
                    <Calendar size={13} color="#69D900" />
                    <Text style={styles.pillText}>{pdf.publishedYear}</Text>
                  </View>
                </View>

                {/* Main Launch Button for Mobile Drive Viewer */}
                <TouchableOpacity
                  style={styles.bigDriveBtn}
                  onPress={handleOpenDrive}
                  activeOpacity={0.8}
                >
                  <Eye size={20} color="#0B2405" />
                  <Text style={styles.bigDriveBtnText}>Open in Google Drive Viewer</Text>
                  <ExternalLink size={18} color="#0B2405" />
                </TouchableOpacity>

                <Text style={styles.driveNotice}>
                  🚀 Opens with Google Drive's native renderer with smooth zoom, search, bookmarks & print on your phone!
                </Text>

                {/* Secondary Download Button */}
                <TouchableOpacity
                  style={[styles.bigDownloadBtn, downloadSuccess && styles.bigDownloadBtnSuccess]}
                  onPress={handleDownload}
                  activeOpacity={0.8}
                >
                  {downloadSuccess ? (
                    <>
                      <CheckCircle2 size={18} color="#FFFFFF" />
                      <Text style={[styles.bigDownloadBtnText, { color: '#FFFFFF' }]}>
                        Download Started!
                      </Text>
                    </>
                  ) : (
                    <>
                      <Download size={18} color="#69D900" />
                      <Text style={styles.bigDownloadBtnText}>Download PDF to Device</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>

              {/* Description Section */}
              <View style={styles.infoSection}>
                <Text style={styles.sectionHeader}>Overview</Text>
                <Text style={styles.descriptionText}>{pdf.description}</Text>
              </View>

              {/* Tags Section */}
              {pdf.tags && pdf.tags.length > 0 && (
                <View style={styles.infoSection}>
                  <Text style={styles.sectionHeader}>Topics & Tags</Text>
                  <View style={styles.tagsContainer}>
                    {pdf.tags.map((tag, idx) => (
                      <View key={idx} style={styles.tagPill}>
                        <Text style={styles.tagText}>#{tag}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </ScrollView>
          )}
        </View>

        {/* Bottom Floating Status Bar */}
        <View style={styles.bottomBar}>
          <View style={styles.bottomInfo}>
            <Sparkles size={14} color="#69D900" />
            <Text style={styles.bottomInfoText}>
              Powered by Google Drive Document Rendering System
            </Text>
          </View>
          <TouchableOpacity
            style={styles.bottomOpenBtn}
            onPress={handleOpenDrive}
            activeOpacity={0.8}
          >
            <ExternalLink size={14} color="#69D900" />
            <Text style={styles.bottomOpenBtnText}>Open System Viewer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0E',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 52 : 16,
    paddingBottom: 14,
    backgroundColor: 'rgba(18, 18, 24, 0.96)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(105, 217, 0, 0.18)',
    zIndex: 20,
    elevation: 6,
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(27, 27, 41, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitleWrap: {
    flex: 1,
    marginHorizontal: 12,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  headerSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 3,
  },
  driveBadge: {
    backgroundColor: 'rgba(105, 217, 0, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(105, 217, 0, 0.3)',
  },
  driveBadgeText: {
    color: '#69D900',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    color: '#8D8D94',
    fontSize: 11,
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    height: 36,
    paddingHorizontal: 10,
    borderRadius: 18,
    backgroundColor: 'rgba(27, 27, 41, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(105, 217, 0, 0.15)',
    flexDirection: 'row',
    gap: 4,
  },
  driveLaunchBtn: {
    backgroundColor: '#69D900',
    borderColor: '#7BEA12',
    paddingHorizontal: 12,
  },
  driveLaunchBtnText: {
    color: '#0B2405',
    fontSize: 12,
    fontWeight: '800',
  },
  downloadBtn: {
    backgroundColor: '#69D900',
    borderColor: '#7BEA12',
    width: 36,
    paddingHorizontal: 0,
  },
  downloadBtnSuccess: {
    backgroundColor: '#067D62',
    borderColor: '#056B54',
  },
  viewerBody: {
    flex: 1,
    backgroundColor: '#050508',
  },
  webViewerContainer: {
    flex: 1,
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0E0E14',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    gap: 12,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  loadingSubtext: {
    color: '#8D8D94',
    fontSize: 12,
  },
  mobileScroll: {
    flex: 1,
  },
  mobileContent: {
    padding: 20,
    paddingBottom: 40,
  },
  previewCard: {
    backgroundColor: 'rgba(18, 22, 16, 0.85)',
    borderRadius: 18,
    padding: 22,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(105, 217, 0, 0.22)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 8,
    marginBottom: 20,
  },
  docIconWrap: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(105, 217, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(105, 217, 0, 0.25)',
    position: 'relative',
  },
  pdfFormatBadge: {
    position: 'absolute',
    bottom: -4,
    backgroundColor: '#69D900',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  pdfFormatBadgeText: {
    color: '#0B2405',
    fontSize: 10,
    fontWeight: '900',
  },
  previewTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
    lineHeight: 24,
  },
  previewAuthor: {
    color: '#69D900',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 22,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(27, 27, 41, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(105, 217, 0, 0.12)',
  },
  pillText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  bigDriveBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#69D900',
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: '#69D900',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
    marginBottom: 10,
  },
  bigDriveBtnText: {
    color: '#0B2405',
    fontSize: 15,
    fontWeight: '800',
  },
  driveNotice: {
    color: '#8D8D94',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  bigDownloadBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(27, 27, 41, 0.9)',
    borderWidth: 1.5,
    borderColor: 'rgba(105, 217, 0, 0.4)',
    paddingVertical: 12,
    borderRadius: 14,
  },
  bigDownloadBtnSuccess: {
    backgroundColor: '#067D62',
    borderColor: '#056B54',
  },
  bigDownloadBtnText: {
    color: '#69D900',
    fontSize: 14,
    fontWeight: '700',
  },
  infoSection: {
    backgroundColor: 'rgba(18, 18, 24, 0.7)',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(105, 217, 0, 0.12)',
    marginBottom: 14,
  },
  sectionHeader: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  descriptionText: {
    color: '#B8B8C2',
    fontSize: 13,
    lineHeight: 20,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagPill: {
    backgroundColor: 'rgba(105, 217, 0, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(105, 217, 0, 0.2)',
  },
  tagText: {
    color: '#69D900',
    fontSize: 11,
    fontWeight: '600',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(18, 18, 24, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(105, 217, 0, 0.15)',
  },
  bottomInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  bottomInfoText: {
    color: '#8D8D94',
    fontSize: 11,
  },
  bottomOpenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(105, 217, 0, 0.12)',
  },
  bottomOpenBtnText: {
    color: '#69D900',
    fontSize: 11,
    fontWeight: '700',
  },
});
