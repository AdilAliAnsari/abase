import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import cartService, { CartItem, CartData } from '../services/cartService';
import { Book } from '../data/books';

interface CartContextType {
  cart: CartData;
  items: CartItem[];
  totalCount: number;
  totalAmount: number;
  isLoading: boolean;
  toastMessage: string | null;
  addToCart: (book: Book, quantity?: number) => Promise<void>;
  removeFromCart: (bookId: string) => Promise<void>;
  updateQuantity: (bookId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  isItemInCart: (bookId: string) => boolean;
  getItemQuantity: (bookId: string) => number;
  dismissToast: () => void;
}

const defaultCart: CartData = {
  items: [],
  totalQuantity: 0,
  totalAmount: 0,
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartData>(defaultCart);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const dismissToast = () => {
    setToastMessage(null);
  };

  const refreshCart = useCallback(async () => {
    try {
      const data = await cartService.getCart();
      setCart(data);
    } catch (err) {
      console.warn('Failed to refresh cart:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = async (book: Book, quantity: number = 1) => {
    try {
      const updated = await cartService.addToCart(book, quantity);
      setCart(updated);
      showToast(`Added "${book.title}" to cart!`);
    } catch (err: any) {
      console.error('Error adding to cart:', err);
      showToast(err.message || 'Could not add to cart');
    }
  };

  const removeFromCart = async (bookId: string) => {
    try {
      const updated = await cartService.removeFromCart(bookId);
      setCart(updated);
      showToast('Item removed from cart');
    } catch (err: any) {
      console.error('Error removing from cart:', err);
    }
  };

  const updateQuantity = async (bookId: string, quantity: number) => {
    try {
      const updated = await cartService.updateQuantity(bookId, quantity);
      setCart(updated);
    } catch (err: any) {
      console.error('Error updating cart quantity:', err);
    }
  };

  const clearCart = async () => {
    try {
      const updated = await cartService.clearCart();
      setCart(updated);
      showToast('Cart cleared');
    } catch (err: any) {
      console.error('Error clearing cart:', err);
    }
  };

  const isItemInCart = (bookId: string): boolean => {
    return cart.items.some(item => item.bookId === String(bookId));
  };

  const getItemQuantity = (bookId: string): number => {
    const found = cart.items.find(item => item.bookId === String(bookId));
    return found ? found.quantity : 0;
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        items: cart.items,
        totalCount: cart.totalQuantity,
        totalAmount: cart.totalAmount,
        isLoading,
        toastMessage,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        refreshCart,
        isItemInCart,
        getItemQuantity,
        dismissToast,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
