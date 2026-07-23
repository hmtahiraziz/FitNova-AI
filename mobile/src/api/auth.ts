import { apiRequest } from './client';
import type { AuthClientInfo } from '../lib/deviceClient';

export type AuthUser = {
  id: string;
  email: string;
  hasGoogle: boolean;
};

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  /** Legacy alias for accessToken */
  token?: string;
  user: AuthUser;
};

function normalizeAuthResponse(raw: AuthResponse): {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
} {
  const accessToken = raw.accessToken ?? raw.token ?? '';
  if (!accessToken || !raw.refreshToken) {
    throw new Error('Invalid auth response from server');
  }
  return {
    accessToken,
    refreshToken: raw.refreshToken,
    user: raw.user,
  };
}

async function authPost<T extends AuthResponse>(
  path: string,
  body: Record<string, unknown>,
) {
  const raw = await apiRequest<T>(path, {
    method: 'POST',
    body,
    skipAuth: true,
    skipRefresh: true,
  });
  return normalizeAuthResponse(raw);
}

export function register(
  email: string,
  password: string,
  client: AuthClientInfo,
) {
  return authPost('/auth/register', { email, password, ...client });
}

export function login(email: string, password: string, client: AuthClientInfo) {
  return authPost('/auth/login', { email, password, ...client });
}

export function loginWithGoogle(idToken: string, client: AuthClientInfo) {
  return authPost('/auth/google', { idToken, ...client });
}

export function refreshAuth(refreshToken: string) {
  return authPost('/auth/refresh', { refreshToken });
}

export function logoutSession(refreshToken: string) {
  return apiRequest<{ message: string }>('/auth/logout', {
    method: 'POST',
    body: { refreshToken },
    skipAuth: true,
    skipRefresh: true,
  });
}

export function forgotPassword(email: string) {
  return apiRequest<{ message: string; devCode?: string }>(
    '/auth/forgot-password',
    {
      method: 'POST',
      body: { email },
      skipAuth: true,
      skipRefresh: true,
    },
  );
}

export function resetPassword(
  email: string,
  code: string,
  newPassword: string,
) {
  return apiRequest<{ message: string }>('/auth/reset-password', {
    method: 'POST',
    body: { email, code, newPassword },
    skipAuth: true,
    skipRefresh: true,
  });
}

export function fetchMe() {
  return apiRequest<{ user: AuthUser }>('/auth/me');
}

export function deleteAccount(body: {
  confirmation: 'DELETE';
  password?: string;
}) {
  return apiRequest<{ message: string }>('/auth/account', {
    method: 'DELETE',
    body,
  });
}
