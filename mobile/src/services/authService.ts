import api, { setAuthToken, getAuthToken } from './api';
import storageService, { SavedAccount } from './storageService';
import clerkService from './clerkService';

export interface UserProfile {
  id: string;
  _id?: string;
  clerkId?: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  profileImage?: string;
  role?: string;
  provider?: 'google' | 'github' | 'local' | 'clerk';
  socialId?: string;
  isEmailVerified?: boolean;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: UserProfile;
  userId?: string;
  email?: string;
  devOtp?: string;
  needsVerification?: boolean;
  isNewUser?: boolean;
}

export interface SocialLoginParams {
  provider: 'google' | 'github';
  email?: string;
  username?: string;
  name?: string;
  avatar?: string;
  accountId?: string;
}

export const authService = {
  /**
   * Register a new account (uses Clerk Authentication)
   */
  register: async (email: string, username: string, password: string, name?: string): Promise<AuthResponse> => {
    try {
      // 1. Try Clerk native registration
      const res = await clerkService.signUp({
        email,
        username,
        password,
        name,
      });
      if (res.token) {
        setAuthToken(res.token);
      }
      return res;
    } catch (clerkErr: any) {
      console.warn('Clerk register fallback to standard register:', clerkErr.message);
      // Fallback to standard register if Clerk network/rate limits occur
      const res = await api.post<AuthResponse>('/api/auth/register', {
        email,
        username,
        password,
      });
      return res.data;
    }
  },

  /**
   * Log in with email or username + password (uses Clerk Authentication)
   */
  login: async (emailOrUsername: string, password: string): Promise<AuthResponse> => {
    try {
      // 1. Authenticate via Clerk
      const clerkRes = await clerkService.signIn({
        identifier: emailOrUsername,
        password,
      });
      if (clerkRes.token) {
        setAuthToken(clerkRes.token);
      }
      return clerkRes;
    } catch (clerkErr: any) {
      console.warn('Clerk sign-in error, trying fallback login:', clerkErr.message);
      // Fallback
      const res = await api.post<AuthResponse>('/api/auth/login', {
        email: emailOrUsername,
        password,
      });

      if (res.data.token && res.data.user) {
        setAuthToken(res.data.token);
        await storageService.saveActiveSession(res.data.token, res.data.user);
        await storageService.addSavedAccount({
          id: res.data.user.id || (res.data.user as any)._id,
          email: res.data.user.email,
          username: res.data.user.username,
          name: res.data.user.firstName || res.data.user.username,
          avatar: res.data.user.profileImage,
          provider: 'local',
          lastUsedAt: new Date().toISOString(),
          token: res.data.token,
        });
      }
      return res.data;
    }
  },

  /**
   * Log in or register with Google or GitHub account via Clerk & Social Bridge
   */
  socialLogin: async (params: SocialLoginParams): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>('/api/auth/social-account', params);

    if (res.data.token && res.data.user) {
      setAuthToken(res.data.token);
      // Persist active permanent session
      await storageService.saveActiveSession(res.data.token, res.data.user);
      // Add to permanent recorded accounts list
      await storageService.addSavedAccount({
        id: res.data.user.id || (res.data.user as any)._id,
        clerkId: res.data.user.clerkId,
        email: res.data.user.email,
        username: res.data.user.username,
        name: res.data.user.name || res.data.user.firstName || res.data.user.username,
        avatar: res.data.user.profileImage,
        provider: params.provider,
        socialId: params.email || params.username || params.accountId,
        lastUsedAt: new Date().toISOString(),
        token: res.data.token,
      });
    }
    return res.data;
  },

  /**
   * Fetch all registered accounts (combines backend records and local device records)
   */
  fetchSavedAccounts: async (): Promise<SavedAccount[]> => {
    const localAccounts = await storageService.getSavedAccounts();
    try {
      const res = await api.get<{ success: boolean; accounts: SavedAccount[] }>('/api/auth/saved-accounts');
      if (res.success && Array.isArray(res.accounts)) {
        // Merge without duplicates (favor local token if present)
        const accountMap = new Map<string, SavedAccount>();
        res.accounts.forEach(acc => accountMap.set(acc.email.toLowerCase(), acc));
        localAccounts.forEach(acc => {
          const key = acc.email.toLowerCase();
          const existing = accountMap.get(key);
          accountMap.set(key, { ...existing, ...acc });
        });
        const merged = Array.from(accountMap.values());
        return merged;
      }
    } catch {
      // Fallback to local accounts if backend is unreachable
    }
    return localAccounts;
  },

  /**
   * Verify email with OTP code
   */
  verifyEmail: async (userId: string, code: string): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>('/api/auth/verify-email', {
      userId,
      code,
    });

    if (res.token && res.user) {
      setAuthToken(res.token);
      await storageService.saveActiveSession(res.token, res.user);
      await storageService.addSavedAccount({
        id: res.user.id || (res.user as any)._id,
        email: res.user.email,
        username: res.user.username,
        name: res.user.firstName || res.user.username,
        avatar: res.user.profileImage,
        provider: 'local',
        lastUsedAt: new Date().toISOString(),
        token: res.token,
      });
    }
    return res;
  },

  /**
   * Resend OTP verification code
   */
  resendCode: async (userId: string): Promise<AuthResponse> => {
    return api.post<AuthResponse>('/api/auth/resend-code', { userId });
  },

  /**
   * Request password reset OTP
   */
  forgotPassword: async (email: string): Promise<AuthResponse> => {
    return api.post<AuthResponse>('/api/auth/forgot-password', { email });
  },

  /**
   * Reset password with OTP code
   */
  resetPassword: async (email: string, code: string, newPassword: string): Promise<AuthResponse> => {
    return api.post<AuthResponse>('/api/auth/reset-password', {
      email,
      code,
      newPassword,
    });
  },

  /**
   * Fetch currently logged-in user profile
   */
  getMe: async (): Promise<UserProfile | null> => {
    const token = getAuthToken();
    if (!token) return null;

    try {
      const res = await api.get<{ success: boolean; user: UserProfile }>('/api/auth/me');
      return res.user || null;
    } catch {
      return null;
    }
  },

  /**
   * Log out and clear active session (preserves saved accounts list for future sign in)
   */
  logout: async () => {
    setAuthToken(null);
    await storageService.clearActiveSession();
  },
};

export default authService;
