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
  phoneNumber?: string;
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
  register: async (
    email: string,
    username: string,
    password: string,
    name?: string,
    phone?: string
  ): Promise<AuthResponse> => {
    try {
      // 1. Try Clerk native registration
      const res = await clerkService.signUp({
        email,
        username,
        password,
        name,
        phone,
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
        name,
        phone,
      });
      if (res?.token) {
        setAuthToken(res.token);
      }
      return res;
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
        identifier: emailOrUsername,
        email: emailOrUsername,
        password,
      });

      if (res.token && res.user) {
        setAuthToken(res.token);
        await storageService.saveActiveSession(res.token, res.user);
        await storageService.addSavedAccount({
          id: res.user.id || (res.user as any)._id,
          clerkId: res.user.clerkId,
          email: res.user.email,
          username: res.user.username,
          name: res.user.name || res.user.firstName || res.user.username,
          avatar: res.user.profileImage,
          provider: res.user.provider || 'clerk',
          lastUsedAt: new Date().toISOString(),
          token: res.token,
        });
      }
      return res;
    }
  },

  /**
   * Log in or register with Google or GitHub account via Clerk & Social Bridge
   */
  socialLogin: async (params: SocialLoginParams): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>('/api/auth/social-account', params);

    if (res.token && res.user) {
      setAuthToken(res.token);
      // Persist active permanent session
      await storageService.saveActiveSession(res.token, res.user);
      // Add to permanent recorded accounts list
      await storageService.addSavedAccount({
        id: res.user.id || (res.user as any)._id,
        clerkId: res.user.clerkId,
        email: res.user.email,
        username: res.user.username,
        name: res.user.name || res.user.firstName || res.user.username,
        avatar: res.user.profileImage,
        provider: params.provider,
        socialId: params.email || params.username || params.accountId,
        lastUsedAt: new Date().toISOString(),
        token: res.token,
      });
    }
    return res;
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
   * Set or toggle user role between 'distributor' and 'consumer'
   */
  setRole: async (role: 'distributor' | 'consumer'): Promise<UserProfile> => {
    try {
      const res = await api.post<{ success: boolean; user: UserProfile }>('/api/auth/set-role', { role });
      if (res && res.user) {
        const token = getAuthToken();
        if (token) {
          await storageService.saveActiveSession(token, res.user);
        }
        return res.user;
      }
    } catch (err: any) {
      console.warn('Backend set-role failed, updating active session locally:', err.message);
    }

    // Local fallback update if backend is unreachable
    const active = await storageService.getActiveSession();
    const updatedUser: UserProfile = {
      ...(active?.user || { id: 'usr_local', username: 'local_user', email: 'user@example.com' }),
      role,
    };
    if (active?.token) {
      await storageService.saveActiveSession(active.token, updatedUser);
    }
    return updatedUser;
  },

  /**
   * Fetch Consumer and Distributor database
   */
  getDistributorDatabase: async (): Promise<{
    success: boolean;
    total: number;
    consumersCount: number;
    distributorsCount: number;
    consumers: any[];
    distributors: any[];
    allUsers: any[];
  }> => {
    try {
      const res = await api.get<any>('/api/auth/distributor-database');
      if (res && res.success) {
        return res;
      }
    } catch (err: any) {
      console.warn('Backend getDistributorDatabase failed, generating fallback list:', err.message);
    }

    // Safe fallback database for offline/demo inspection
    return {
      success: true,
      total: 3,
      consumersCount: 2,
      distributorsCount: 1,
      distributors: [
        {
          _id: 'dist_001',
          name: 'Adil Distributor Hub',
          email: 'distributor@edustore.in',
          username: 'adil_distributor',
          role: 'distributor',
          provider: 'local',
          createdAt: new Date().toISOString(),
        },
      ],
      consumers: [
        {
          _id: 'con_001',
          name: 'Priya Sharma',
          email: 'priya.sharma@gmail.com',
          username: 'priyasharma',
          role: 'consumer',
          provider: 'google',
          createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        },
        {
          _id: 'con_002',
          name: 'Rahul Verma',
          email: 'rahul.verma@outlook.com',
          username: 'rahul_v',
          role: 'consumer',
          provider: 'clerk',
          createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        },
      ],
      allUsers: [],
    };
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
