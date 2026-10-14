import api from './api';
import { Book, books as fallbackBooks } from '../data/books';

export interface GetBooksParams {
  search?: string;
  category?: string;
  minPrice?: number | string;
  maxPrice?: number | string;
  sortBy?: 'featured' | 'priceLow' | 'priceHigh' | 'rating';
  page?: number;
  limit?: number;
}

export interface BooksResponse {
  success: boolean;
  books: Book[];
  total?: number;
  page?: number;
  totalPages?: number;
  fromOfflineFallback?: boolean;
}

export const bookService = {
  /**
   * Fetch books from backend API with offline fallback
   */
  getBooks: async (params?: GetBooksParams): Promise<BooksResponse> => {
    try {
      const res = await api.get<{
        success: boolean;
        books: Book[];
        total: number;
        page: number;
        totalPages: number;
      }>('/api/books', params);

      if (res && res.books && res.books.length > 0) {
        return {
          success: true,
          books: res.books,
          total: res.total || res.books.length,
          page: res.page || 1,
          totalPages: res.totalPages || 1,
          fromOfflineFallback: false,
        };
      }
    } catch (err: any) {
      console.warn('Backend /api/books unreachable, using fallback books:', err.message);
    }

    // Local fallback filtering
    let filtered = [...fallbackBooks];
    if (params?.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(
        b =>
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          b.category.toLowerCase().includes(q)
      );
    }
    if (params?.category && params.category !== 'All') {
      filtered = filtered.filter(
        b => b.category.toLowerCase() === params.category!.toLowerCase()
      );
    }
    if (params?.minPrice) {
      filtered = filtered.filter(b => b.price >= Number(params.minPrice));
    }
    if (params?.maxPrice) {
      filtered = filtered.filter(b => b.price <= Number(params.maxPrice));
    }

    if (params?.sortBy === 'priceLow') filtered.sort((a, b) => a.price - b.price);
    else if (params?.sortBy === 'priceHigh') filtered.sort((a, b) => b.price - a.price);
    else if (params?.sortBy === 'rating') filtered.sort((a, b) => b.rating - a.rating);

    return {
      success: true,
      books: filtered,
      total: filtered.length,
      page: 1,
      totalPages: 1,
      fromOfflineFallback: true,
    };
  },

  /**
   * Fetch a single book by ID
   */
  getBookById: async (id: string): Promise<Book | null> => {
    try {
      const res = await api.get<{ success: boolean; book: Book }>(`/api/books/${id}`);
      if (res && res.book) {
        return res.book;
      }
    } catch (err: any) {
      console.warn(`Backend /api/books/${id} unreachable, checking fallback:`, err.message);
    }

    // Fallback to local list
    const found = fallbackBooks.find(b => b.id === id);
    return found || null;
  },

  /**
   * Create a new book listing
   */
  createBook: async (bookData: Partial<Book>): Promise<Book> => {
    const res = await api.post<{ success: boolean; book: Book }>('/api/books', bookData);
    return res.book;
  },
};

export default bookService;
