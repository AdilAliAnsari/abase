import api from './api';
import { PDFItem, mockPDFs as fallbackPDFs } from '../data/pdfs';

export interface GetPDFsParams {
  search?: string;
  category?: string;
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
      }>('/api/pdf', params);

      if (res && res.pdfs && res.pdfs.length > 0) {
        // Map backend PDF structure to frontend PDFItem if needed
        const mappedPdfs: PDFItem[] = res.pdfs.map((p: any) => ({
          id: p._id || p.id,
          title: p.title,
          uploadedAt: p.uploadedAt || p.createdAt,
          createdAt: p.createdAt,
          subjectCode: p.subjectCode || 'VTU',
          scheme: p.scheme || '2022 Scheme',
          branch: p.branch || 'CSE',
          year: p.year || '2nd Year',
          semester: p.semester || 4,
          university: p.university || 'VTU',
          lecturer: p.lecturer || {
            name: p.author || 'VTU Faculty',
            title: 'Assistant Professor',
            department: p.category || 'CSE',
            institution: 'VTU Affiliated',
            rating: p.rating || 4.8,
            verified: true,
          },
          materialType: p.materialType || 'Module Notes',
          author: p.author || 'VTU Faculty',
          category: p.category || 'CSE',
          fileSize: p.fileSize || '14.2 MB',
          pageCount: p.pageCount || 100,
          pdfUrl: p.pdfFileUrl || p.pdfUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          coverImage: p.coverImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=600&fit=crop',
          description: p.description || '',
          rating: p.rating || 4.8,
          reviewsCount: p.reviewsCount || 120,
          downloadsCount: p.salesCount || p.downloadsCount || 450,
          tags: p.tags || [],
          publishedYear: '2024',
        }));

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
      console.warn('Backend /api/pdf unreachable, using fallback PDFs:', err.message);
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
      const res = await api.get<any>(`/api/pdf/${id}`);
      if (res && (res._id || res.id)) {
        return res;
      }
    } catch (err: any) {
      console.warn(`Backend /api/pdf/${id} unreachable:`, err.message);
    }

    const found = fallbackPDFs.find((p: PDFItem) => p.id === id);
    return found || null;
  },
};

export default pdfService;
