import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export interface SavedCard {
  id: string;
  type: 'visa' | 'mastercard' | 'rupay';
  cardNumber: string; // e.g. "•••• •••• •••• 4289"
  last4: string;
  cardHolder: string;
  expiry: string; // "MM/YY"
  isDefault?: boolean;
  bgGradient?: [string, string];
}

const STORAGE_KEY = 'abase_saved_cards';

const getWebItem = (key: string): string | null => {
  if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }
  return null;
};

const setWebItem = (key: string, value: string): void => {
  if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(key, value);
    } catch {}
  }
};

export const cardService = {
  /**
   * Get all user saved cards from persistent storage
   */
  getSavedCards: async (): Promise<SavedCard[]> => {
    try {
      let raw = getWebItem(STORAGE_KEY);
      if (!raw) {
        raw = await AsyncStorage.getItem(STORAGE_KEY);
      }
      if (raw) {
        return JSON.parse(raw);
      }
      return [];
    } catch (e) {
      console.warn('Failed to load saved cards:', e);
      return [];
    }
  },

  /**
   * Save a new card
   */
  saveCard: async (newCard: {
    cardNumber: string;
    cardHolder: string;
    expiry: string;
  }): Promise<SavedCard> => {
    const rawNumber = newCard.cardNumber.replace(/\s+/g, '');
    const last4 = rawNumber.slice(-4) || '1234';

    // Auto-detect brand
    let type: 'visa' | 'mastercard' | 'rupay' = 'visa';
    if (rawNumber.startsWith('5') || rawNumber.startsWith('2')) {
      type = 'mastercard';
    } else if (rawNumber.startsWith('6') || rawNumber.startsWith('508')) {
      type = 'rupay';
    }

    const card: SavedCard = {
      id: `card_${Date.now()}`,
      type,
      cardNumber: `•••• •••• •••• ${last4}`,
      last4,
      cardHolder: newCard.cardHolder.trim().toUpperCase() || 'VALUED CUSTOMER',
      expiry: newCard.expiry.trim() || '12/28',
      isDefault: true,
      bgGradient:
        type === 'mastercard'
          ? ['#3A1078', '#4E31AA']
          : type === 'rupay'
          ? ['#0A4D68', '#088395']
          : ['#1A365D', '#2B6CB0'],
    };

    const existing = await cardService.getSavedCards();
    const updated = [card, ...existing.map((c) => ({ ...c, isDefault: false }))];

    const str = JSON.stringify(updated);
    setWebItem(STORAGE_KEY, str);
    await AsyncStorage.setItem(STORAGE_KEY, str);

    return card;
  },

  /**
   * Delete a saved card by id
   */
  deleteCard: async (id: string): Promise<SavedCard[]> => {
    const existing = await cardService.getSavedCards();
    const updated = existing.filter((c) => c.id !== id);
    const str = JSON.stringify(updated);
    setWebItem(STORAGE_KEY, str);
    await AsyncStorage.setItem(STORAGE_KEY, str);
    return updated;
  },
};

export default cardService;
