import { Platform } from 'react-native';
import Constants from 'expo-constants';

declare const process: any;

let authToken: string | null = null;

// Determine API Base URL dynamically depending on platform & network
export const getApiBaseUrl = (): string => {
  // If explicitly specified in .env and running on web, use it
  if (process.env.EXPO_PUBLIC_API_URL && Platform.OS === 'web') {
    return process.env.EXPO_PUBLIC_API_URL.replace(/\/$/, '');
  }

  // If in web browser, connect to current host:3000 or localhost:3000
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.location && window.location.hostname) {
      return `http://${window.location.hostname}:3000`;
    }
    return 'http://localhost:3000';
  }

  // On Native (Expo Go / standalone):
  // Check Expo Constants for the debugger host IP
  const hostUri = Constants.expoConfig?.hostUri || (Constants as any).manifest?.debuggerHost;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
      return `http://${ip}:3000`;
    }
  }

  // Check explicit LAN IP in .env
  if (process.env.EXPO_PUBLIC_LAN_API_URL) {
    return process.env.EXPO_PUBLIC_LAN_API_URL.replace(/\/$/, '');
  }

  // Android emulator fallback
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000';
  }

  // LAN IP fallback
  return 'http://172.22.8.225:3000';
};

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
    if (token) {
      localStorage.setItem('abase_auth_token', token);
    } else {
      localStorage.removeItem('abase_auth_token');
    }
  }
};

export const getAuthToken = (): string | null => {
  if (authToken) return authToken;
  if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
    authToken = localStorage.getItem('abase_auth_token');
  }
  return authToken;
};

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: string[];
  [key: string]: any;
}

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number = 500, data: any = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

const TIMEOUT_MS = 10000;

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  const token = getAuthToken();
  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const contentType = response.headers.get('content-type') || '';
    let responseData: any = null;

    if (contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      const text = await response.text();
      responseData = { message: text };
    }

    if (!response.ok) {
      const errorMessage =
        responseData?.message ||
        responseData?.error ||
        responseData?.errors?.[0] ||
        `Request failed with status ${response.status}`;
      throw new ApiError(errorMessage, response.status, responseData);
    }

    return responseData as T;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new ApiError('Request timed out. Please check your backend connection.', 408);
    }
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error.message || 'Network error: could not connect to backend',
      0,
      error
    );
  }
}

export const api = {
  get: <T = any>(endpoint: string, params?: Record<string, any>) => {
    let url = endpoint;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          searchParams.append(key, String(val));
        }
      });
      const qs = searchParams.toString();
      if (qs) url += (url.includes('?') ? '&' : '?') + qs;
    }
    return apiRequest<T>(url, { method: 'GET' });
  },

  post: <T = any>(endpoint: string, data?: any) => {
    return apiRequest<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  put: <T = any>(endpoint: string, data?: any) => {
    return apiRequest<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  patch: <T = any>(endpoint: string, data?: any) => {
    return apiRequest<T>(endpoint, { method: 'PATCH', body: data ? JSON.stringify(data) : undefined });
  },

  delete: <T = any>(endpoint: string) => {
    return apiRequest<T>(endpoint, { method: 'DELETE' });
  },

  checkHealth: async (): Promise<{ ok: boolean; status?: string; message?: string }> => {
    try {
      const res = await apiRequest<any>('/api/health', { method: 'GET' });
      return { ok: true, status: res.status, message: 'Connected' };
    } catch (err: any) {
      return { ok: false, message: err.message };
    }
  },
};

export default api;
