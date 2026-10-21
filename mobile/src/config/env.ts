import { API_BASE_URL as ENV_API_BASE_URL, GOOGLE_WEB_CLIENT_ID as ENV_GOOGLE_WEB_CLIENT_ID } from '@env';

const DEV_FALLBACK_API = 'http://10.0.2.2:4000';
let configError: string | null = null;

function normalizeBaseUrl(url: string): string {
  return url.trim().replace(/\/$/, '');
}

function resolveApiBaseUrl(): string {
  const fromEnv = ENV_API_BASE_URL?.trim();

  if (fromEnv) {
    const base = normalizeBaseUrl(fromEnv);
    if (!__DEV__ && !/^https:\/\//i.test(base)) {
      configError =
        'Release builds require API_BASE_URL to use HTTPS (your Railway public URL).';
    }
    return base;
  }

  if (__DEV__) {
    return DEV_FALLBACK_API;
  }

  configError =
    'API_BASE_URL is required for release builds. Set it in mobile/.env to your Railway HTTPS URL.';
  return '';
}

function resolveGoogleWebClientId(): string {
  const fromEnv = ENV_GOOGLE_WEB_CLIENT_ID?.trim();
  if (fromEnv) {
    return fromEnv;
  }
  if (__DEV__) {
    return '';
  }
  return '';
}

/** Device/emulator/production API base URL — set in mobile/.env */
export const API_BASE_URL = resolveApiBaseUrl();
export const CONFIG_ERROR = configError;

/**
 * Must match GOOGLE_WEB_CLIENT_ID on the backend (Web OAuth client).
 * Empty disables Google Sign-In until configured.
 */
export const GOOGLE_WEB_CLIENT_ID = resolveGoogleWebClientId();
