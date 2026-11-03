import axios, {
  type AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios';
import { API_BASE_URL } from '../config/env';
import { useAuthStore } from '../store/authStore';

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

type ApiRequestConfig = AxiosRequestConfig & {
  skipAuth?: boolean;
  skipRefresh?: boolean;
  body?: unknown;
};

const http = axios.create({
  baseURL: API_BASE_URL,
  headers: { Accept: 'application/json' },
  timeout: 15_000,
});

let refreshInFlight: Promise<string | null> | null = null;

function extractErrorMessage(data: unknown, status: number): string {
  if (
    typeof data === 'object' &&
    data &&
    'error' in data &&
    typeof (data as { error: unknown }).error === 'string'
  ) {
    return (data as { error: string }).error;
  }
  return `Request failed (${status})`;
}

function toApiError(err: unknown): ApiError {
  if (err instanceof ApiError) {
    return err;
  }
  if (axios.isAxiosError(err)) {
    const ax = err as AxiosError<{ error?: string }>;
    if (ax.response) {
      const data = ax.response.data as { error?: string; details?: unknown };
      return new ApiError(
        extractErrorMessage(ax.response.data, ax.response.status),
        ax.response.status,
        data?.details ?? ax.response.data,
      );
    }
    const reason = ax.message || 'Network request failed';
    // Production: short offline-friendly copy. Dev: include host for debugging.
    if (__DEV__) {
      return new ApiError(
        `Cannot reach API at ${API_BASE_URL} (${reason}). Check Wi‑Fi, firewall, and that the backend is running.`,
        0,
        err,
      );
    }
    return new ApiError(
      'You appear to be offline. Check your connection and try again.',
      0,
      err,
    );
  }
  return new ApiError('Something went wrong', 0, err);
}

http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const meta = config as InternalAxiosRequestConfig & {
    skipAuth?: boolean;
  };
  if (!meta.skipAuth) {
    const token =
      meta.headers?.Authorization != null
        ? null
        : useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as InternalAxiosRequestConfig & {
      skipAuth?: boolean;
      skipRefresh?: boolean;
      _retried?: boolean;
    };

    if (
      error.response?.status === 401 &&
      config &&
      !config.skipAuth &&
      !config.skipRefresh &&
      !config._retried
    ) {
      config._retried = true;
      if (!refreshInFlight) {
        refreshInFlight = useAuthStore
          .getState()
          .refreshSession()
          .finally(() => {
            refreshInFlight = null;
          });
      }
      const newToken = await refreshInFlight;
      if (newToken) {
        config.headers.Authorization = `Bearer ${newToken}`;
        return http(config);
      }
      useAuthStore.getState().handleSessionExpired();
    }

    return Promise.reject(toApiError(error));
  },
);

export function getAccessToken(): string | null {
  return useAuthStore.getState().token;
}

export async function apiRequest<T>(
  path: string,
  {
    method = 'GET',
    body,
    token,
    skipAuth = false,
    skipRefresh = false,
    headers,
    timeout,
  }: {
    method?: string;
    body?: unknown;
    token?: string | null;
    skipAuth?: boolean;
    skipRefresh?: boolean;
    headers?: Record<string, string>;
    /** Override default axios timeout (ms). Plan generate needs longer. */
    timeout?: number;
  } = {},
): Promise<T> {
  try {
    const config: ApiRequestConfig = {
      url: path,
      method,
      skipAuth,
      skipRefresh,
      headers: { ...headers },
      ...(timeout != null ? { timeout } : {}),
    };

    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    if (body !== undefined) {
      config.data = body;
      config.headers = {
        'Content-Type': 'application/json',
        ...config.headers,
      };
    }

    const res = await http.request<T>(config);
    return res.data;
  } catch (err) {
    throw toApiError(err);
  }
}

export async function apiUpload<T>(
  path: string,
  formData: FormData,
  method: 'POST' | 'DELETE' = 'POST',
): Promise<T> {
  try {
    const res = await http.request<T>({
      url: path,
      method,
      data: formData,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  } catch (err) {
    throw toApiError(err);
  }
}

export { http as apiHttp };
