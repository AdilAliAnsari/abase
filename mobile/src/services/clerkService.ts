import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import api, { setAuthToken } from './api';
import storageService, { SavedAccount } from './storageService';
import { UserProfile, AuthResponse } from './authService';

declare const process: any;

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

      if (res.token && res.user) {
        setAuthToken(res.token);
        await storageService.saveActiveSession(res.token, res.user);
        await storageService.addSavedAccount({
          id: res.user.id || (res.user as any)._id,
          email: res.user.email,
          username: res.user.username,
          name: res.user.name || res.user.username,
          avatar: res.user.profileImage,
          provider: 'clerk',
          clerkId: res.user.clerkId,
          lastUsedAt: new Date().toISOString(),
          token: res.token,
        });
      }

      return res;
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

      if (res.token && res.user) {
        setAuthToken(res.token);
        await storageService.saveActiveSession(res.token, res.user);
        await storageService.addSavedAccount({
          id: res.user.id || (res.user as any)._id,
          email: res.user.email,
          username: res.user.username,
          name: res.user.name || res.user.username,
          avatar: res.user.profileImage,
          provider: 'clerk',
          clerkId: res.user.clerkId,
          lastUsedAt: new Date().toISOString(),
          token: res.token,
        });
      }

      return res;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Clerk registration failed';
      throw new Error(msg);
    }
  },

  /**
   * Resolve an active Clerk session (e.g. created after real Google or GitHub OAuth)
   */
  resolveSession: async (sessionId: string): Promise<AuthResponse> => {
    try {
      const res = await api.post<AuthResponse>('/api/auth/clerk-session', { sessionId });

      if (res.token && res.user) {
        setAuthToken(res.token);
        await storageService.saveActiveSession(res.token, res.user);
        await storageService.addSavedAccount({
          id: res.user.id || (res.user as any)._id,
          email: res.user.email,
          username: res.user.username,
          name: res.user.name || res.user.username,
          avatar: res.user.profileImage,
          provider: (res.user.provider as any) || 'google',
          clerkId: res.user.clerkId,
          lastUsedAt: new Date().toISOString(),
          token: res.token,
        });
      }

      return res;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to resolve Clerk session';
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

      if (res.token && res.user) {
        setAuthToken(res.token);
        await storageService.saveActiveSession(res.token, res.user);
        await storageService.addSavedAccount({
          id: res.user.id || (res.user as any)._id,
          email: res.user.email,
          username: res.user.username,
          name: res.user.name || res.user.username,
          avatar: res.user.profileImage,
          provider: (res.user.provider as any) || 'clerk',
          clerkId: res.user.clerkId || params.clerkId,
          lastUsedAt: new Date().toISOString(),
          token: res.token,
        });
      }

      return res;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to sync Clerk account';
      throw new Error(msg);
    }
  },

  /**
   * Initiate Clerk OAuth for real Google or GitHub ID login
   */
  getOAuthUrl: async (provider: 'google' | 'github'): Promise<ClerkOAuthResult> => {
    const strategy = provider === 'google' ? 'oauth_google' : 'oauth_github';
    const redirectUrl =
      Platform.OS === 'web' && typeof window !== 'undefined'
        ? window.location.origin
        : 'abase://auth/callback';

    const resp = await fetch(`${CLERK_FAPI_BASE}/client/sign_ins?_is_native=true`, {
      method: 'POST',
      headers: {
        Authorization: CLERK_PUBLISHABLE_KEY,
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
   * Launch Real Google or GitHub OAuth flow
   */
  startOAuth: async (provider: 'google' | 'github'): Promise<AuthResponse | undefined> => {
    const { url } = await clerkService.getOAuthUrl(provider);
    if (!url) {
      throw new Error(`Could not generate real ${provider} authorization link.`);
    }

    if (Platform.OS === 'web') {
      if (typeof window === 'undefined') return undefined;

      return new Promise<AuthResponse | undefined>((resolve, reject) => {
        const width = 520;
        const height = 640;
        const left = Math.max(0, (window.innerWidth - width) / 2 + window.screenX);
        const top = Math.max(0, (window.innerHeight - height) / 2 + window.screenY);

        const popup = window.open(
          url,
          `clerk_${provider}_real_oauth`,
          `width=${width},height=${height},left=${left},top=${top},status=no,resizable=yes,scrollbars=yes`
        );

        // Fallback to full page redirect if popup is blocked
        if (!popup || popup.closed || typeof popup.closed === 'undefined') {
          window.location.href = url;
          return;
        }

        let cleanupDone = false;
        const cleanup = () => {
          if (cleanupDone) return;
          cleanupDone = true;
          window.removeEventListener('message', messageListener);
          clearInterval(pollTimer);
        };

        const messageListener = async (event: MessageEvent) => {
          if (event.data?.type === 'CLERK_OAUTH_SESSION' && event.data?.sessionId) {
            cleanup();
            try {
              if (!popup.closed) popup.close();
            } catch {}
            try {
              const authRes = await clerkService.resolveSession(event.data.sessionId);
              resolve(authRes);
            } catch (err) {
              reject(err);
            }
          }
        };

        window.addEventListener('message', messageListener);

        // Poll for popup closing or session detection
        const pollTimer = setInterval(async () => {
          if (popup.closed) {
            cleanup();
            // Check if current window or localStorage received session
            try {
              const active = await storageService.getActiveSession();
              if (active?.user && active?.token) {
                resolve({ success: true, token: active.token, user: active.user });
                return;
              }
            } catch {}
            resolve(undefined);
          }
        }, 1000);
      });
    } else {
      // Mobile Native flow
      const result = await WebBrowser.openAuthSessionAsync(url, 'abase://auth/callback');
      if (result.type === 'success' && result.url) {
        const urlObj = new URL(result.url);
        const sessionId = urlObj.searchParams.get('__clerk_created_session');
        if (sessionId) {
          return clerkService.resolveSession(sessionId);
        }
      }
      return undefined;
    }
  },

  /**
   * Check if current page is returning from a real Google/Clerk OAuth redirect
   */
  checkOAuthCallback: async (): Promise<AuthResponse | null> => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return null;

    try {
      const searchParams = new URLSearchParams(window.location.search);
      const sessionId =
        searchParams.get('__clerk_created_session') ||
        searchParams.get('created_session_id') ||
        searchParams.get('sessionId');
      const clerkStatus = searchParams.get('__clerk_status');

      if (sessionId || clerkStatus === 'verified') {
        // If this page was opened inside a popup
        if (window.opener && window.opener !== window) {
          window.opener.postMessage(
            {
              type: 'CLERK_OAUTH_SESSION',
              sessionId: sessionId || '',
              status: clerkStatus,
            },
            '*'
          );
          window.close();
          return null;
        }

        if (sessionId) {
          // Resolve session in main window
          const res = await clerkService.resolveSession(sessionId);
          // Clean up the URL in browser bar
          const cleanUrl = window.location.pathname + window.location.hash;
          window.history.replaceState({}, document.title, cleanUrl);
          return res;
        }
      }
    } catch (e) {
      console.warn('OAuth callback check notice:', e);
    }
    return null;
  },

  /**
   * Sign out from Clerk
   */
  signOut: async (): Promise<void> => {
    await storageService.clearActiveSession();
  },
};

export default clerkService;
