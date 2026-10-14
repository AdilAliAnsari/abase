import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import api from './api';
import storageService, { SavedAccount } from './storageService';
import { UserProfile, AuthResponse } from './authService';

export const CLERK_PUBLISHABLE_KEY =
  process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ||
  'pk_test_dG9sZXJhbnQtY2hpcG11bmstMzcuY2xlcmsuYWNjb3VudHMuZGV2JA';

export const CLERK_FAPI_BASE = 'https://tolerant-chipmunk-37.clerk.accounts.dev/v1';

export interface ClerkSignInParams {
  identifier: string;
  password: string;
}

export interface ClerkSignUpParams {
  email: string;
  username?: string;
  password: string;
  name?: string;
  phone?: string;
}

export interface ClerkOAuthResult {
  url?: string;
  strategy: 'oauth_google' | 'oauth_github';
  expireAt?: number;
}

export const clerkService = {
  /**
   * Get Clerk environment status
   */
  isConfigured: () => {
    return Boolean(CLERK_PUBLISHABLE_KEY);
  },

  /**
   * Sign in via Clerk (Email/Username + Password)
   */
  signIn: async ({ identifier, password }: ClerkSignInParams): Promise<AuthResponse> => {
    try {
      const res = await api.post<AuthResponse>('/api/auth/clerk-signin', {
        identifier,
        password,
      });

      if (res.data.token && res.data.user) {
        // Save active permanent session
        await storageService.saveActiveSession(res.data.token, res.data.user);

        // Record account in device storage
        await storageService.saveAccountRecord({
          id: res.data.user.id || (res.data.user as any)._id,
          email: res.data.user.email,
          username: res.data.user.username,
          name: res.data.user.name,
          avatar: res.data.user.profileImage,
          provider: 'clerk',
          clerkId: res.data.user.clerkId,
        });
      }

      return res.data;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Clerk sign in failed';
      throw new Error(msg);
    }
  },

  /**
   * Sign up a new user via Clerk
   */
  signUp: async (params: ClerkSignUpParams): Promise<AuthResponse> => {
    try {
      const res = await api.post<AuthResponse>('/api/auth/clerk-signup', params);

      if (res.data.token && res.data.user) {
        await storageService.saveActiveSession(res.data.token, res.data.user);
        await storageService.saveAccountRecord({
          id: res.data.user.id || (res.data.user as any)._id,
          email: res.data.user.email,
          username: res.data.user.username,
          name: res.data.user.name,
          avatar: res.data.user.profileImage,
          provider: 'clerk',
          clerkId: res.data.user.clerkId,
        });
      }

      return res.data;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Clerk registration failed';
      throw new Error(msg);
    }
  },

  /**
   * Sync a frontend-authenticated Clerk user into backend & MongoDB
   */
  syncWithBackend: async (params: {
    clerkId: string;
    email: string;
    username?: string;
    name?: string;
    avatar?: string;
    provider?: string;
    token?: string;
  }): Promise<AuthResponse> => {
    try {
      const res = await api.post<AuthResponse>('/api/auth/clerk-sync', params);

      if (res.data.token && res.data.user) {
        await storageService.saveActiveSession(res.data.token, res.data.user);
        await storageService.saveAccountRecord({
          id: res.data.user.id || (res.data.user as any)._id,
          email: res.data.user.email,
          username: res.data.user.username,
          name: res.data.user.name,
          avatar: res.data.user.profileImage,
          provider: res.data.user.provider || 'clerk',
          clerkId: res.data.user.clerkId || params.clerkId,
        });
      }

      return res.data;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to sync Clerk account';
      throw new Error(msg);
    }
  },

  /**
   * Initiate Clerk OAuth for Google or GitHub
   */
  getOAuthUrl: async (provider: 'google' | 'github'): Promise<ClerkOAuthResult> => {
    const strategy = provider === 'google' ? 'oauth_google' : 'oauth_github';
    const redirectUrl = Platform.OS === 'web' && typeof window !== 'undefined'
      ? `${window.location.origin}/auth/callback`
      : 'abase://auth/callback';

    const resp = await fetch(`${CLERK_FAPI_BASE}/client/sign_ins?_is_native=true`, {
      method: 'POST',
      headers: {
        'Authorization': CLERK_PUBLISHABLE_KEY,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `strategy=${strategy}&redirect_url=${encodeURIComponent(redirectUrl)}`,
    });

    const data = await resp.json();
    const verification = data.response?.first_factor_verification;
    const url = verification?.external_verification_redirect_url;

    return {
      url,
      strategy,
      expireAt: verification?.expire_at,
    };
  },

  /**
   * Open Clerk OAuth flow on Web or Native
   */
  startOAuth: async (provider: 'google' | 'github'): Promise<string | undefined> => {
    const { url } = await clerkService.getOAuthUrl(provider);
    if (!url) {
      throw new Error(`Could not generate Clerk ${provider} authorization link.`);
    }

    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') {
        const popup = window.open(url, `clerk_${provider}_oauth`, 'width=600,height=700');
        if (!popup) {
          window.location.href = url;
        }
      }
    } else {
      await WebBrowser.openAuthSessionAsync(url, 'abase://auth/callback');
    }

    return url;
  },

  /**
   * Sign out from Clerk
   */
  signOut: async (): Promise<void> => {
    await storageService.clearActiveSession();
  },
};

export default clerkService;
