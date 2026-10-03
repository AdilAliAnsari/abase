import { Platform, Linking, Share } from 'react-native';
import * as WebBrowser from 'expo-web-browser';

/**
 * Extracts Google Drive file ID from various Drive URL patterns
 */
export function extractDriveId(url: string): string | null {
  if (!url) return null;
  
  // Format: drive.google.com/file/d/{ID}/...
  const fileMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]{20,})/);
  if (fileMatch && fileMatch[1]) return fileMatch[1];

  // Format: drive.google.com/open?id={ID} or uc?id={ID}
  const idParamMatch = url.match(/[?&]id=([a-zA-Z0-9_-]{20,})/);
  if (idParamMatch && idParamMatch[1]) return idParamMatch[1];

  // Format: docs.google.com/document/d/{ID}/...
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
 * Converts any PDF or Google Drive URL into an embeddable Google Drive Viewer URL
 */
export function getDriveViewerEmbedUrl(url: string): string {
  if (!url) return '';
  const driveId = extractDriveId(url);
  if (driveId) {
    // Official Google Drive preview embed format
    return `https://drive.google.com/file/d/${driveId}/preview`;
  }
  // Universal Google Docs / Drive Online Viewer
  return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
}

/**
 * Converts any PDF or Google Drive URL into a Google Drive Web Viewer URL (for opening in phone browser or app)
 */
export function getDriveViewerDirectUrl(url: string): string {
  if (!url) return '';
  const driveId = extractDriveId(url);
  if (driveId) {
    return `https://drive.google.com/file/d/${driveId}/view`;
  }
  return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}`;
}

/**
 * Gets the direct download link for a PDF or Google Drive file
 */
export function getPdfDownloadUrl(url: string): string {
  if (!url) return '';
  const driveId = extractDriveId(url);
  if (driveId) {
    return `https://drive.google.com/uc?export=download&id=${driveId}`;
  }
  return url;
}

/**
 * Opens the PDF using Google Drive Viewer on Phone (via in-app Chrome/Safari custom tabs) or Web
 */
export async function openInDriveViewer(pdfUrl: string, title?: string): Promise<boolean> {
  if (!pdfUrl) return false;
  
  const driveUrl = getDriveViewerDirectUrl(pdfUrl);

  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') {
        window.open(driveUrl, '_blank', 'noopener,noreferrer');
        return true;
      }
    }

    // Mobile (Android / iOS): Open using Google Drive viewer in high performance in-app browser
    // This allows phone users to view the PDF smoothly with Google Drive's native rendering engine!
    await WebBrowser.openBrowserAsync(driveUrl, {
      toolbarColor: '#121218',
      controlsColor: '#69D900',
      secondaryToolbarColor: '#000000',
      enableBarCollapsing: true,
      showTitle: true,
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
    });
    return true;
  } catch (error) {
    console.warn('Failed to open via WebBrowser, falling back to Linking:', error);
    try {
      await Linking.openURL(driveUrl);
      return true;
    } catch (linkError) {
      console.error('Failed to open URL:', linkError);
      return false;
    }
  }
}

/**
 * Triggers a download of the PDF file
 */
export async function downloadPdfFile(pdfUrl: string, fileName?: string): Promise<boolean> {
  if (!pdfUrl) return false;
  
  const downloadUrl = getPdfDownloadUrl(pdfUrl);
  const sanitizedFileName = (fileName || 'document').replace(/[^a-zA-Z0-9_-]/g, '_') + '.pdf';

  try {
    if (Platform.OS === 'web') {
      // Trigger browser download via invisible link
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

    // On mobile: Open direct download URL which triggers mobile download manager / Drive save
    const canOpen = await Linking.canOpenURL(downloadUrl);
    if (canOpen) {
      await Linking.openURL(downloadUrl);
      return true;
    } else {
      await WebBrowser.openBrowserAsync(downloadUrl);
      return true;
    }
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
    const driveUrl = getDriveViewerDirectUrl(pdfUrl);
    await Share.share({
      title: title,
      message: `Read "${title}" in Google Drive PDF Viewer: ${driveUrl}`,
      url: driveUrl,
    });
  } catch (error) {
    console.error('Failed to share PDF:', error);
  }
}
