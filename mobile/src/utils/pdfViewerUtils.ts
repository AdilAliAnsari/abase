import { Platform, Linking, Share } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { Paths, File as ExpoFile } from 'expo-file-system';
import * as IntentLauncher from 'expo-intent-launcher';
import * as Sharing from 'expo-sharing';

export interface PDFAppInfo {
  id: string;
  name: string;
  description: string;
  packageName: string;
  playStoreUrl?: string;
  badge?: string;
}

export const POPULAR_PDF_APPS: PDFAppInfo[] = [
  {
    id: 'system',
    name: 'All Installed PDF Apps',
    description: 'Search & pick from any PDF reader app installed on your phone',
    packageName: '',
    badge: 'RECOMMENDED',
  },
  {
    id: 'adobe',
    name: 'Adobe Acrobat Reader',
    description: 'Official Acrobat engine with bookmarks, dark mode & annotations',
    packageName: 'com.adobe.reader',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=com.adobe.reader',
    badge: 'POPULAR',
  },
  {
    id: 'wps',
    name: 'WPS Office & PDF',
    description: 'High-speed document viewer with full page thumbnails & night mode',
    packageName: 'cn.wps.moffice_eng',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=cn.wps.moffice_eng',
  },
  {
    id: 'google_pdf',
    name: 'Google PDF Viewer',
    description: 'Fast, lightweight standalone PDF document engine',
    packageName: 'com.google.android.apps.pdfviewer',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=com.google.android.apps.pdfviewer',
  },
  {
    id: 'drive_pdf',
    name: 'Drive PDF Viewer',
    description: 'Native system document viewer engine',
    packageName: 'com.google.android.apps.docs',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=com.google.android.apps.docs',
  },
];

/**
 * Extracts Google Drive file ID from various Drive URL patterns (if applicable)
 */
export function extractDriveId(url: string): string | null {
  if (!url) return null;
  const fileMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]{20,})/);
  if (fileMatch && fileMatch[1]) return fileMatch[1];
  const idParamMatch = url.match(/[?&]id=([a-zA-Z0-9_-]{20,})/);
  if (idParamMatch && idParamMatch[1]) return idParamMatch[1];
  const docMatch = url.match(/\/d\/([a-zA-Z0-9_-]{20,})/);
  if (docMatch && docMatch[1]) return docMatch[1];
  return null;
}

/**
 * Checks if the URL is a Google Drive link
 */
export function isGoogleDriveUrl(url: string): boolean {
  if (!url) return false;
  return url.includes('drive.google.com') || url.includes('docs.google.com');
}

/**
 * Gets the direct PDF file download/stream link
 */
export function getPdfDirectUrl(url: string): string {
  if (!url) return '';
  const driveId = extractDriveId(url);
  if (driveId) {
    return `https://drive.google.com/uc?export=download&id=${driveId}`;
  }
  return url;
}

export function getPdfDownloadUrl(url: string): string {
  return getPdfDirectUrl(url);
}

/**
 * Downloads the PDF to the local device cache directory so external reader apps can open it
 */
export async function ensureLocalPdfFile(pdfUrl: string, title?: string): Promise<string> {
  const downloadUrl = getPdfDirectUrl(pdfUrl);
  const cleanName = (title || 'document').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 40);
  const localFileName = `${cleanName}.pdf`;

  try {
    const targetFile = new ExpoFile(Paths.cache, localFileName);
    if (targetFile.exists) {
      return targetFile.uri;
    }
    const downloaded = await ExpoFile.downloadFileAsync(downloadUrl, targetFile, { idempotent: true });
    return downloaded.uri;
  } catch (error) {
    console.warn('Cache download error:', error);
    try {
      const targetFile = new ExpoFile(Paths.document, localFileName);
      const downloaded = await ExpoFile.downloadFileAsync(downloadUrl, targetFile, { idempotent: true });
      return downloaded.uri;
    } catch {
      return downloadUrl;
    }
  }
}

/**
 * Searches for all available PDF reader apps on the phone and opens the system "Open with" chooser
 */
