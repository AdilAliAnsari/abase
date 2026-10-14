import api from './api';
import { Book } from '../data/books';

export interface CartItem {
  bookId: string;
  title: string;
  author: string;
  price: number;
  originalPrice?: number;
  coverImage: string;
  category: string;
  quantity: number;
}

export interface CartData {
  userId?: string;
  items: CartItem[];
  totalQuantity: number;
  totalAmount: number;
}

export interface CartResponse {
  success: boolean;
  message?: string;
  cart: CartData;
}

// In-memory fallback
let localCartItems: CartItem[] = [];

const calculateTotals = (items: CartItem[]) => {
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = Math.round(
    items.reduce((sum, item) => sum + (item.price * item.quantity), 0) * 100
  ) / 100;
  return { totalQuantity, totalAmount };
};

export const cartService = {
  /**
   * Fetch current cart from backend
   */
  getCart: async (): Promise<CartData> => {
    try {
      const res = await api.get<CartResponse>('/api/cart');
      if (res && res.cart) {
        localCartItems = res.cart.items || [];
        return res.cart;
      }
    } catch (err: any) {
      console.warn('Backend /api/cart unreachable, using local cart:', err.message);
    }

    const { totalQuantity, totalAmount } = calculateTotals(localCartItems);
    return {
      items: localCartItems,
      totalQuantity,
      totalAmount,
    };
  },

  /**
   * Add book to cart via backend
   */
  addToCart: async (book: Book, quantity: number = 1): Promise<CartData> => {
    try {
      const res = await api.post<CartResponse>('/api/cart/add', {
        bookId: String(book.id),
        title: book.title,
        author: book.author,
        price: book.price,
        originalPrice: book.originalPrice,
        coverImage: book.coverImage,
        category: book.category,
        quantity,
      });

      if (res && res.cart) {
        localCartItems = res.cart.items || [];
        return res.cart;
      }
    } catch (err: any) {
      console.warn('Backend add to cart failed, updating locally:', err.message);
    }

    // Local fallback update
    const existingIndex = localCartItems.findIndex(i => i.bookId === String(book.id));
    if (existingIndex > -1) {
      localCartItems[existingIndex].quantity += quantity;
    } else {
      localCartItems.push({
        bookId: String(book.id),
        title: book.title,
        author: book.author,
        price: book.price,
        originalPrice: book.originalPrice,
        coverImage: book.coverImage,
        category: book.category,
        quantity,
      });
    }

    const { totalQuantity, totalAmount } = calculateTotals(localCartItems);
    return {
      items: [...localCartItems],
      totalQuantity,
      totalAmount,
    };
  },

  /**
   * Update item quantity via backend
   */
  updateQuantity: async (bookId: string, quantity: number): Promise<CartData> => {
    try {
      const res = await api.put<CartResponse>('/api/cart/update', {
        bookId,
        quantity,
      });

      if (res && res.cart) {
        localCartItems = res.cart.items || [];
        return res.cart;
      }
    } catch (err: any) {
      console.warn('Backend update cart quantity failed, updating locally:', err.message);
    }

    if (quantity <= 0) {
      localCartItems = localCartItems.filter(i => i.bookId !== bookId);
    } else {
      const item = localCartItems.find(i => i.bookId === bookId);
      if (item) item.quantity = quantity;
    }

    const { totalQuantity, totalAmount } = calculateTotals(localCartItems);
    return {
      items: [...localCartItems],
      totalQuantity,
      totalAmount,
    };
  },

  /**
   * Remove item from cart via backend
   */
  removeFromCart: async (bookId: string): Promise<CartData> => {
    try {
      const res = await api.delete<CartResponse>(`/api/cart/remove/${bookId}`);
      if (res && res.cart) {
        localCartItems = res.cart.items || [];
        return res.cart;
      }
    } catch (err: any) {
      console.warn('Backend remove from cart failed, updating locally:', err.message);
    }

    localCartItems = localCartItems.filter(i => i.bookId !== bookId);
    const { totalQuantity, totalAmount } = calculateTotals(localCartItems);
    return {
      items: [...localCartItems],
      totalQuantity,
      totalAmount,
    };
  },

  /**
   * Clear entire cart
   */
  clearCart: async (): Promise<CartData> => {
    try {
      const res = await api.delete<CartResponse>('/api/cart/clear');
      if (res && res.cart) {
        localCartItems = [];
        return res.cart;
      }
    } catch (err: any) {
      console.warn('Backend clear cart failed, updating locally:', err.message);
    }

    localCartItems = [];
    return {
      items: [],
      totalQuantity: 0,
      totalAmount: 0,
    };
  },
};

export default cartService;
