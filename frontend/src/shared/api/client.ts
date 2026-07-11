import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import { config } from '../config';

const TOKEN_KEY = 'ideago.accessToken';
const REFRESH_KEY = 'ideago.refreshToken';

export const tokenStore = {
  get access() {
    return localStorage.getItem(TOKEN_KEY);
  },
  get refresh() {
    return localStorage.getItem(REFRESH_KEY);
  },
  set(access: string, refresh: string) {
    localStorage.setItem(TOKEN_KEY, access);
    localStorage.setItem(REFRESH_KEY, refresh);
  },
  clear() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

function isAuthEndpoint(url?: string) {
  if (!url) return false;
  return url.includes('/auth/login') || url.includes('/auth/register') || url.includes('/auth/refresh');
}

export const api: AxiosInstance = axios.create({
  baseURL: `${config.apiUrl}/api/v1`,
  withCredentials: true,
  timeout: 15_000,
});

api.interceptors.request.use((cfg) => {
  const token = tokenStore.access;
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

let refreshing: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = tokenStore.refresh;
  if (!refreshToken) return null;
  try {
    const res = await axios.post(`${config.apiUrl}/api/v1/auth/refresh`, { refreshToken }, { timeout: 15_000 });
    const data = res.data?.data ?? res.data;
    tokenStore.set(data.accessToken, data.refreshToken);
    return data.accessToken;
  } catch {
    tokenStore.clear();
    return null;
  }
}

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (
      error.response?.status === 401 &&
      original &&
      !original._retry &&
      !isAuthEndpoint(original.url)
    ) {
      original._retry = true;
      refreshing = refreshing ?? refreshAccessToken();
      const newToken = await refreshing;
      refreshing = null;
      if (newToken) {
        original.headers = original.headers ?? {};
        (original.headers as Record<string, string>).Authorization = `Bearer ${newToken}`;
        return api(original);
      }
    }
    return Promise.reject(error);
  },
);

/** Unwraps the { success, data } envelope from the API. */
export async function unwrap<T>(promise: Promise<{ data: { data: T } }>): Promise<T> {
  const res = await promise;
  return res.data.data;
}

/** Extracts a human-readable message from an Axios error. */
export function errorMessage(err: unknown, fallback = 'Something went wrong'): string {
  const ax = err as AxiosError<{ message?: string | string[] }>;
  if (ax?.code === 'ECONNABORTED') {
    return 'The server took too long to respond. Please try again.';
  }
  if (!ax?.response) {
    return 'Cannot reach the server. Check that the API is running and try again.';
  }
  const msg = ax.response.data?.message;
  if (Array.isArray(msg)) return msg[0];
  return msg ?? fallback;
}
