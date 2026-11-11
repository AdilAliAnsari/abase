import api, { getApiBaseUrl } from './api';
import { PDFItem, mockPDFs as fallbackPDFs } from '../data/pdfs';

export interface GetPDFsParams {
  search?: string;
  category?: string;
  branch?: string;
  semester?: number | string;
  subjectCode?: string;
  module?: string;
  tags?: string;
  minPrice?: number | string;
  maxPrice?: number | string;
  page?: number;
  limit?: number;
}

export interface PDFsResponse {
  success: boolean;
  pdfs: PDFItem[];
  total?: number;
  page?: number;
  totalPages?: number;
  fromOfflineFallback?: boolean;
}

export const pdfService = {
  /**
   * Fetch PDFs from backend API with offline fallback
   */
  getPdfs: async (params?: GetPDFsParams): Promise<PDFsResponse> => {
    try {
      const res = await api.get<{
        success: boolean;
        pdfs: any[];
        totalItems?: number;
        currentPage?: number;
        totalPages?: number;
      }>('/api/pdfs', params);

      if (res && res.pdfs && res.pdfs.length > 0) {
        const baseUrl = getApiBaseUrl();

        // Map backend PDF structure to frontend PDFItem
        const mappedPdfs: PDFItem[] = res.pdfs.map((p: any) => {
          const rawUrl = p.pdfFileUrl || p.pdfUrl || '';
          const fullPdfUrl = rawUrl.startsWith('/')
            ? `${baseUrl}${rawUrl}`
            : rawUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';

          return {
            id: p._id || p.id,
            title: p.title,
            subjectCode: p.subjectCode || 'VTU',
            scheme: (p.scheme as any) || '2022 Scheme',
            branch: (p.branch as any) || 'CSE',
            year: p.semester <= 2 ? '1st Year' : p.semester <= 4 ? '2nd Year' : p.semester <= 6 ? '3rd Year' : '4th Year',
            semester: p.semester || 5,
            university: (p.university as any) || 'VTU',
            lecturer: p.lecturer || {
              name: p.author || 'VTU Faculty',
              title: 'Assistant Professor',
              department: p.branch || 'CSE',
              institution: 'VTU Affiliated College',
              rating: p.rating || 4.8,
              verified: true,
            },
            materialType: (p.materialType as any) || 'Module Notes',
            author: p.author || 'VTU Faculty',
            category: p.category || `${p.branch || 'CSE'} ${p.scheme || '2022 Scheme'}`,
            fileSize: p.fileSize || '1.8 MB',
            pageCount: p.pageCount || 25,
            pdfUrl: fullPdfUrl,
            coverImage: p.coverImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=600&fit=crop',
            description: p.description || `${p.title} - Official study material for ${p.branch} Sem ${p.semester}.`,
            rating: p.rating || 4.8,
            reviewsCount: p.reviewsCount || 42,
            downloadsCount: p.salesCount || p.downloadsCount || 120,
            tags: p.tags && p.tags.length > 0 ? p.tags : [p.subjectCode, p.branch, `Sem ${p.semester}`].filter(Boolean),
            publishedYear: '2024',
          };
        });

        return {
          success: true,
          pdfs: mappedPdfs,
          total: res.totalItems || mappedPdfs.length,
          page: res.currentPage || 1,
          totalPages: res.totalPages || 1,
          fromOfflineFallback: false,
        };
      }
    } catch (err: any) {
      console.warn('Backend /api/pdfs unreachable, using fallback PDFs:', err.message);
    }

    // Local fallback
    let filtered = [...fallbackPDFs];
    if (params?.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(
        p =>
          p.title.toLowerCase().includes(q) ||
          p.author.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.subjectCode.toLowerCase().includes(q)
      );
    }
    if (params?.category && params.category !== 'All') {
      filtered = filtered.filter(
        p => p.category.toLowerCase() === params.category!.toLowerCase()
      );
    }

    return {
      success: true,
      pdfs: filtered,
      total: filtered.length,
      page: 1,
      totalPages: 1,
      fromOfflineFallback: true,
    };
  },

  /**
   * Fetch single PDF by ID
   */
  getPdfById: async (id: string): Promise<PDFItem | null> => {
    try {
      const res = await api.get<any>(`/api/pdfs/${id}`);
      if (res && res.pdf) {
        return res.pdf;
      }
      if (res && (res._id || res.id)) {
        return res;
      }
    } catch (err: any) {
      console.warn(`Backend /api/pdfs/${id} unreachable:`, err.message);
    }

    const found = fallbackPDFs.find((p: PDFItem) => p.id === id);
    return found || null;
  },

  /**
   * Trigger local directory rescan on backend
   */
  rescanPdfs: async () => {
    try {
      return await api.post('/api/pdfs/scan');
    } catch (err: any) {
      console.error('Failed to trigger scan:', err.message);
      throw err;
    }
  }
};

export default pdfService;