export async function openWithSystemPdfChooser(pdfUrl: string, title?: string): Promise<boolean> {
  if (!pdfUrl) return false;

  // On Web: Open direct raw PDF in new browser tab with browser's native PDF engine
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') {
      window.open(getPdfDirectUrl(pdfUrl), '_blank', 'noopener,noreferrer');
      return true;
    }
  }

  // On Mobile: Download to cache, and launch Android intent chooser, iOS document interaction, or native File preview
  try {
    const localUri = await ensureLocalPdfFile(pdfUrl, title);

    if (Platform.OS === 'android') {
      try {
        await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
          data: localUri,
          type: 'application/pdf',
          flags: 1, // FLAG_GRANT_READ_URI_PERMISSION
        });
        return true;
      } catch (intentErr) {
        console.warn('Intent launcher fallback to sharing:', intentErr);
      }
    }

    // Native file preview if available (supported on iOS & Android in Expo 58)
    try {
      const localFile = new ExpoFile(localUri);
      if (localFile.exists && (await ExpoFile.canPreview(localFile))) {
        await ExpoFile.preview(localFile, { mimeType: 'application/pdf' });
        return true;
      }
    } catch (previewErr) {
      console.warn('Expo File.preview fallback:', previewErr);
    }

    // iOS and Android fallback: triggers native system app chooser for application/pdf
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(localUri, {
        mimeType: 'application/pdf',
        dialogTitle: `Open ${title || 'PDF'} with...`,
        UTI: 'com.adobe.pdf',
      });
      return true;
    }

    // Ultimate fallback: open direct URL in browser
    await WebBrowser.openBrowserAsync(getPdfDirectUrl(pdfUrl));
    return true;
  } catch (err) {
    console.error('Failed to open PDF in device reader:', err);
    try {
      await Linking.openURL(getPdfDirectUrl(pdfUrl));
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Opens the PDF directly in a specific installed PDF reader app (e.g. Adobe Acrobat, WPS Office)
 */
export async function openInSpecificPdfApp(
  pdfUrl: string,
  packageName: string,
  title?: string
): Promise<{ success: boolean; needsInstall?: boolean }> {
  if (!packageName || Platform.OS !== 'android') {
    const ok = await openWithSystemPdfChooser(pdfUrl, title);
    return { success: ok };
  }

  try {
    const localUri = await ensureLocalPdfFile(pdfUrl, title);

    await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
      data: localUri,
      type: 'application/pdf',
      packageName: packageName,
      flags: 1, // FLAG_GRANT_READ_URI_PERMISSION
    });
    return { success: true };
  } catch (appErr: any) {
    console.warn(`Specific app ${packageName} not found or failed, falling back to system chooser:`, appErr?.message);
    const ok = await openWithSystemPdfChooser(pdfUrl, title);
    return { success: ok, needsInstall: true };
  }
}

/**
 * Downloads the PDF file directly to device
 */
export async function downloadPdfFile(pdfUrl: string, fileName?: string): Promise<boolean> {
  if (!pdfUrl) return false;

  const downloadUrl = getPdfDirectUrl(pdfUrl);
  const sanitizedFileName = (fileName || 'document').replace(/[^a-zA-Z0-9_-]/g, '_') + '.pdf';

  try {
    if (Platform.OS === 'web') {
      const anchor = document.createElement('a');
      anchor.href = downloadUrl;
      anchor.download = sanitizedFileName;
      anchor.target = '_blank';
      anchor.rel = 'noopener noreferrer';
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      return true;
    }

    // On mobile: save file locally and launch device save/share sheet
    const localUri = await ensureLocalPdfFile(pdfUrl, fileName);
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(localUri, {
        mimeType: 'application/pdf',
        dialogTitle: `Save ${fileName || 'PDF'}`,
        UTI: 'com.adobe.pdf',
      });
      return true;
    }

    await Linking.openURL(downloadUrl);
    return true;
  } catch (error) {
    console.error('Failed to download PDF:', error);
    return false;
  }
}

/**
 * Shares a PDF link
 */
export async function sharePdf(pdfUrl: string, title: string): Promise<void> {
  try {
    const directUrl = getPdfDirectUrl(pdfUrl);
    await Share.share({
      title: title,
      message: `Read "${title}" (PDF Document): ${directUrl}`,
      url: directUrl,
    });
  } catch (error) {
    console.error('Failed to share PDF:', error);
  }
}
