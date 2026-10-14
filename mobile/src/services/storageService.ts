import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { UserProfile } from './authService';

export interface SavedAccount {
  id: string;
  email: string;
  username: string;
  name: string;
  avatar?: string;
  provider: 'google' | 'github' | 'local';
  socialId?: string;
  lastUsedAt: string;
  token?: string;
}

const STORAGE_KEYS = {
  ACTIVE_TOKEN: 'abase_auth_token',
  ACTIVE_USER: 'abase_active_user',
  SAVED_ACCOUNTS: 'abase_saved_accounts',
};

// Safe web localStorage helper
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

const removeWebItem = (key: string): void => {
  if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
    try {
      localStorage.removeItem(key);
    } catch {}
  }
};

export const storageService = {
  /**
   * Save permanent active user session
   */
  saveActiveSession: async (token: string, user: UserProfile): Promise<void> => {
    try {
      const userStr = JSON.stringify(user);
      setWebItem(STORAGE_KEYS.ACTIVE_TOKEN, token);
      setWebItem(STORAGE_KEYS.ACTIVE_USER, userStr);

      await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_TOKEN, token);
      await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_USER, userStr);
    } catch (e) {
      console.warn('Failed to save active session:', e);
    }
  },

  /**
   * Retrieve active permanent user session
   */
  getActiveSession: async (): Promise<{ token: string; user: UserProfile } | null> => {
    try {
      let token = getWebItem(STORAGE_KEYS.ACTIVE_TOKEN);
      let userStr = getWebItem(STORAGE_KEYS.ACTIVE_USER);

      if (!token) {
        token = await AsyncStorage.getItem(STORAGE_KEYS.ACTIVE_TOKEN);
      }
      if (!userStr) {
        userStr = await AsyncStorage.getItem(STORAGE_KEYS.ACTIVE_USER);
      }

      if (token && userStr) {
        const user = JSON.parse(userStr) as UserProfile;
        return { token, user };
      }
      return null;
    } catch (e) {
      console.warn('Failed to read active session:', e);
      return null;
    }
  },

  /**
   * Clear active user session (on logout)
   */
  clearActiveSession: async (): Promise<void> => {
    try {
      removeWebItem(STORAGE_KEYS.ACTIVE_TOKEN);
      removeWebItem(STORAGE_KEYS.ACTIVE_USER);

      await AsyncStorage.removeItem(STORAGE_KEYS.ACTIVE_TOKEN);
      await AsyncStorage.removeItem(STORAGE_KEYS.ACTIVE_USER);
    } catch (e) {
      console.warn('Failed to clear active session:', e);
    }
  },

  /**
   * Add or update an account in the permanent saved accounts record
   */
  addSavedAccount: async (account: SavedAccount): Promise<SavedAccount[]> => {
    try {
      const existing = await storageService.getSavedAccounts();
      const filtered = existing.filter(
        a => a.id !== account.id && a.email.toLowerCase() !== account.email.toLowerCase()
      );
      const updated: SavedAccount[] = [
        { ...account, lastUsedAt: new Date().toISOString() },
        ...filtered,
      ];

      const serialized = JSON.stringify(updated);
      setWebItem(STORAGE_KEYS.SAVED_ACCOUNTS, serialized);
      await AsyncStorage.setItem(STORAGE_KEYS.SAVED_ACCOUNTS, serialized);

      return updated;
    } catch (e) {
      console.warn('Failed to save account record:', e);
      return [];
    }
  },

  /**
   * Get all permanently saved account records
   */
  getSavedAccounts: async (): Promise<SavedAccount[]> => {
    try {
      let raw = getWebItem(STORAGE_KEYS.SAVED_ACCOUNTS);
      if (!raw) {
        raw = await AsyncStorage.getItem(STORAGE_KEYS.SAVED_ACCOUNTS);
      }
      if (raw) {
        return JSON.parse(raw) as SavedAccount[];
      }
      return [];
    } catch (e) {
      console.warn('Failed to get saved accounts:', e);
      return [];
    }
  },

  /**
   * Remove a specific account from saved records
   */
  removeSavedAccount: async (idOrEmail: string): Promise<SavedAccount[]> => {
    try {
      const existing = await storageService.getSavedAccounts();
      const updated = existing.filter(
        a => a.id !== idOrEmail && a.email.toLowerCase() !== idOrEmail.toLowerCase()
      );
      const serialized = JSON.stringify(updated);
      setWebItem(STORAGE_KEYS.SAVED_ACCOUNTS, serialized);
      await AsyncStorage.setItem(STORAGE_KEYS.SAVED_ACCOUNTS, serialized);
      return updated;
    } catch (e) {
      console.warn('Failed to remove saved account:', e);
      return [];
    }
  },
};

export default storageService;
