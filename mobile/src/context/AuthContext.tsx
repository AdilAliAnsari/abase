import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import authService, { UserProfile, AuthResponse, SocialLoginParams } from '../services/authService';
import storageService, { SavedAccount } from '../services/storageService';
import clerkService from '../services/clerkService';
import api, { getAuthToken, setAuthToken } from '../services/api';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  savedAccounts: SavedAccount[];
  isLoading: boolean;
  isAuthenticated: boolean;
  serverConnected: boolean;
  login: (emailOrUsername: string, password: string) => Promise<AuthResponse>;
  register: (email: string, username: string, password: string, name?: string) => Promise<AuthResponse>;
  socialLogin: (params: SocialLoginParams) => Promise<AuthResponse>;
  startClerkOAuth: (provider: 'google' | 'github') => Promise<string | undefined>;
  loginWithSavedAccount: (account: SavedAccount) => Promise<AuthResponse>;
  verifyEmail: (userId: string, code: string) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  refreshSavedAccounts: () => Promise<SavedAccount[]>;
  removeSavedAccount: (idOrEmail: string) => Promise<void>;
  checkServerConnection: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(getAuthToken());
  const [savedAccounts, setSavedAccounts] = useState<SavedAccount[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [serverConnected, setServerConnected] = useState<boolean>(false);

  const checkServerConnection = async (): Promise<boolean> => {
    try {
      const health = await api.checkHealth();
      setServerConnected(health.ok);
      return health.ok;
    } catch {
      setServerConnected(false);
      return false;
    }
  };

  const refreshSavedAccounts = async (): Promise<SavedAccount[]> => {
    try {
      const accounts = await authService.fetchSavedAccounts();
      setSavedAccounts(accounts);
      return accounts;
    } catch (e) {
      console.warn('Error fetching saved accounts:', e);
      return [];
    }
  };

  const refreshUser = async () => {
    try {
      // 1. First check permanent stored session for instant restore
      const activeSession = await storageService.getActiveSession();
      if (activeSession && activeSession.token && activeSession.user) {
        setToken(activeSession.token);
        setUser(activeSession.user);
        setAuthToken(activeSession.token);
      }

      // 2. Load permanent saved accounts
      await refreshSavedAccounts();

      // 3. Verify in background with backend if connected
      const currentToken = activeSession?.token || getAuthToken();
      if (currentToken) {
        const profile = await authService.getMe();
        if (profile) {
          setUser(profile);
          await storageService.saveActiveSession(currentToken, profile);
        }
      }
    } catch (err) {
      console.warn('Error refreshing user session:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkServerConnection();
    refreshUser();
  }, []);

  const login = async (emailOrUsername: string, password: string): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const res = await authService.login(emailOrUsername, password);
      if (res.token) {
        setToken(res.token);
      }
      if (res.user) {
        setUser(res.user);
      }
      await refreshSavedAccounts();
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, username: string, password: string): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const res = await authService.register(email, username, password);
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const socialLogin = async (params: SocialLoginParams): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const res = await authService.socialLogin(params);
      if (res.token) {
        setToken(res.token);
      }
      if (res.user) {
        setUser(res.user);
      }
      await refreshSavedAccounts();
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithSavedAccount = async (account: SavedAccount): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      let res: AuthResponse;
      if (account.provider === 'google' || account.provider === 'github') {
        res = await authService.socialLogin({
          provider: account.provider,
          email: account.email,
          username: account.username,
          name: account.name,
          avatar: account.avatar,
          accountId: account.socialId || account.email,
        });
      } else {
        // If local account with token
        if (account.token) {
          setAuthToken(account.token);
          const profile = await authService.getMe();
          if (profile) {
            setToken(account.token);
            setUser(profile);
            await storageService.saveActiveSession(account.token, profile);
            await refreshSavedAccounts();
            return { success: true, token: account.token, user: profile };
          }
        }
        res = {
          success: false,
          message: 'Please enter your password for this account',
        };
      }

      if (res.token) {
        setToken(res.token);
      }
      if (res.user) {
        setUser(res.user);
      }
      await refreshSavedAccounts();
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const removeSavedAccount = async (idOrEmail: string) => {
    const updated = await storageService.removeSavedAccount(idOrEmail);
    setSavedAccounts(updated);
  };

  const verifyEmail = async (userId: string, code: string): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const res = await authService.verifyEmail(userId, code);
      if (res.token) {
        setToken(res.token);
      }
      if (res.user) {
        setUser(res.user);
      }
      await refreshSavedAccounts();
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const startClerkOAuth = async (provider: 'google' | 'github'): Promise<string | undefined> => {
    return clerkService.startOAuth(provider);
  };

  const logout = async () => {
    await clerkService.signOut();
    await authService.logout();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        savedAccounts,
        isLoading,
        isAuthenticated: !!token || !!user,
        serverConnected,
        login,
        register,
        socialLogin,
        startClerkOAuth,
        loginWithSavedAccount,
        verifyEmail,
        logout,
        refreshUser,
        refreshSavedAccounts,
        removeSavedAccount,
        checkServerConnection,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
