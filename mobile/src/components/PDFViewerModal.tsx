import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
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
  Smartphone,
  ChevronRight,
  ShieldCheck,
  Check,
} from 'lucide-react-native';
import { colors } from '../theme/colors';
import { PDFItem } from '../data/pdfs';
import {
  getPdfDirectUrl,
  openWithSystemPdfChooser,
  openInSpecificPdfApp,
  downloadPdfFile,
  sharePdf,
  POPULAR_PDF_APPS,
  PDFAppInfo,
} from '../utils/pdfViewerUtils';

interface PDFViewerModalProps {
  visible: boolean;
  pdf: PDFItem | null;
  onClose: () => void;
  onDownloadFeedback?: (title: string) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const PDFViewerModal: React.FC<PDFViewerModalProps> = ({
  visible,
  pdf,
  onClose,
  onDownloadFeedback,
}) => {
  const [isOpeningApp, setIsOpeningApp] = useState(false);
  const [openingAppName, setOpeningAppName] = useState('');
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [activeAppId, setActiveAppId] = useState<string>('system');
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  if (!pdf) return null;

  const directPdfUrl = getPdfDirectUrl(pdf.pdfUrl);

  const handleOpenSystemChooser = async () => {
    setIsOpeningApp(true);
    setOpeningAppName('Device PDF Readers');
    try {
      await openWithSystemPdfChooser(pdf.pdfUrl, pdf.title);
    } finally {
      setIsOpeningApp(false);
    }
  };

  const handleLaunchApp = async (app: PDFAppInfo) => {
    setActiveAppId(app.id);
    setIsOpeningApp(true);
    setOpeningAppName(app.name);

    try {
      if (!app.packageName) {
        await openWithSystemPdfChooser(pdf.pdfUrl, pdf.title);
      } else {
        const result = await openInSpecificPdfApp(pdf.pdfUrl, app.packageName, pdf.title);
        if (result.needsInstall) {
          setNoticeMessage(`${app.name} is not installed. Opened system app chooser instead!`);
          setTimeout(() => setNoticeMessage(null), 4000);
        }
      }
    } finally {
      setIsOpeningApp(false);
    }
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
              <View style={styles.formatBadge}>
                <Text style={styles.formatBadgeText}>PDF Document</Text>
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
              style={[styles.iconBtn, styles.launchBtn]}
              onPress={handleOpenSystemChooser}
              activeOpacity={0.7}
              accessibilityLabel="Open with PDF Reader"
            >
              <ExternalLink size={16} color="#000000" />
              <Text style={styles.launchBtnText}>Open</Text>
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
                <Download size={17} color="#000000" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Notice Toast */}
        {noticeMessage && (
          <View style={styles.noticeToast}>
            <Text style={styles.noticeToastText}>{noticeMessage}</Text>
          </View>
        )}

        {/* Loading Overlay when preparing PDF for reader */}
        {isOpeningApp && (
          <View style={styles.preparingOverlay}>
            <ActivityIndicator size="large" color="#FFFFFF" />
            <Text style={styles.preparingText}>Opening in {openingAppName}...</Text>
            <Text style={styles.preparingSub}>Preparing document and launching external reader</Text>
          </View>
        )}

        {/* Main Content Area */}
        <View style={styles.viewerBody}>
          {Platform.OS === 'web' ? (
            <View style={styles.webViewerContainer}>
              {/* Direct Web PDF Native Renderer */}
              <iframe
                src={directPdfUrl}
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  backgroundColor: '#0D0E12',
                }}
                title={pdf.title}
              />
            </View>
          ) : (
            /* Mobile Native PDF Reader Hub */
            <ScrollView
              style={styles.mobileScroll}
              contentContainerStyle={styles.mobileContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Document Overview Card */}
              <View style={styles.previewCard}>
                <View style={styles.docIconWrap}>
                  <FileText size={42} color="#000000" />
                  <View style={styles.pdfFormatBadge}>
                    <Text style={styles.pdfFormatBadgeText}>PDF</Text>
                  </View>
                </View>

                <Text style={styles.previewTitle}>{pdf.title}</Text>
                <Text style={styles.previewAuthor}>By {pdf.author}</Text>

                <View style={styles.pillRow}>
                  <View style={styles.pill}>
                    <Layers size={13} color="#FFFFFF" />
                    <Text style={styles.pillText}>{pdf.pageCount} Pages</Text>
                  </View>
                  <View style={styles.pill}>
                    <HardDrive size={13} color="#FFFFFF" />
                    <Text style={styles.pillText}>{pdf.fileSize}</Text>
                  </View>
                  <View style={styles.pill}>
                    <Star size={13} color="#FFFFFF" fill="#FFFFFF" />
                    <Text style={styles.pillText}>{pdf.rating.toFixed(1)}</Text>
                  </View>
                  <View style={styles.pill}>
                    <Calendar size={13} color="#FFFFFF" />
                    <Text style={styles.pillText}>{pdf.publishedYear}</Text>
                  </View>
                </View>

                {/* Primary Button: Open with System PDF Reader Chooser */}
                <TouchableOpacity
                  style={styles.bigOpenBtn}
                  onPress={handleOpenSystemChooser}
                  activeOpacity={0.8}
                >
                  <Eye size={20} color="#000000" />
                  <Text style={styles.bigOpenBtnText}>Open with Phone PDF Reader</Text>
                  <ExternalLink size={18} color="#000000" />
                </TouchableOpacity>

                <Text style={styles.readerNotice}>
                  ⚡ Automatically searches all PDF apps installed on your device (Adobe, WPS, Mi, Google PDF...)
                </Text>
              </View>

              {/* PDF Apps Selection Section */}
              <View style={styles.appsSection}>
                <View style={styles.sectionHeaderRow}>
                  <Smartphone size={16} color="#FFFFFF" />
                  <Text style={styles.sectionHeader}>Available PDF Reader Apps</Text>
                </View>
                <Text style={styles.sectionSub}>
                  Select an app below or launch the system chooser to view this document:
                </Text>

                <View style={styles.appList}>
                  {POPULAR_PDF_APPS.map((app) => (
                    <TouchableOpacity
                      key={app.id}
                      style={[
                        styles.appRow,
                        activeAppId === app.id && styles.appRowActive,
                      ]}
                      onPress={() => handleLaunchApp(app)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.appIconCircle}>
                        <FileText size={18} color="#000000" />
                      </View>
                      <View style={styles.appInfoWrap}>
                        <View style={styles.appNameRow}>
                          <Text style={styles.appName}>{app.name}</Text>
                          {app.badge && (
                            <View style={styles.appBadge}>
                              <Text style={styles.appBadgeText}>{app.badge}</Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.appDesc} numberOfLines={2}>
                          {app.description}
                        </Text>
                      </View>
                      <ChevronRight size={18} color="rgba(255, 255, 255, 0.4)" />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Secondary Download Button */}
              <TouchableOpacity
                style={[styles.bigDownloadBtn, downloadSuccess && styles.bigDownloadBtnSuccess]}
                onPress={handleDownload}
                activeOpacity={0.8}
              >
                {downloadSuccess ? (
                  <>
                    <CheckCircle2 size={18} color="#000000" />
                    <Text style={[styles.bigDownloadBtnText, { color: '#000000' }]}>
                      Downloaded Successfully!
                    </Text>
                  </>
                ) : (
                  <>
                    <Download size={18} color="#FFFFFF" />
                    <Text style={styles.bigDownloadBtnText}>Download PDF File to Phone</Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Description Section */}
              <View style={styles.infoSection}>
                <Text style={styles.sectionHeader}>Document Overview</Text>
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

              <View style={{ height: 60 }} />
            </ScrollView>
          )}
        </View>

        {/* Bottom Floating Bar */}
        <View style={styles.bottomBar}>
          <View style={styles.bottomInfo}>
            <Smartphone size={14} color="#FFFFFF" />
            <Text style={styles.bottomInfoText}>
              Device PDF Reader Integration
            </Text>
          </View>
          <TouchableOpacity
            style={styles.bottomOpenBtn}
            onPress={handleOpenSystemChooser}
            activeOpacity={0.8}
          >
            <ExternalLink size={14} color="#000000" />
            <Text style={styles.bottomOpenBtnText}>Open App Chooser</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#06080C',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 54 : 14,
    paddingBottom: 14,
    backgroundColor: '#0A0D14',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    gap: 12,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleWrap: {
    flex: 1,
    minWidth: 0,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  headerSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  formatBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  formatBadgeText: {
    color: '#000000',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
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
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  launchBtn: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    paddingHorizontal: 10,
    width: 'auto',
    gap: 4,
  },
  launchBtnText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '700',
  },
  downloadBtn: {
    backgroundColor: '#FFFFFF',
  },
  downloadBtnSuccess: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  noticeToast: {
    backgroundColor: '#1E1E2E',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  noticeToastText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  preparingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(6, 8, 12, 0.92)',
    zIndex: 100,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  preparingText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 16,
  },
  preparingSub: {
    color: '#8D8D94',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  viewerBody: {
    flex: 1,
  },
  webViewerContainer: {
    flex: 1,
    backgroundColor: '#0D0E12',
  },
  mobileScroll: {
    flex: 1,
  },
  mobileContent: {
    padding: 16,
    gap: 16,
  },
  previewCard: {
    backgroundColor: '#12141C',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  docIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    position: 'relative',
  },
  pdfFormatBadge: {
    position: 'absolute',
    bottom: -6,
    backgroundColor: '#000000',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  pdfFormatBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
  previewTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 4,
  },
  previewAuthor: {
    color: '#8D8D94',
    fontSize: 13,
    marginBottom: 14,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 18,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  pillText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  bigOpenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  bigOpenBtnText: {
    color: '#000000',
    fontSize: 15,
    fontWeight: '800',
  },
  readerNotice: {
    color: 'rgba(255, 255, 255, 0.55)',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 16,
  },
  appsSection: {
    backgroundColor: '#12141C',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  sectionHeader: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  sectionSub: {
    color: '#8D8D94',
    fontSize: 12,
    marginBottom: 14,
  },
  appList: {
    gap: 8,
  },
  appRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  appRowActive: {
    borderColor: 'rgba(255, 255, 255, 0.35)',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  appIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  appInfoWrap: {
    flex: 1,
  },
  appNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  appName: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  appBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  appBadgeText: {
    color: '#000000',
    fontSize: 8,
    fontWeight: '900',
  },
  appDesc: {
    color: '#8D8D94',
    fontSize: 11,
    marginTop: 2,
  },
  bigDownloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 13,
    borderRadius: 14,
  },
  bigDownloadBtnSuccess: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  bigDownloadBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  infoSection: {
    backgroundColor: '#12141C',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 8,
  },
  descriptionText: {
    color: '#B8B8C2',
    fontSize: 13,
    lineHeight: 20,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  tagPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#0A0D14',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  bottomInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bottomInfoText: {
    color: '#8D8D94',
    fontSize: 12,
  },
  bottomOpenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  bottomOpenBtnText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '700',
  },
});
